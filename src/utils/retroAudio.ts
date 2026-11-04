// Retro Web Audio Synthesizer for Windows 95 apology experience
// Pure Web Audio API — zero external asset dependencies, zero broken loads.

class RetroAudioService {
  private ctx: AudioContext | null = null;

  private isMuted(): boolean {
    try {
      return localStorage.getItem('win95-muted') === 'true';
    } catch {
      return false;
    }
  }

  private getContext(): AudioContext | null {
    if (this.isMuted()) return null;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => { /* resume failure ignored */ });
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  // Generic tone
  playTone(freq: number, duration: number = 0.15, type: OscillatorType = 'sine', volume: number = 0.1) {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      /* tone failure ignored */
    }
  }

  // DTMF standard keypad dual tones
  playDTMF(key: string) {
    const ctx = this.getContext();
    if (!ctx) return;

    const dtmfFreqs: Record<string, [number, number]> = {
      '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
      '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
      '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
      '*': [941, 1209], '0': [941, 1336], '#': [941, 1477],
    };

    const freqs = dtmfFreqs[key];
    if (!freqs) {
      this.playTone(400, 0.08, 'square', 0.05);
      return;
    }

    try {
      const now = ctx.currentTime;
      const duration = 0.18;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      gain.connect(ctx.destination);

      for (const f of freqs) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + duration);
      }
    } catch {
      /* dtmf failure ignored */
    }
  }

  // Phone Ringing Tone (US cadence: 440 + 480 Hz)
  playPhoneRing() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const duration = 1.2;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      gain.connect(ctx.destination);

      [440, 480].forEach(f => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + duration);
      });
    } catch {
      /* ring failure ignored */
    }
  }

  // Phone Busy Signal
  playBusyTone() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const duration = 0.4;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      gain.connect(ctx.destination);

      [480, 620].forEach(f => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + duration);
      });
    } catch {
      /* busy tone failure ignored */
    }
  }

  // Button / Keypad Click
  playClick() {
    this.playTone(800, 0.03, 'square', 0.04);
  }

  // Courtroom Gavel Thud
  playGavel() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.25);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);

      const wood = ctx.createOscillator();
      const woodGain = ctx.createGain();
      wood.type = 'sine';
      wood.frequency.setValueAtTime(420, now);
      wood.frequency.exponentialRampToValueAtTime(180, now + 0.08);

      woodGain.gain.setValueAtTime(0.2, now);
      woodGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      wood.connect(woodGain);
      woodGain.connect(ctx.destination);
      wood.start(now);
      wood.stop(now + 0.09);
    } catch {
      /* gavel failure ignored */
    }
  }

  // Vending Coin Insert
  playCoin() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(987, now);
      osc1.frequency.setValueAtTime(1318, now + 0.07);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1318, now);
      osc2.frequency.setValueAtTime(1760, now + 0.07);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } catch {
      /* coin failure ignored */
    }
  }

  // Vending Item Dispense Whirr & Thud
  playVendingDrop() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const motor = ctx.createOscillator();
      const motorGain = ctx.createGain();
      motor.type = 'sawtooth';
      motor.frequency.setValueAtTime(120, now);
      motor.frequency.linearRampToValueAtTime(180, now + 0.25);
      motor.frequency.linearRampToValueAtTime(90, now + 0.5);

      motorGain.gain.setValueAtTime(0.05, now);
      motorGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      motor.connect(motorGain);
      motorGain.connect(ctx.destination);
      motor.start(now);
      motor.stop(now + 0.55);

      setTimeout(() => {
        this.playTone(70, 0.2, 'triangle', 0.2);
      }, 450);
    } catch {
      /* vending failure ignored */
    }
  }

  // Boss Fight Player Shoot / Laser
  playLaser() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      /* laser failure ignored */
    }
  }

  // Boss Fight Hit
  playHit() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.11);
    } catch {
      /* hit failure ignored */
    }
  }

  // Boss Defeat / Victory Fanfare
  playVictoryFanfare() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
      const noteDuration = 0.12;
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, idx === notes.length - 1 ? 0.6 : noteDuration, 'triangle', 0.15);
        }, idx * 100);
      });
    } catch {
      /* fanfare failure ignored */
    }
  }

  // Delivery Doorbell Chime ("Ding-Dong")
  playDoorbell() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      this.playTone(659.25, 0.45, 'sine', 0.18);
      setTimeout(() => {
        this.playTone(523.25, 0.7, 'sine', 0.18);
      }, 350);
    } catch {
      /* doorbell failure ignored */
    }
  }

  // Web Speech API Voice synthesis fallback for Hotline
  speakMessage(text: string, onEnd?: () => void): () => void {
    if (this.isMuted()) {
      onEnd?.();
      return () => { /* no-op */ };
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.onend = () => {
          onEnd?.();
        };
        utterance.onerror = () => {
          onEnd?.();
        };
        window.speechSynthesis.speak(utterance);
        return () => {
          try {
            window.speechSynthesis.cancel();
          } catch {
            /* cancel failure ignored */
          }
        };
      } catch {
        onEnd?.();
      }
    } else {
      onEnd?.();
    }
    return () => { /* no-op */ };
  }
}

export const retroAudio = new RetroAudioService();
export default retroAudio;
