import { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { apologyConfig } from '../../../config/apologyConfig';
import { retroAudio } from '../../../utils/retroAudio';

type CallState = 'idle' | 'dialing' | 'ringing' | 'connected' | 'ended' | 'busy';

interface SorryHotlineProps {
  onCallStateChange?: (state: CallState) => void;
}

export const SorryHotline = ({ onCallStateChange }: SorryHotlineProps) => {
  const { hotline } = apologyConfig;
  const [dialedDigits, setDialedDigits] = useState('');
  const [callState, setCallState] = useState<CallState>('idle');
  const [activeMenuKey, setActiveMenuKey] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('READY TO DIAL');
  const [callDuration, setCallDuration] = useState(0);

  // Audio player state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(45); // fallback estimated duration in seconds
  const [audioVolume, setAudioVolume] = useState(0.8);
  const [audioError, setAudioError] = useState(false);
  const [isUsingSpeechFallback, setIsUsingSpeechFallback] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const durationTimerRef = useRef<number | null>(null);
  const speechCancelRef = useRef<(() => void) | null>(null);
  const ringTimeoutRef = useRef<number | null>(null);

  // Notify parent of call state changes
  useEffect(() => {
    onCallStateChange?.(callState);
  }, [callState, onCallStateChange]);

  // Clean up all audio and timers on unmount
  useEffect(() => {
    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (speechCancelRef.current) {
        speechCancelRef.current();
      }
    };
  }, []);

  // Duration timer when connected
  useEffect(() => {
    if (callState === 'connected') {
      durationTimerRef.current = window.setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    }
    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [callState]);

  const stopActiveAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (speechCancelRef.current) {
      speechCancelRef.current();
      speechCancelRef.current = null;
    }
    setIsPlayingAudio(false);
  }, []);

  const playMenuOption = useCallback((key: string) => {
    const option = hotline.menuOptions.find(o => o.key === key);
    if (!option) return;

    stopActiveAudio();
    setActiveMenuKey(key);
    setStatusMessage(`Playing: ${option.title}`);
    setAudioError(false);

    // If an audioUrl is supplied and playable, try it; otherwise gracefully fall back to speech synthesis
    const targetAudio = option.audioUrl || (key === '4' ? hotline.defaultAudioUrl : undefined);

    if (targetAudio) {
      try {
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }
        const audio = audioRef.current;
        audio.src = targetAudio;
        audio.volume = audioVolume;

        audio.onloadedmetadata = () => {
          if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
            setDuration(audio.duration);
          }
        };

        audio.ontimeupdate = () => {
          setCurrentTime(audio.currentTime);
        };

        audio.onended = () => {
          setIsPlayingAudio(false);
          setStatusMessage('Playback completed. Press a key or 4 to replay.');
        };

        audio.onerror = () => {
          // Graceful fallback to speech synthesis
          setAudioError(true);
          setIsUsingSpeechFallback(true);
          setIsPlayingAudio(true);
          setStatusMessage(`Audio unavailable. Reading text transcript...`);
          speechCancelRef.current = retroAudio.speakMessage(option.script, () => {
            setIsPlayingAudio(false);
            setStatusMessage('End of message. Press 1-4 for more.');
          });
        };

        audio.play().then(() => {
          setIsPlayingAudio(true);
          setIsUsingSpeechFallback(false);
        }).catch(() => {
          // If browser blocked or file failed, fallback to speech synthesis
          setIsUsingSpeechFallback(true);
          setIsPlayingAudio(true);
          speechCancelRef.current = retroAudio.speakMessage(option.script, () => {
            setIsPlayingAudio(false);
          });
        });
      } catch {
        setIsUsingSpeechFallback(true);
        setIsPlayingAudio(true);
        speechCancelRef.current = retroAudio.speakMessage(option.script, () => {
          setIsPlayingAudio(false);
        });
      }
    } else {
      // Natural speech fallback
      setIsUsingSpeechFallback(true);
      setIsPlayingAudio(true);
      setDuration(Math.max(15, Math.round(option.script.length / 10)));
      speechCancelRef.current = retroAudio.speakMessage(option.script, () => {
        setIsPlayingAudio(false);
        setStatusMessage('End of message. Select another extension.');
      });
    }
  }, [hotline.menuOptions, hotline.defaultAudioUrl, audioVolume, stopActiveAudio]);

  const handleDigitPress = useCallback((digit: string) => {
    retroAudio.playDTMF(digit);
    if (callState === 'connected') {
      // In-call menu selection
      const matchedOption = hotline.menuOptions.find(
        opt => opt.key === digit || opt.extension === digit
      );
      if (matchedOption) {
        playMenuOption(matchedOption.key);
      } else {
        setStatusMessage(`Extension ${digit} not found.`);
        retroAudio.playBusyTone();
      }
      return;
    }

    setDialedDigits(prev => {
      if (prev.length >= 14) return prev;
      return prev + digit;
    });
  }, [callState, hotline.menuOptions, playMenuOption]);

  const handleBackspace = () => {
    retroAudio.playClick();
    setDialedDigits(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    retroAudio.playClick();
    setDialedDigits('');
    setStatusMessage('CLEARED');
  };

  const handleStartCall = () => {
    if (callState === 'connected' || callState === 'dialing' || callState === 'ringing') {
      return;
    }

    retroAudio.playClick();
    setCallState('dialing');
    setStatusMessage('DIALING...');

    // Dial tone sequence
    ringTimeoutRef.current = window.setTimeout(() => {
      setCallState('ringing');
      setStatusMessage('RINGING...');
      retroAudio.playPhoneRing();

      ringTimeoutRef.current = window.setTimeout(() => {
        setCallState('connected');
        setCallDuration(0);
        setStatusMessage('CONNECTED — 24/7 APOLOGY LINE');

        // Check if a specific extension was dialed
        const matched = hotline.menuOptions.find(
          opt => opt.extension === dialedDigits || opt.key === dialedDigits
        );

        if (matched) {
          playMenuOption(matched.key);
        } else {
          // Play automated welcome greeting
          setIsUsingSpeechFallback(true);
          setIsPlayingAudio(true);
          speechCancelRef.current = retroAudio.speakMessage(hotline.greetingText, () => {
            setIsPlayingAudio(false);
            setStatusMessage('Please press 1, 2, 3, 4, or 0.');
          });
        }
      }, 1600);
    }, 800);
  };

  const handleEndCall = () => {
    if (callState === 'idle') return;
    retroAudio.playClick();
    stopActiveAudio();
    if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
    setCallState('ended');
    setStatusMessage('CALL DISCONNECTED');
    setTimeout(() => {
      setCallState('idle');
      setCallDuration(0);
      setStatusMessage('READY TO DIAL');
    }, 1200);
  };

  const handlePlayPause = () => {
    if (isUsingSpeechFallback) {
      if (isPlayingAudio) {
        stopActiveAudio();
      } else if (activeMenuKey) {
        playMenuOption(activeMenuKey);
      }
      return;
    }

    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => {});
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setAudioVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const activeOption = hotline.menuOptions.find(o => o.key === activeMenuKey);

  return (
    <Container aria-label="Sorry Hotline Application">
      {/* Top Banner */}
      <HeaderBar>
        <HotlineLogo>
          <img
            src="/assets/generated/hotline/vintage-telephone.png"
            alt="Hotline phone"
            style={{ width: '24px', height: '24px', objectFit: 'contain', verticalAlign: 'middle', marginRight: '6px' }}
          />
          24/7 APOLOGY HOTLINE
        </HotlineLogo>
        <NumberBadge>{hotline.phoneNumber}</NumberBadge>
      </HeaderBar>

      <ContentArea>
        {/* Telephone Hardware Console */}
        <PhoneChassis>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
            <img
              src="/assets/generated/hotline/vintage-telephone.png"
              alt="Vintage telephone"
              style={{ width: '84px', height: '60px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))' }}
            />
          </div>

          {/* LCD Display */}
          <LcdDisplay>
            <LcdHeader>
              <StatusBadge $state={callState}>
                {callState === 'connected' ? `● CALL ${formatSeconds(callDuration)}` : callState.toUpperCase()}
              </StatusBadge>
              <LcdTime>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</LcdTime>
            </LcdHeader>

            <LcdDigits aria-label="Dialed number display">
              {dialedDigits || (callState === 'connected' ? 'EXT: SELECT OPTION' : 'ENTER EXT / NUMBER')}
            </LcdDigits>

            <LcdMessage aria-live="polite">
              {statusMessage}
            </LcdMessage>
          </LcdDisplay>

          {/* Keypad 3x4 */}
          <KeypadGrid role="group" aria-label="Phone keypad">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(key => (
              <KeyButton
                key={key}
                onClick={() => handleDigitPress(key)}
                aria-label={`Key ${key}`}
                type="button"
              >
                <KeyMainDigit>{key}</KeyMainDigit>
                <KeySubText>
                  {key === '1' ? 'COMPLAINT' :
                   key === '2' ? 'EXCUSES' :
                   key === '3' ? 'TRUTH' :
                   key === '4' ? 'APOLOGY' :
                   key === '0' ? 'OPERATOR' : ''}
                </KeySubText>
              </KeyButton>
            ))}
          </KeypadGrid>

          {/* Action Call Controls */}
          <ControlButtonsRow>
            <ActionButton
              $variant="call"
              onClick={handleStartCall}
              disabled={callState === 'connected' || callState === 'dialing'}
              aria-label="Start Call"
              type="button"
            >
              📞 CALL
            </ActionButton>
            <ActionButton
              $variant="end"
              onClick={handleEndCall}
              disabled={callState === 'idle'}
              aria-label="End Call"
              type="button"
            >
              🛑 END
            </ActionButton>
            <ActionButton
              $variant="utility"
              onClick={handleBackspace}
              disabled={dialedDigits.length === 0}
              aria-label="Backspace"
              type="button"
            >
              ⌫ DEL
            </ActionButton>
            <ActionButton
              $variant="utility"
              onClick={handleClear}
              aria-label="Clear display"
              type="button"
            >
              C CLEAR
            </ActionButton>
          </ControlButtonsRow>
        </PhoneChassis>

        {/* Right Panel: Interactive Menu Directory & Voice Player */}
        <SideDirectory>
          <PanelSectionTitle>Automated Directory</PanelSectionTitle>
          <DirectoryList>
            {hotline.menuOptions.map(opt => (
              <DirectoryItem
                key={opt.key}
                $active={activeMenuKey === opt.key && callState === 'connected'}
                onClick={() => {
                  if (callState === 'connected') {
                    playMenuOption(opt.key);
                  } else {
                    setDialedDigits(opt.extension);
                    setStatusMessage(`Press CALL to dial Ext: ${opt.extension}`);
                  }
                }}
              >
                <DirectoryKeyBadge>Press {opt.key}</DirectoryKeyBadge>
                <DirectoryDetails>
                  <DirectoryTitle>{opt.label}</DirectoryTitle>
                  <DirectoryExt>(Ext: {opt.extension})</DirectoryExt>
                </DirectoryDetails>
              </DirectoryItem>
            ))}
          </DirectoryList>

          {/* Sincere Voice Player Section */}
          <VoicePlayerPanel>
            <PlayerHeader>
              <PlayerTitle>📼 Voice Message Player</PlayerTitle>
              {audioError && <FallbackNotice>Transcript fallback active</FallbackNotice>}
            </PlayerHeader>

            {activeOption ? (
              <TranscriptBox>
                <strong>{activeOption.title}</strong>
                <p>{activeOption.script}</p>
              </TranscriptBox>
            ) : (
              <TranscriptBoxPlaceholder>
                {callState === 'connected'
                  ? 'Select an option above (1-4) to listen.'
                  : 'Start call and dial an extension to hear apology tapes.'}
              </TranscriptBoxPlaceholder>
            )}

            {/* Audio Controls */}
            <PlayerControls>
              <TransportButton
                onClick={handlePlayPause}
                disabled={!activeOption}
                aria-label={isPlayingAudio ? 'Pause' : 'Play'}
                type="button"
              >
                {isPlayingAudio ? '⏸ PAUSE' : '▶ PLAY'}
              </TransportButton>
              <TransportButton
                onClick={() => {
                  if (activeMenuKey) playMenuOption(activeMenuKey);
                }}
                disabled={!activeOption}
                aria-label="Replay"
                type="button"
              >
                ↺ REPLAY
              </TransportButton>

              <TimeDisplay>
                {formatSeconds(currentTime)} / {formatSeconds(duration)}
              </TimeDisplay>
            </PlayerControls>

            {/* Scrubber slider */}
            <SliderRow>
              <Scrubber
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                disabled={isUsingSpeechFallback || !isPlayingAudio}
                aria-label="Audio progress slider"
              />
            </SliderRow>

            {/* Volume control */}
            <VolumeRow>
              <span>🔈 Vol:</span>
              <VolumeSlider
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={audioVolume}
                onChange={handleVolumeChange}
                aria-label="Audio volume slider"
              />
            </VolumeRow>
          </VoicePlayerPanel>
        </SideDirectory>
      </ContentArea>
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
  overflow-y: auto;
  user-select: none;
`;

const HeaderBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #000080;
  color: #fff;
  padding: 4px 8px;
  font-weight: bold;
  font-size: 12px;
`;

const HotlineLogo = styled.span`
  letter-spacing: 0.5px;
`;

const NumberBadge = styled.span`
  background: #ffff00;
  color: #000;
  padding: 1px 6px;
  font-family: monospace;
  font-size: 11px;
  border-radius: 2px;
  font-weight: bold;
`;

const ContentArea = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 8px;
  padding: 8px;
  flex: 1;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const PhoneChassis = styled.div`
  background: #d4d0c8;
  border: 3px outset #ffffff;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: inset 1px 1px 0 #fff, inset -1px -1px 0 #808080;
`;

const LcdDisplay = styled.div`
  background: #1b382b;
  border: 3px inset #808080;
  padding: 6px 8px;
  color: #33ff66;
  font-family: 'Courier New', Courier, monospace;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const LcdHeader = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  opacity: 0.85;
`;

const StatusBadge = styled.span<{ $state: CallState }>`
  color: ${props =>
    props.$state === 'connected' ? '#00ff66' :
    props.$state === 'dialing' || props.$state === 'ringing' ? '#ffff00' :
    props.$state === 'ended' || props.$state === 'busy' ? '#ff3333' : '#88ff88'};
  font-weight: bold;
`;

const LcdTime = styled.span`
  color: #99ff99;
`;

const LcdDigits = styled.div`
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 2px;
  min-height: 20px;
  word-break: break-all;
`;

const LcdMessage = styled.div`
  font-size: 10px;
  color: #a3ffb8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const KeypadGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
`;

const KeyButton = styled.button`
  background: #dfdfdf;
  border: 2px outset #ffffff;
  padding: 6px 2px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  outline: none;

  &:active {
    border-style: inset;
    background: #c8c8c8;
  }

  &:focus-visible {
    outline: 1px dotted #000;
  }
`;

const KeyMainDigit = styled.span`
  font-size: 16px;
  font-weight: bold;
  font-family: 'MS Sans Serif', Tahoma, sans-serif;
  color: #000;
`;

const KeySubText = styled.span`
  font-size: 8px;
  color: #555;
  letter-spacing: 0.5px;
  text-transform: uppercase;
`;

const ControlButtonsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
`;

const ActionButton = styled.button<{ $variant: 'call' | 'end' | 'utility' }>`
  border: 2px outset #ffffff;
  padding: 6px;
  font-size: 11px;
  font-weight: bold;
  cursor: pointer;
  background: ${props =>
    props.$variant === 'call' ? '#2e7d32' :
    props.$variant === 'end' ? '#c62828' : '#e0e0e0'};
  color: ${props =>
    props.$variant === 'utility' ? '#000' : '#fff'};

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-style: solid;
  }

  &:not(:disabled):active {
    border-style: inset;
  }

  &:focus-visible {
    outline: 1px dotted #000;
  }
