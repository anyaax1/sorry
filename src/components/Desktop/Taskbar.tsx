import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button } from 'react95';
import type { WindowInfo } from './Desktop';
import { getAssetUrl } from '../../utils/assetPath';

interface TaskbarProps {
  openWindows: WindowInfo[];
  startMenuOpen: boolean;
  onStartClick: () => void;
  onWindowClick?: (id: string) => void;
}

const Taskbar = ({ openWindows, startMenuOpen, onStartClick, onWindowClick }: TaskbarProps) => {
  const [time, setTime] = useState(new Date());
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('win95-muted') === 'true';
  });

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    localStorage.setItem('win95-muted', String(newMuted));
    // Dispatch event so other components can react
    window.dispatchEvent(new CustomEvent('win95-mute-change', { detail: newMuted }));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Container aria-label="Taskbar">
      <StartButton
        aria-label="Start"
        aria-haspopup="menu"
        aria-expanded={startMenuOpen}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          onStartClick();
        }}
        active={startMenuOpen}
      >
        <StartIconImage src={getAssetUrl('/icons/start.png')} alt="" />
        <StartText>Start</StartText>
      </StartButton>

      <Divider />

      <WindowButtons>
        {openWindows.map(win => (
          <WindowButton
            key={win.id}
            $active={win.isActive}
            title={win.title}
            aria-label={win.title}
            onClick={() => onWindowClick?.(win.id)}
          >
            {win.icon && <TaskbarWindowIcon src={getAssetUrl(win.icon)} alt="" />}
            {win.title}
          </WindowButton>
        ))}
      </WindowButtons>

      <SystemTray>
        <PersonalEditionBadge title="Windows 95 — Personal Edition">
          💝
        </PersonalEditionBadge>
        <SpeakerIcon onClick={toggleMute} title={isMuted ? 'Click to unmute' : 'Click to mute'}>
          {isMuted ? '🔇' : '🔊'}
        </SpeakerIcon>
        <Clock>{formatTime(time)}</Clock>
      </SystemTray>
    </Container>
  );
};

const Container = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30px;
  z-index: 10000;
  background-color: #c0c0c0;
  border-top: 2px solid #dfdfdf;
  display: flex;
  align-items: center;
  padding: 1px 2px;
  gap: 2px;
`;

const StartButton = styled(Button)<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  font-weight: bold;
  min-width: 60px;
  flex-shrink: 0;
  height: 26px;
`;

const StartIconImage = styled.img`
  width: 18px;
  height: 18px;
  image-rendering: pixelated;
`;

const StartText = styled.span`
  font-size: 12px;
  font-weight: bold;
`;

const Divider = styled.div`
  width: 2px;
  height: 24px;
  background: linear-gradient(to right, #808080, #fff);
  margin: 0 2px;
`;

const WindowButtons = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  gap: 2px;
  overflow-x: auto;
  scrollbar-width: none;
`;

const TaskbarWindowIcon = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 4px;
  flex-shrink: 0;
  image-rendering: pixelated;
`;

const WindowButton = styled.button<{ $active: boolean }>`
  height: 26px;
  flex: 1 0 32px;
  min-width: 32px;
  max-width: 170px;
  padding: 2px 8px;
  font-size: 12px;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  align-items: center;
  background-color: ${props => props.$active ? '#c0c0c0' : '#c0c0c0'};
  border: 2px solid;
  border-top-color: ${props => props.$active ? '#404040' : '#fff'};
  border-left-color: ${props => props.$active ? '#404040' : '#fff'};
  border-bottom-color: ${props => props.$active ? '#fff' : '#404040'};
  border-right-color: ${props => props.$active ? '#fff' : '#404040'};
  cursor: pointer;
  font-family: 'MS Sans Serif', Tahoma, sans-serif;

  &:active {
    border-top-color: #404040;
    border-left-color: #404040;
    border-bottom-color: #fff;
    border-right-color: #fff;
  }
`;

const SystemTray = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 8px;
  padding: 2px 8px;
  border: 2px solid;
  border-top-color: #808080;
  border-left-color: #808080;
  border-bottom-color: #fff;
  border-right-color: #fff;
  height: 26px;
`;

const PersonalEditionBadge = styled.span`
  font-size: 14px;
  cursor: default;
  user-select: none;
`;

const SpeakerIcon = styled.button`
  background: transparent;
  border: 0;
  padding: 0;
  font-size: 14px;
  cursor: pointer;
  user-select: none;

  &:hover {
    filter: brightness(1.2);
  }

  &:active {
    filter: brightness(0.9);
  }
`;

const Clock = styled.span`
  font-size: 12px;
  font-family: 'MS Sans Serif', Tahoma, sans-serif;
`;

export default Taskbar;
