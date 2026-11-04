import { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { apologyConfig } from '../../../config/apologyConfig';
import { retroAudio } from '../../../utils/retroAudio';
import { loadState, saveState } from '../../../utils/storage';

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  isBoss: boolean;
  damage: number;
  text?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  life: number;
  color: string;
}

type GameState = 'title' | 'playing' | 'paused' | 'victory' | 'defeat';

const CANVAS_WIDTH = 560;
const CANVAS_HEIGHT = 360;

interface InternalGameState {
  player: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    speed: number;
    radius: number;
    hp: number;
    maxHp: number;
  };
  boss: {
    x: number;
    y: number;
    vy: number;
    hp: number;
    maxHp: number;
    radius: number;
    phase: number;
    shootTimer: number;
    quoteTimer: number;
  };
  projectiles: Projectile[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  keys: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    attack1: boolean;
    attack2: boolean;
  };
  lastAttackTime1: number;
  lastAttackTime2: number;
  score: number;
  gameState: GameState;
}

// Standalone particle helper
function addParticles(state: InternalGameState, x: number, y: number, color: string, count = 12) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 4;
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 25 + Math.random() * 15,
      color,
      size: 2 + Math.random() * 3,
    });
  }
}

// Standalone floating text helper
function addFloatingText(state: InternalGameState, x: number, y: number, text: string, color = '#ffeb3b') {
  state.floatingTexts.push({
    x,
    y,
    text,
    life: 40,
    color,
  });
}