`;

const SideDirectory = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PanelSectionTitle = styled.div`
  font-weight: bold;
  font-size: 12px;
  border-bottom: 1px solid #808080;
  padding-bottom: 2px;
`;

const DirectoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DirectoryItem = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${props => props.$active ? '#000080' : '#ffffff'};
  color: ${props => props.$active ? '#ffffff' : '#000000'};
  border: 1px inset #808080;
  padding: 4px 6px;
  cursor: pointer;

  &:hover {
    background: ${props => props.$active ? '#000080' : '#eef2ff'};
  }
`;

const DirectoryKeyBadge = styled.span`
  background: #808080;
  color: #fff;
  font-size: 9px;
  font-weight: bold;
  padding: 2px 4px;
  border-radius: 2px;
`;

const DirectoryDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const DirectoryTitle = styled.span`
  font-size: 11px;
  font-weight: bold;
`;

const DirectoryExt = styled.span`
  font-size: 9px;
  opacity: 0.8;
`;

const VoicePlayerPanel = styled.div`
  background: #ffffff;
  border: 2px inset #808080;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
`;

const PlayerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PlayerTitle = styled.span`
  font-weight: bold;
  font-size: 11px;
`;

const FallbackNotice = styled.span`
  font-size: 9px;
  color: #880000;
  background: #ffe6e6;
  padding: 1px 4px;
`;

