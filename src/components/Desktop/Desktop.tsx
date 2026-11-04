import { useState, useCallback } from 'react';
import styled from 'styled-components';
import Taskbar from './Taskbar';
import StartMenu from './StartMenu';
import DesktopIcon from './DesktopIcon';
import Window from '../Windows/Window';
import MyComputerContent from '../Apps/MyComputer/MyComputerContent';
import BrowserContent from '../Apps/Browser/BrowserContent';
import Minesweeper from '../Apps/Games/Minesweeper/Minesweeper';
import SorryHotline from '../Apps/SorryHotline/SorryHotline';
import HerCourt from '../Apps/HerCourt/HerCourt';
import SorryVending from '../Apps/SorryVending/SorryVending';
import BossFight from '../Apps/BossFight/BossFight';
import SorryDelivery from '../Apps/SorryDelivery/SorryDelivery';
import { getAssetUrl } from '../../utils/assetPath';

export interface WindowInfo {
  id: string;
  title: string;
  icon?: string;
  isMinimized: boolean;
  isActive: boolean;
  zIndex: number;
}

const iconToPath: Record<string, string> = {
  'my-computer': getAssetUrl('/icons/my-computer.png'),
  'recycle-bin': getAssetUrl('/icons/recycle-bin.png'),
  'minesweeper': getAssetUrl('/icons/minesweeper.png'),
  'homepage': getAssetUrl('/icons/internet.png'),
  'sorry-hotline': getAssetUrl('/assets/generated/icons/sorry-hotline.png'),
  'court-of-her-name': getAssetUrl('/assets/generated/icons/court.png'),
  'sorry-vending-machine': getAssetUrl('/assets/generated/icons/vending.png'),
  'boss-fight-ego': getAssetUrl('/assets/generated/icons/boss-fight.png'),
  'sorry-delivery': getAssetUrl('/assets/generated/icons/delivery.png'),
};

function activateTopWindow(windows: WindowInfo[]) {
  const top = windows.filter(w => !w.isMinimized).sort((a, b) => b.zIndex - a.zIndex)[0];
  return windows.map(w => ({ ...w, isActive: w.id === top?.id }));
}

export const Desktop = () => {
  const [openWindows, setOpenWindows] = useState<WindowInfo[]>([]);
  const [startMenuOpen, setStartMenuOpen] = useState(false);

  const handleIconDoubleClick = useCallback((id: string, title: string) => {
    setOpenWindows(prev => {
      const nextZIndex = Math.max(99, ...prev.map(w => w.zIndex)) + 1;
      const existing = prev.some(w => w.id === id);
      const windows = prev.map(w => ({
        ...w,
        isMinimized: w.id === id ? false : w.isMinimized,
        isActive: w.id === id,
        zIndex: w.id === id ? nextZIndex : w.zIndex,
      }));
      return existing
        ? windows
        : [...windows, { id, title, icon: iconToPath[id], isMinimized: false, isActive: true, zIndex: nextZIndex }];
    });
  }, []);

  const handleWindowClose = useCallback((id: string) => {
    setOpenWindows(prev => activateTopWindow(prev.filter(w => w.id !== id)));
  }, []);

  const handleWindowMinimize = useCallback((id: string) => {
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

  return (
    <Container
      onClick={handleDesktopClick}
      aria-label="Windows 95 desktop"
      style={{ backgroundImage: `url("${getAssetUrl('/assets/generated/desktop/wallpaper.png')}")` }}
    >
      <IconsArea role="group" aria-label="Desktop icons">
        <DesktopIcon
          id="my-computer"
          icon={getAssetUrl('/icons/my-computer.png')}
          label="My Computer"
          onDoubleClick={handleIconDoubleClick}
        />
        <DesktopIcon
          id="recycle-bin"
          icon={getAssetUrl('/icons/recycle-bin.png')}
          label="Recycle Bin"
          onDoubleClick={handleIconDoubleClick}
        />
        <DesktopIcon
          id="sorry-hotline"
          icon={getAssetUrl('/assets/generated/icons/sorry-hotline.png')}
          label="Sorry Hotline"
          onDoubleClick={handleIconDoubleClick}
        />
        <DesktopIcon
          id="court-of-her-name"
          icon={getAssetUrl('/assets/generated/icons/court.png')}
          label="The Court of Her Name"
          onDoubleClick={handleIconDoubleClick}
        />
        <DesktopIcon
          id="sorry-vending-machine"
          icon={getAssetUrl('/assets/generated/icons/vending.png')}
          label="Sorry Vending Machine"
          onDoubleClick={handleIconDoubleClick}
        />
        <DesktopIcon
          id="boss-fight-ego"
          icon={getAssetUrl('/assets/generated/icons/boss-fight.png')}
          label="Boss Fight: My Ego"
          onDoubleClick={handleIconDoubleClick}
        />
        <DesktopIcon
          id="sorry-delivery"
          icon={getAssetUrl('/assets/generated/icons/delivery.png')}
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
          initialPosition={{ x: 100 + index * 30, y: 50 + index * 30 }}
          initialSize={
            windowInfo.id === 'homepage' ? { width: 800, height: 550 } :
            windowInfo.id === 'minesweeper' ? { width: 242, height: 308 } :
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
            windowInfo.id !== 'sorry-hotline' &&
            windowInfo.id !== 'court-of-her-name' &&
            windowInfo.id !== 'sorry-vending-machine' &&
            windowInfo.id !== 'boss-fight-ego' &&
            windowInfo.id !== 'sorry-delivery'
          }
          showStatusBar={
            windowInfo.id !== 'homepage' &&
            windowInfo.id !== 'minesweeper' &&
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
      />
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100%;
  background-color: #008080;
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
`;

const IconsArea = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 30px;
  width: auto;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-content: flex-start;
  padding: 8px;
  gap: 12px;
  z-index: 1;
`;

const EmptyBinContent = styled.div`
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const EmptyText = styled.p`
  color: #808080;
  font-size: 14px;
`;

export default Desktop;