export const BossFight = () => {
  const { bossFight } = apologyConfig;

  // Persisted high score
  const [highScore, setHighScore] = useState<number>(() =>
    loadState<number>('boss_fight_highscore', 0)
  );

  const [gameState, setGameState] = useState<GameState>('title');
  const [score, setScore] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const [bossHp, setBossHp] = useState(500);
  const [bossDialogue, setBossDialogue] = useState('“I AM NEVER WRONG!”');
  const [cooldown1, setCooldown1] = useState(0);
  const [cooldown2, setCooldown2] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const gameLoopRef = useRef<() => void>(() => {});
  const togglePauseRef = useRef<() => void>(() => {});

  // Game internal mutable state
  const stateRef = useRef<InternalGameState>({
    player: {
      x: 100,
      y: CANVAS_HEIGHT / 2,
      vx: 0,
      vy: 0,
      speed: 4.5,
      radius: 16,
      hp: 100,
      maxHp: 100,
    },
    boss: {
      x: CANVAS_WIDTH - 120,
      y: CANVAS_HEIGHT / 2,
      vy: 2.2,
      hp: 500,
      maxHp: 500,
      radius: 42,
      phase: 0,
      shootTimer: 0,
      quoteTimer: 0,
    },
    projectiles: [],
    particles: [],
    floatingTexts: [],
    keys: {
      up: false,
      down: false,
      left: false,
      right: false,
      attack1: false,
      attack2: false,
    },
    lastAttackTime1: 0,
    lastAttackTime2: 0,
    score: 0,
    gameState: 'title',
  });

  const fireAttack1 = useCallback(() => {
    const s = stateRef.current;
    const now = Date.now();
    if (now - s.lastAttackTime1 < 220) return;
    s.lastAttackTime1 = now;

    retroAudio.playLaser();
    s.projectiles.push({
      x: s.player.x + 20,
      y: s.player.y,
      vx: 8.5,
      vy: 0,
      radius: 6,
      color: '#ff4081',
      isBoss: false,
      damage: 18,
      text: '♥',
    });
  }, []);

  const fireAttack2 = useCallback(() => {
    const s = stateRef.current;
    const now = Date.now();
    if (now - s.lastAttackTime2 < 1200) return;
    s.lastAttackTime2 = now;

    retroAudio.playTone(550, 0.25, 'triangle', 0.2);
    [-0.3, 0, 0.3].forEach(angle => {
      s.projectiles.push({
        x: s.player.x + 20,
        y: s.player.y,
        vx: Math.cos(angle) * 7,
        vy: Math.sin(angle) * 7,
        radius: 9,
        color: '#ffeb3b',
        isBoss: false,
        damage: 35,
        text: 'SORRY!',
      });
    });
    addFloatingText(s, s.player.x, s.player.y - 20, 'TRUTH BOMB!', '#ffff00');
  }, []);

  const togglePause = useCallback(() => {
    if (stateRef.current.gameState === 'playing') {
      stateRef.current.gameState = 'paused';
      setGameState('paused');
    } else if (stateRef.current.gameState === 'paused') {
      stateRef.current.gameState = 'playing';
      setGameState('playing');
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = requestAnimationFrame(() => gameLoopRef.current());
    }
  }, []);

  // Set up game loop & handlers in ref
  useEffect(() => {
    togglePauseRef.current = togglePause;
    gameLoopRef.current = () => {
      const s = stateRef.current;
      if (s.gameState !== 'playing') return;

      const ctx = canvasRef.current?.getContext('2d');

      // 1. Player movement
      let dx = 0;
      let dy = 0;
      if (s.keys.up) dy -= 1;
      if (s.keys.down) dy += 1;
      if (s.keys.left) dx -= 1;
      if (s.keys.right) dx += 1;

      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      s.player.x += dx * s.player.speed;
      s.player.y += dy * s.player.speed;

      s.player.x = Math.max(s.player.radius + 4, Math.min(CANVAS_WIDTH / 2 - 20, s.player.x));
      s.player.y = Math.max(s.player.radius + 4, Math.min(CANVAS_HEIGHT - s.player.radius - 4, s.player.y));

      if (s.keys.attack1) fireAttack1();
      if (s.keys.attack2) fireAttack2();

      // 2. Boss movement
      s.boss.y += s.boss.vy;
      if (s.boss.y < 60 || s.boss.y > CANVAS_HEIGHT - 60) {
        s.boss.vy *= -1;
      }

      s.boss.shootTimer += 1;
      const shootInterval = s.boss.hp < 200 ? 35 : s.boss.hp < 350 ? 45 : 55;
      if (s.boss.shootTimer >= shootInterval) {
        s.boss.shootTimer = 0;
        const angle = Math.atan2(s.player.y - s.boss.y, s.player.x - s.boss.x);
        const excuses = ['“EXCUSE!”', '“PRIDE!”', '“LOGIC!”', '“LATER!”'];
        const chosenExcuse = excuses[Math.floor(Math.random() * excuses.length)];

        s.projectiles.push({
          x: s.boss.x - 30,
          y: s.boss.y,
          vx: Math.cos(angle) * 4.5,
          vy: Math.sin(angle) * 4.5,
          radius: 8,
          color: '#ff1744',
          isBoss: true,
          damage: 12,
          text: chosenExcuse,
        });
      }

      // Boss Phase Quotes
      s.boss.quoteTimer += 1;
      if (s.boss.quoteTimer > 180) {
        s.boss.quoteTimer = 0;
        const hpPct = (s.boss.hp / s.boss.maxHp) * 100;
        if (hpPct <= 25) {
          setBossDialogue(bossFight.phases[2]?.quote || '“I was so foolish!”');
        } else if (hpPct <= 50) {
          setBossDialogue(bossFight.phases[1]?.quote || '“Maybe I was wrong...”');
        } else if (hpPct <= 75) {
          setBossDialogue(bossFight.phases[0]?.quote || '“I had a reason!”');
        }
      }

      // 3. Projectiles
      for (let i = s.projectiles.length - 1; i >= 0; i--) {
        const p = s.projectiles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -20 || p.x > CANVAS_WIDTH + 20 || p.y < -20 || p.y > CANVAS_HEIGHT + 20) {
          s.projectiles.splice(i, 1);
          continue;
        }

        if (!p.isBoss) {
          const distBoss = Math.hypot(p.x - s.boss.x, p.y - s.boss.y);
          if (distBoss < p.radius + s.boss.radius) {
            retroAudio.playHit();
            s.boss.hp = Math.max(0, s.boss.hp - p.damage);
            s.score += p.damage * 10;
            setBossHp(s.boss.hp);
            setScore(s.score);
            setHighScore(prev => {
              if (s.score > prev) {
                saveState('boss_fight_highscore', s.score);
                return s.score;
              }
              return prev;
            });

            addParticles(s, p.x, p.y, p.color, 8);
            addFloatingText(s, p.x, p.y - 10, `-${p.damage}`, '#ff4081');
            s.projectiles.splice(i, 1);

            if (s.boss.hp <= 0) {
              s.gameState = 'victory';
              setGameState('victory');
              retroAudio.playVictoryFanfare();
              addParticles(s, s.boss.x, s.boss.y, '#ffd700', 40);
              return;
            }
            continue;
          }
        }

        if (p.isBoss) {
          const distPlayer = Math.hypot(p.x - s.player.x, p.y - s.player.y);
          if (distPlayer < p.radius + s.player.radius) {
            retroAudio.playHit();
            s.player.hp = Math.max(0, s.player.hp - p.damage);
            setPlayerHp(s.player.hp);
            addParticles(s, p.x, p.y, '#ff1744', 8);
            addFloatingText(s, p.x, p.y - 10, `OUCH!`, '#ff1744');
            s.projectiles.splice(i, 1);

            if (s.player.hp <= 0) {
              s.gameState = 'defeat';
              setGameState('defeat');
              retroAudio.playBusyTone();
              return;
            }
            continue;
          }
        }
      }

      // 4. Particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const part = s.particles[i];
        part.x += part.vx;
        part.y += part.vy;
        part.life -= 1;
        if (part.life <= 0) {
          s.particles.splice(i, 1);
        }
      }

      // 5. Floating text
      for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
        const ft = s.floatingTexts[i];
        ft.y -= 0.6;
        ft.life -= 1;
        if (ft.life <= 0) {
          s.floatingTexts.splice(i, 1);
        }
      }

      const now = Date.now();
      setCooldown1(Math.max(0, 220 - (now - s.lastAttackTime1)));
      setCooldown2(Math.max(0, 1200 - (now - s.lastAttackTime2)));

      // 6. Draw Canvas
      if (ctx) {
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.strokeStyle = '#1b1b3a';
        ctx.lineWidth = 1;
        for (let x = 0; x < CANVAS_WIDTH; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, CANVAS_HEIGHT);
          ctx.stroke();
        }
        for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(CANVAS_WIDTH, y);
          ctx.stroke();
        }

        // Player
        ctx.save();
        ctx.translate(s.player.x, s.player.y);
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff4081';
        ctx.fillStyle = '#ff4081';
        ctx.beginPath();
        ctx.arc(0, 0, s.player.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(4, -4, 3, 0, Math.PI * 2);
        ctx.arc(4, 4, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(5, -4, 1.5, 0, Math.PI * 2);
        ctx.arc(5, 4, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Boss
        ctx.save();
        ctx.translate(s.boss.x, s.boss.y);
        const pulse = Math.sin(Date.now() / 150) * 4;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#9c27b0';
        ctx.fillStyle = '#6a1b9a';
        ctx.beginPath();
        ctx.arc(0, 0, s.boss.radius + pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ff1744';
        ctx.beginPath();
        ctx.moveTo(-20, -35);
        ctx.lineTo(-30, -55);
        ctx.lineTo(-10, -40);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(20, -35);
        ctx.lineTo(30, -55);
        ctx.lineTo(10, -40);
        ctx.fill();

        ctx.fillStyle = '#ffeb3b';
        ctx.beginPath();
        ctx.arc(-14, -6, 5, 0, Math.PI * 2);
        ctx.arc(14, -6, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-14, -6, 2.5, 0, Math.PI * 2);
        ctx.arc(14, -6, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 14, 12, 0.2, Math.PI - 0.2);
        ctx.stroke();

        ctx.fillStyle = '#ff80ab';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(bossFight.bossName.toUpperCase(), 0, -s.boss.radius - 12);
        ctx.restore();

        // Projectiles
        s.projectiles.forEach(p => {
          ctx.save();
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 6;
          ctx.shadowColor = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();

          if (p.text) {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 9px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(p.text, p.x, p.y);
          }
          ctx.restore();
        });

        // Particles
        s.particles.forEach(part => {
          ctx.fillStyle = part.color;
          ctx.fillRect(part.x, part.y, part.size, part.size);
        });

        // Floating texts
        s.floatingTexts.forEach(ft => {
          ctx.fillStyle = ft.color;
          ctx.font = 'bold 11px monospace';
          ctx.fillText(ft.text, ft.x, ft.y);
        });
      }

      animationFrameRef.current = requestAnimationFrame(() => gameLoopRef.current());
    };
  }, [bossFight.bossName, bossFight.phases, fireAttack1, fireAttack2, togglePause]);

  // Handle keyboard inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const keys = stateRef.current.keys;
      if (['ArrowUp', 'KeyW', 'w', 'W'].includes(e.code) || ['ArrowUp', 'w', 'W'].includes(e.key)) {
        keys.up = true;
        e.preventDefault();
      }
      if (['ArrowDown', 'KeyS', 's', 'S'].includes(e.code) || ['ArrowDown', 's', 'S'].includes(e.key)) {
        keys.down = true;
        e.preventDefault();
      }
      if (['ArrowLeft', 'KeyA', 'a', 'A'].includes(e.code) || ['ArrowLeft', 'a', 'A'].includes(e.key)) {
        keys.left = true;
        e.preventDefault();
      }
      if (['ArrowRight', 'KeyD', 'd', 'D'].includes(e.code) || ['ArrowRight', 'd', 'D'].includes(e.key)) {
        keys.right = true;
        e.preventDefault();
      }
      if (e.code === 'Space' || e.code === 'KeyZ' || e.key === ' ' || e.key === 'z') {
        keys.attack1 = true;
        e.preventDefault();
      }
      if (e.code === 'KeyX' || e.key === 'x') {
        keys.attack2 = true;
        e.preventDefault();
      }
      if (e.code === 'KeyP' || e.key === 'p') {
        e.preventDefault();
        togglePauseRef.current();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keys = stateRef.current.keys;
      if (['ArrowUp', 'KeyW', 'w', 'W'].includes(e.code) || ['ArrowUp', 'w', 'W'].includes(e.key)) {
        keys.up = false;
      }
      if (['ArrowDown', 'KeyS', 's', 'S'].includes(e.code) || ['ArrowDown', 's', 'S'].includes(e.key)) {
        keys.down = false;
      }
      if (['ArrowLeft', 'KeyA', 'a', 'A'].includes(e.code) || ['ArrowLeft', 'a', 'A'].includes(e.key)) {
        keys.left = false;
      }
      if (['ArrowRight', 'KeyD', 'd', 'D'].includes(e.code) || ['ArrowRight', 'd', 'D'].includes(e.key)) {
        keys.right = false;
      }
      if (e.code === 'Space' || e.code === 'KeyZ' || e.key === ' ' || e.key === 'z') {
        keys.attack1 = false;
      }
      if (e.code === 'KeyX' || e.key === 'x') {
        keys.attack2 = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [togglePause]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const startGame = () => {
    retroAudio.playClick();
    const s = stateRef.current;
    s.player.x = 80;
    s.player.y = CANVAS_HEIGHT / 2;
    s.player.hp = 100;
    s.boss.x = CANVAS_WIDTH - 110;
    s.boss.y = CANVAS_HEIGHT / 2;
    s.boss.hp = 500;
    s.boss.phase = 0;
    s.projectiles = [];
    s.particles = [];
    s.floatingTexts = [];
    s.score = 0;
    s.gameState = 'playing';

    setScore(0);
    setPlayerHp(100);
    setBossHp(500);
    setBossDialogue('“I AM NEVER WRONG!”');
    setGameState('playing');

    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(() => gameLoopRef.current());
  };

  return (
    <Container aria-label="Boss Fight: My Ego Game">
      {/* Game HUD Bar */}
      <HudBar>
        <HudGroup>
          <Label>Player HP:</Label>
          <HpBarContainer>
            <HpBarFill $pct={playerHp} $color="#4caf50" />
          </HpBarContainer>
          <HpText>{playerHp}/100</HpText>
        </HudGroup>

        <HudCenter>
          <ScoreLabel>SCORE: {score}</ScoreLabel>
          <HighScoreLabel>BEST: {highScore}</HighScoreLabel>
        </HudCenter>

        <HudGroup>
          <Label>Boss Ego HP:</Label>
          <HpBarContainer>
            <HpBarFill $pct={(bossHp / 500) * 100} $color="#e91e63" />
          </HpBarContainer>
          <HpText>{bossHp}/500</HpText>
        </HudGroup>
      </HudBar>

      {/* Boss Dialogue Speech Bubble */}
      <DialogueBox>
        <SpeakerLabel>😈 {bossFight.bossName} shouts:</SpeakerLabel>
        <DialogueQuote>{bossDialogue}</DialogueQuote>
      </DialogueBox>

      {/* Arena Canvas Wrapper */}
      <ArenaWrapper>
        <GameCanvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          aria-label="2D Arcade Game Arena"
        />

        {/* Overlay screens: Title, Pause, Victory, Defeat */}
        {gameState === 'title' && (
          <OverlayScreen>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
              <img
                src="/assets/generated/boss-fight/ego-boss.png"
                alt="Ego Boss Monster"
                style={{ width: '96px', height: '96px', objectFit: 'contain', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.4))' }}
              />
            </div>
            <GameTitle>⚔️ BOSS FIGHT: MY EGO ⚔️</GameTitle>
            <SubTitle>Can you deflate his stubborn pride and teach him to listen?</SubTitle>

            <InstructionsCard>
              <h4>Controls:</h4>
              <p>🎮 <strong>Move:</strong> Arrow Keys or W / A / S / D (or On-Screen Buttons)</p>
              <p>💖 <strong>Attack 1 (Listen & Validate):</strong> [Space] or [Z]</p>
              <p>💣 <strong>Attack 2 (Truth Bomb):</strong> [X]</p>
              <p>⏸ <strong>Pause:</strong> [P]</p>
            </InstructionsCard>

            <StartGameButton onClick={startGame} type="button">
              ▶ START BATTLE
            </StartGameButton>
          </OverlayScreen>
        )}

        {gameState === 'paused' && (
          <OverlayScreen>
            <h2>GAME PAUSED</h2>
            <p>Take a breath. Love requires patience.</p>
            <StartGameButton onClick={togglePause} type="button">
              ▶ RESUME BATTLE
            </StartGameButton>
          </OverlayScreen>
        )}

        {gameState === 'defeat' && (
          <OverlayScreen>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
              <img
                src="/assets/generated/boss-fight/ego-boss.png"
                alt="Smug Ego Monster"
                style={{ width: '90px', height: '90px', objectFit: 'contain', filter: 'drop-shadow(0 4px 10px rgba(255,0,0,0.4))' }}
              />
            </div>
            <DefeatTitle>💔 EGO TEMPORARILY PREVAILED!</DefeatTitle>
            <p>His stubbornness was too strong this round. Don't let him get away with it!</p>
            <StartGameButton onClick={startGame} type="button">
              ↺ TRY AGAIN (DEFLATE HIS EGO!)
            </StartGameButton>
          </OverlayScreen>
        )}

        {gameState === 'victory' && (
          <OverlayScreen>
            <VictoryTitle>🏆 VICTORY! EGO SHATTERED! 🏆</VictoryTitle>
            <VictoryDesc>{bossFight.victoryMessage}</VictoryDesc>
            <HumbleBoyfriendBox>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
                <img
                  src="/assets/generated/boss-fight/victory-deflated-ego.png"
                  alt="Deflated Ego and Apology Flowers"
                  style={{ width: '110px', height: '110px', objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
                />
              </div>
              <p>“You win! I am truly sorry for being stubborn. I love you!”</p>
            </HumbleBoyfriendBox>
            <FinalScore>Final Score: {score} Points</FinalScore>
            <StartGameButton onClick={startGame} type="button">
              ↺ PLAY AGAIN
            </StartGameButton>
          </OverlayScreen>
        )}
      </ArenaWrapper>

      {/* Mobile / On-Screen Touch Game Controls */}
      <TouchControlsBar>
        {/* Directional Pad */}
        <DpadGroup>
          <DpadRow>
            <TouchKey
              onPointerDown={() => { stateRef.current.keys.up = true; }}
              onPointerUp={() => { stateRef.current.keys.up = false; }}
              onPointerLeave={() => { stateRef.current.keys.up = false; }}
              aria-label="Move Up"
            >
              ▲
            </TouchKey>
          </DpadRow>
          <DpadRow>
            <TouchKey
              onPointerDown={() => { stateRef.current.keys.left = true; }}
              onPointerUp={() => { stateRef.current.keys.left = false; }}
              onPointerLeave={() => { stateRef.current.keys.left = false; }}
              aria-label="Move Left"
            >
              ◀
            </TouchKey>
            <TouchKey
              onPointerDown={() => { stateRef.current.keys.down = true; }}
              onPointerUp={() => { stateRef.current.keys.down = false; }}
              onPointerLeave={() => { stateRef.current.keys.down = false; }}
              aria-label="Move Down"
            >
              ▼
            </TouchKey>
            <TouchKey
              onPointerDown={() => { stateRef.current.keys.right = true; }}
              onPointerUp={() => { stateRef.current.keys.right = false; }}
              onPointerLeave={() => { stateRef.current.keys.right = false; }}
              aria-label="Move Right"
            >
              ▶
            </TouchKey>
          </DpadRow>
        </DpadGroup>

        {/* Action Attack Buttons */}
        <AttackButtonsGroup>
          <AttackBtn
            $color="#ff4081"
            onClick={fireAttack1}
            disabled={gameState !== 'playing' || cooldown1 > 0}
            type="button"
          >
            💖 Empathy
            <small>{cooldown1 > 0 ? `${(cooldown1 / 1000).toFixed(1)}s` : 'Ready'}</small>
          </AttackBtn>

          <AttackBtn
            $color="#fbc02d"
            onClick={fireAttack2}
            disabled={gameState !== 'playing' || cooldown2 > 0}
            type="button"
          >
            💣 Truth
            <small>{cooldown2 > 0 ? `${(cooldown2 / 1000).toFixed(1)}s` : 'Ready'}</small>
          </AttackBtn>

          <PauseBtn onClick={togglePause} type="button">
            {gameState === 'paused' ? '▶' : '⏸'}
          </PauseBtn>
        </AttackButtonsGroup>
      </TouchControlsBar>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #c0c0c0;
  font-family: 'MS Sans Serif', Tahoma, sans-serif;
  color: #000;
  overflow: auto;
  user-select: none;
`;

const HudBar = styled.div`
  background: #000080;
  color: #fff;
  padding: 4px 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  flex-wrap: wrap;
  gap: 6px;
`;

const HudGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Label = styled.span`
  font-weight: bold;
`;

const HpBarContainer = styled.div`
  width: 90px;
  height: 12px;
  background: #333;
  border: 1px solid #fff;
  overflow: hidden;
`;

const HpBarFill = styled.div<{ $pct: number; $color: string }>`
  width: ${props => Math.max(0, Math.min(100, props.$pct))}%;
  height: 100%;
  background: ${props => props.$color};
  transition: width 0.15s ease;
`;

const HpText = styled.span`
  font-family: monospace;
  font-size: 10px;
`;

const HudCenter = styled.div`
  display: flex;
  gap: 12px;
  font-family: monospace;
`;

const ScoreLabel = styled.span`
  color: #ffeb3b;
  font-weight: bold;
`;

const HighScoreLabel = styled.span`
  color: #80d8ff;
`;

const DialogueBox = styled.div`
  background: #fbe9e7;
  border-bottom: 2px solid #ffab91;
  padding: 3px 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
`;

const SpeakerLabel = styled.span`
  font-weight: bold;
  color: #d84315;
`;

const DialogueQuote = styled.span`
  font-style: italic;
  color: #3e2723;
  font-weight: bold;
`;

const ArenaWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  background: #000;
  flex: 1;
  min-height: 240px;
  overflow: hidden;
`;

const GameCanvas = styled.canvas`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  background: #0a0a1a;
`;

const OverlayScreen = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 10, 26, 0.92);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  text-align: center;
  gap: 10px;
  z-index: 5;
`;

const GameTitle = styled.h2`
  color: #ff4081;
  letter-spacing: 2px;
  font-size: 18px;
  margin: 0;
  text-shadow: 2px 2px 0 #000;
`;

const SubTitle = styled.p`
  color: #e0e0e0;
  font-size: 11px;
  margin: 0;
`;

const InstructionsCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 8px 14px;
  font-size: 11px;
  text-align: left;

  h4 {
    margin: 0 0 4px 0;
    color: #ffd54f;
  }

  p {
    margin: 2px 0;
  }
`;

const StartGameButton = styled.button`
  background: #2e7d32;
  color: #fff;
  border: 2px outset #81c784;
  padding: 8px 20px;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  letter-spacing: 1px;

  &:hover {
    background: #388e3c;
  }

  &:active {
    border-style: inset;
  }
`;

const DefeatTitle = styled.h2`
  color: #ff1744;
  margin: 0;
`;

const VictoryTitle = styled.h2`
  color: #ffd700;
  margin: 0;
`;

const VictoryDesc = styled.p`
  font-size: 11px;
  color: #b9f6ca;
  max-width: 400px;
`;

const HumbleBoyfriendBox = styled.div`
  background: rgba(255, 255, 255, 0.15);
  border: 1px dashed #ffd54f;
  padding: 8px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-size: 12px;
`;

const FinalScore = styled.div`
  font-size: 13px;
  font-family: monospace;
  color: #ffeb3b;
`;

const TouchControlsBar = styled.div`
  background: #d4d0c8;
  border-top: 2px solid #808080;
  padding: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DpadGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`;

const DpadRow = styled.div`
  display: flex;
  gap: 2px;
`;

const TouchKey = styled.button`
  width: 34px;
  height: 28px;
  background: #c0c0c0;
  border: 2px outset #ffffff;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    border-style: inset;
    background: #a0a0a0;
  }
`;

const AttackButtonsGroup = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

const AttackBtn = styled.button<{ $color: string }>`
  background: ${props => props.$color};
  color: #000;
  border: 2px outset #ffffff;
  padding: 4px 10px;
  font-weight: bold;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;

  &:active {
    border-style: inset;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  small {
    font-size: 8px;
    font-weight: normal;
  }
`;

const PauseBtn = styled.button`
  background: #c0c0c0;
  border: 2px outset #ffffff;
  padding: 6px 8px;
  font-size: 12px;
  cursor: pointer;

  &:active {
    border-style: inset;
  }
`;

export default BossFight;