const TranscriptBox = styled.div`
  background: #f7f7f7;
  border: 1px solid #c0c0c0;
  padding: 6px;
  font-size: 11px;
  line-height: 1.4;
  max-height: 110px;
  overflow-y: auto;
  color: #000;

  strong {
    display: block;
    color: #000080;
    margin-bottom: 4px;
  }
`;

const TranscriptBoxPlaceholder = styled.div`
  background: #fdfdfd;
  border: 1px dashed #c0c0c0;
  padding: 14px 8px;
  font-size: 11px;
  color: #707070;
  text-align: center;
  font-style: italic;
`;

const PlayerControls = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const TransportButton = styled.button`
  border: 2px outset #ffffff;
  background: #c0c0c0;
  padding: 4px 8px;
  font-size: 10px;
  font-weight: bold;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:not(:disabled):active {
    border-style: inset;
  }
`;

const TimeDisplay = styled.span`
  font-family: monospace;
  font-size: 11px;
  margin-left: auto;
  color: #333;
`;

const SliderRow = styled.div`
  display: flex;
  align-items: center;
`;

const Scrubber = styled.input`
  width: 100%;
  accent-color: #000080;
  cursor: pointer;
`;

const VolumeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
`;

const VolumeSlider = styled.input`
  width: 100px;
  accent-color: #000080;
`;

export default SorryHotline;
