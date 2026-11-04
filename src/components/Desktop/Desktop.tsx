import { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react';
import styled from 'styled-components';
import Taskbar from './Taskbar';
import StartMenu from './StartMenu';
import DesktopIcon from './DesktopIcon';
import Window from '../Windows/Window';
import MyComputerContent from '../Apps/MyComputer/MyComputerContent';
import BrowserContent from '../Apps/Browser/BrowserContent';
import Minesweeper from '../Apps/Games/Minesweeper/Minesweeper';
import ICQ from '../Apps/ICQ/ICQ';
import SorryHotline from '../Apps/SorryHotline/SorryHotline';
import HerCourt from '../Apps/HerCourt/HerCourt';
import SorryVending from '../Apps/SorryVending/SorryVending';
import BossFight from '../Apps/BossFight/BossFight';
import SorryDelivery from '../Apps/SorryDelivery/SorryDelivery';
import type { ChatMessage } from '../../services/chatService';
import { logClick, logWindowAction } from '../../services/analyticsService';

const CVViewer = lazy(() => import('../Apps/CVViewer/CVViewer'));

export interface WindowInfo {
  id: string;
  title: string;
  icon?: string;
  isMinimized: boolean;
  isActive: boolean;
  zIndex: number;
}

const iconToPath: Record<string, string> = {
  'my-computer': '/icons/my-computer.png',
  'recycle-bin': '/icons/recycle-bin.png',
  'cv-doc': '/icons/document.png',
  'homepage': '/icons/internet.png',
  'minesweeper': '/icons/minesweeper.png',
  'icq': '/icons/icq-flower.svg',
  'sorry-hotline': '/assets/generated/icons/sorry-hotline.png',
  'court-of-her-name': '/assets/generated/icons/court.png',
  'sorry-vending-machine': '/assets/generated/icons/vending.png',
  'boss-fight-ego': '/assets/generated/icons/boss-fight.png',
  'sorry-delivery': '/assets/generated/icons/delivery.png',
};

// External links that open in new browser tab
const externalLinks: Record<string, string> = {};

function activateTopWindow(windows: WindowInfo[]) {
  const top = windows.filter(w => !w.isMinimized).sort((a, b) => b.zIndex - a.zIndex)[0];
  return windows.map(w => ({ ...w, isActive: w.id === top?.id }));
}

const Desktop = () => {
  const [openWindows, setOpenWindows] = useState<WindowInfo[]>([]);
  const [startMenuOpen, setStartMenuOpen] = useState(false);

  // ICQ chat state (persists across window open/close)
  const [icqMessages, setIcqMessages] = useState<ChatMessage[]>([]);
  const [readMessageCount, setReadMessageCount] = useState(0);
  const assistantMessageCount = icqMessages.filter(m => m.role === 'assistant').length;
  const icqActive = openWindows.some(w => w.id === 'icq' && w.isActive && !w.isMinimized);
  if (icqActive && readMessageCount !== assistantMessageCount) setReadMessageCount(assistantMessageCount);
  const icqUnreadCount = icqActive ? 0 : Math.max(0, assistantMessageCount - readMessageCount);
  const lastPlayedMessageCount = useRef(0);

  // Play sound only for new messages (once per message)
  const playUhOh = useCallback(() => {
    const isMuted = localStorage.getItem('win95-muted') === 'true';
    if (isMuted) return;
    try {
      const audio = new Audio('/sounds/icq-uh-oh.mp3');
      audio.volume = 0.25;
      audio.play().catch(() => {});
    } catch { /* Sound is optional when audio or storage is unavailable. */ }
  }, []);

  // Track new messages and play sound once
  useEffect(() => {
    const assistantMessages = icqMessages.filter(m => m.role === 'assistant').length;
    if (assistantMessages > lastPlayedMessageCount.current) {
      playUhOh();
      lastPlayedMessageCount.current = assistantMessages;

    }
  }, [icqMessages, playUhOh]);

  const handleIconDoubleClick = useCallback((id: string, title: string) => {
    logClick('desktop-icon', id);
    if (externalLinks[id]) {
      window.open(externalLinks[id], '_blank', 'noopener,noreferrer');
      return;
    }
    logWindowAction('open', id);
    setOpenWindows(prev => {
      const nextZIndex = Math.max(99, ...prev.map(w => w.zIndex)) + 1;
      const existing = prev.some(w => w.id === id);
      const windows = prev.map(w => ({
        ...w,
        isMinimized: w.id === id ? false : w.isMinimized,
        isActive: w.id === id,
        zIndex: w.id === id ? nextZIndex : w.zIndex,
      }));
      return existing ? windows : [...windows, { id, title, icon: iconToPath[id], isMinimized: false, isActive: true, zIndex: nextZIndex }];
    });
  }, []);

  // Do not interrupt a visitor who has already opened ICQ themselves.
  const hasOpenedICQ = useRef(false);
  useEffect(() => {
    if (openWindows.some(w => w.id === 'icq')) hasOpenedICQ.current = true;
  }, [openWindows]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasOpenedICQ.current) handleIconDoubleClick('icq', 'ICQ');
    }, 18000);
    return () => clearTimeout(timer);
  }, [handleIconDoubleClick]);

  const handleWindowClose = useCallback((id: string) => {
    logWindowAction('close', id);
    setOpenWindows(prev => activateTopWindow(prev.filter(w => w.id !== id)));
  }, []);

  const handleWindowMinimize = useCallback((id: string) => {
    logWindowAction('minimize', id);
    setOpenWindows(prev => activateTopWindow(prev.map(w => w.id === id ? { ...w, isMinimized: true, isActive: false } : w)));
  }, []);

  const handleWindowFocus = useCallback((id: string) => {
    setOpenWindows(prev => {
      if (prev.some(w => w.id === id && w.isActive && !w.isMinimized)) return prev;
      const nextZIndex = Math.max(99, ...prev.map(w => w.zIndex)) + 1;
      return prev.map(w => ({ ...w, isActive: w.id === id, zIndex: w.id === id ? nextZIndex : w.zIndex }));
    });
  }, []);

  const handleTaskbarWindowClick = useCallback((id: string) => {
    setOpenWindows(prev => {
      const selected = prev.find(w => w.id === id);
      if (!selected) return prev;
      if (selected.isActive && !selected.isMinimized) {
        return activateTopWindow(prev.map(w => w.id === id ? { ...w, isMinimized: true, isActive: false } : w));
      }
      const nextZIndex = Math.max(99, ...prev.map(w => w.zIndex)) + 1;
      return prev.map(w => ({ ...w, isActive: w.id === id, isMinimized: w.id === id ? false : w.isMinimized, zIndex: w.id === id ? nextZIndex : w.zIndex }));
    });
  }, []);

  const handleStartClick = () => {
    setStartMenuOpen(prev => !prev);
  };

  const handleDesktopClick = () => {
    if (startMenuOpen) {
      setStartMenuOpen(false);
    }
  };

  const handleStartMenuClose = () => {
    setStartMenuOpen(false);
  };

  const handleOpenAppFromStartMenu = (appId: string, title: string) => {
    handleIconDoubleClick(appId, title);
  };

  const handleICQClick = useCallback(() => {
    handleIconDoubleClick('icq', 'ICQ');
  }, [handleIconDoubleClick]);

  return (
    <Container onClick={handleDesktopClick} aria-label="Windows 95 desktop">
      <IconsArea role="group" aria-label="Desktop icons">
        <DesktopIcon
          id="my-computer"
          icon="/icons/my-computer.png"
          label="My Computer"
          onDoubleClick={handleIconDoubleClick}
        />
        <DesktopIcon
          id="recycle-bin"
          icon="/icons/recycle-bin.png"
          label="Recycle Bin"
          onDoubleClick={handleIconDoubleClick}
        />
        <DesktopIcon
          id="cv-doc"
          icon="/icons/document.png"
          label="CV.doc"
          onDoubleClick={handleIconDoubleClick}
        />
        <DesktopIcon
          id="homepage"
          icon="/icons/internet.png"
          label="Fonchi's Homepage"
          onDoubleClick={handleIconDoubleClick}
        />
        <DesktopIcon
          id="minesweeper"
          icon="/icons/minesweeper.png"
          label="Minesweeper"
          onDoubleClick={handleIconDoubleClick}
        />
        <DesktopIcon
          id="icq"
          icon="/icons/icq-flower.svg"
          label="ICQ"
          onDoubleClick={handleIconDoubleClick}
        />
        <DesktopIcon
          id="sorry-hotline"
          icon="/assets/generated/icons/sorry-hotline.png"
          label="Sorry Hotline"
          onDoubleClick={handleIconDoubleClick}
        />
        <DesktopIcon
          id="court-of-her-name"
          icon="/assets/generated/icons/court.png"
          label="The Court of Her Name"
          onDoubleClick={handleIconDoubleClick}
        />
        <DesktopIcon
          id="sorry-vending-machine"
          icon="/assets/generated/icons/vending.png"
          label="Sorry Vending Machine"
          onDoubleClick={handleIconDoubleClick}
        />
        <DesktopIcon
          id="boss-fight-ego"
          icon="/assets/generated/icons/boss-fight.png"
          label="Boss Fight: My Ego"
          onDoubleClick={handleIconDoubleClick}
        />
        <DesktopIcon
          id="sorry-delivery"
          icon="/assets/generated/icons/delivery.png"
          label="Sorry Is Out for Delivery"
          onDoubleClick={handleIconDoubleClick}
        />
      </IconsArea>

      {/* Render open windows */}
      {openWindows.map((windowInfo, index) => (
        <Window
          key={windowInfo.id}
          id={windowInfo.id}
          title={windowInfo.title}
          icon={windowInfo.icon}
          isActive={windowInfo.isActive}
          isMinimized={windowInfo.isMinimized}
          onClose={handleWindowClose}
          onMinimize={handleWindowMinimize}
          onFocus={handleWindowFocus}
          zIndex={windowInfo.zIndex}
          initialPosition={
            windowInfo.id === 'icq'
              ? { x: window.innerWidth - 320, y: window.innerHeight - 520 }
              : { x: 100 + index * 30, y: 50 + index * 30 }
          }
          initialSize={
            windowInfo.id === 'homepage' ? { width: 800, height: 550 } :
            windowInfo.id === 'minesweeper' ? { width: 242, height: 308 } :
            windowInfo.id === 'cv-doc' ? { width: 650, height: 500 } :
            windowInfo.id === 'icq' ? { width: 300, height: 450 } :
            windowInfo.id === 'sorry-hotline' ? { width: 620, height: 490 } :
            windowInfo.id === 'court-of-her-name' ? { width: 640, height: 510 } :
            windowInfo.id === 'sorry-vending-machine' ? { width: 630, height: 510 } :
            windowInfo.id === 'boss-fight-ego' ? { width: 580, height: 500 } :
            windowInfo.id === 'sorry-delivery' ? { width: 650, height: 510 } :
            undefined
          }
          showMenuBar={
            windowInfo.id !== 'homepage' &&
            windowInfo.id !== 'minesweeper' &&
            windowInfo.id !== 'cv-doc' &&
            windowInfo.id !== 'icq' &&
            windowInfo.id !== 'sorry-hotline' &&
            windowInfo.id !== 'court-of-her-name' &&
            windowInfo.id !== 'sorry-vending-machine' &&
            windowInfo.id !== 'boss-fight-ego' &&
            windowInfo.id !== 'sorry-delivery'
          }
          showStatusBar={
            windowInfo.id !== 'homepage' &&
            windowInfo.id !== 'minesweeper' &&
            windowInfo.id !== 'cv-doc' &&
            windowInfo.id !== 'icq' &&
            windowInfo.id !== 'sorry-hotline' &&
            windowInfo.id !== 'court-of-her-name' &&
            windowInfo.id !== 'sorry-vending-machine' &&
            windowInfo.id !== 'boss-fight-ego' &&
            windowInfo.id !== 'sorry-delivery'
          }
          statusText={
            windowInfo.id === 'my-computer' ? '6 object(s)' :
            windowInfo.id === 'recycle-bin' ? '0 object(s)' :
            ''
          }
          resizable={windowInfo.id !== 'minesweeper'}
          noPadding={
            windowInfo.id === 'minesweeper' ||
            windowInfo.id === 'cv-doc' ||
            windowInfo.id === 'icq' ||
            windowInfo.id === 'sorry-hotline' ||
            windowInfo.id === 'court-of-her-name' ||
            windowInfo.id === 'sorry-vending-machine' ||
            windowInfo.id === 'boss-fight-ego' ||
            windowInfo.id === 'sorry-delivery'
          }
        >
          {windowInfo.id === 'my-computer' ? (
            <MyComputerContent />
          ) : windowInfo.id === 'homepage' ? (
            <BrowserContent />
          ) : windowInfo.id === 'minesweeper' ? (
            <Minesweeper />
          ) : windowInfo.id === 'cv-doc' ? (
            <Suspense fallback={<p role="status">Loading CV viewer...</p>}><CVViewer /></Suspense>
          ) : windowInfo.id === 'icq' ? (
            <ICQ
              messages={icqMessages}
              setMessages={setIcqMessages}
              unreadCount={icqUnreadCount}
            />
          ) : windowInfo.id === 'sorry-hotline' ? (
            <SorryHotline />
          ) : windowInfo.id === 'court-of-her-name' ? (
            <HerCourt />
          ) : windowInfo.id === 'sorry-vending-machine' ? (
            <SorryVending />
          ) : windowInfo.id === 'boss-fight-ego' ? (
            <BossFight />
          ) : windowInfo.id === 'sorry-delivery' ? (
            <SorryDelivery />
          ) : windowInfo.id === 'recycle-bin' ? (
            <EmptyBinContent>
              <EmptyText>Recycle Bin is empty.</EmptyText>
            </EmptyBinContent>
          ) : (
            <p>Content for {windowInfo.title}</p>
          )}
        </Window>
      ))}

      {/* Start Menu */}
      <StartMenu
        key={String(startMenuOpen)}
        isOpen={startMenuOpen}
        onClose={handleStartMenuClose}
        onOpenApp={handleOpenAppFromStartMenu}
      />

      <Taskbar
        openWindows={openWindows}
        startMenuOpen={startMenuOpen}
        onStartClick={handleStartClick}
        onWindowClick={handleTaskbarWindowClick}
        onICQClick={handleICQClick}
        icqUnreadCount={icqUnreadCount}
      />
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100%;
  background-color: #008080;
  background-image: url('/assets/generated/desktop/wallpaper.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
`;

const IconsArea = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  bottom: 38px;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 5px;
  padding: 5px;
  overflow: auto;
`;

const EmptyBinContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #fff;
`;

const EmptyText = styled.span`
  font-family: 'MS Sans Serif', Tahoma, sans-serif;
  font-size: 11px;
  color: #808080;
`;

export default Desktop;
