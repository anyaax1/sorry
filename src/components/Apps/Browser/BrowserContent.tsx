import { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import HomePage from './HomePage';

// Real Windows 98 IE toolbar icons
const ICONS = {
  ie: 'https://win98icons.alexmeub.com/icons/png/msie1-2.png',
  ieThrobberLoading: '/icons/ie-throbber-tenor.gif',   // Animated globe when loading
  ieThrobberIdle: '/icons/ie-throbber-static.png',    // First frame of animation (static)
  page: 'https://win98icons.alexmeub.com/icons/png/html-3.png',
  search: 'https://win98icons.alexmeub.com/icons/png/search_web-0.png',
  history: 'https://win98icons.alexmeub.com/icons/png/history-0.png',
  mail: 'https://win98icons.alexmeub.com/icons/png/outlook_express-0.png',
  print: 'https://win98icons.alexmeub.com/icons/png/printer-0.png',
};

const BrowserContent = () => {
  const HOME_URL = 'http://fonchi.ridao.ar/';
  const [isLoading, setIsLoading] = useState(true);
  const [statusText, setStatusText] = useState('Opening page...');
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (refreshTimer.current) clearTimeout(refreshTimer.current); }, []);

  // Initial load animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setStatusText('Done');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Refresh - just show loading animation briefly
  const handleRefresh = () => {
    setIsLoading(true);
    setStatusText('Refreshing...');
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => {
      setIsLoading(false);
      setStatusText('Done');
    }, 1000);
  };

  return (
    <Container>
      {/* IE Menu Bar */}
      <MenuBar>
        <MenuBarItem>File</MenuBarItem>
        <MenuBarItem>Edit</MenuBarItem>
        <MenuBarItem>View</MenuBarItem>
        <MenuBarItem>Go</MenuBarItem>
        <MenuBarItem>Favorites</MenuBarItem>
        <MenuBarItem>Help</MenuBarItem>
      </MenuBar>

      {/* IE Toolbar */}
      <Toolbar>
        <ToolbarSection>
          <ToolbarButton disabled title="Back">
            <IconWrapper>
              <BackIcon disabled />
            </IconWrapper>
            <ToolbarLabel>Back</ToolbarLabel>
          </ToolbarButton>
          <ToolbarButton disabled title="Forward">
            <IconWrapper>
              <ForwardIcon disabled />
            </IconWrapper>
            <ToolbarLabel>Forward</ToolbarLabel>
          </ToolbarButton>
          <ToolbarSeparator />
          <ToolbarButton disabled title="Stop">
            <IconWrapper>
              <StopIconSVG disabled />
            </IconWrapper>
            <ToolbarLabel>Stop</ToolbarLabel>
          </ToolbarButton>
          <ToolbarButton onClick={handleRefresh} title="Refresh">
            <IconWrapper>
              <RefreshIconSVG />
            </IconWrapper>
            <ToolbarLabel>Refresh</ToolbarLabel>
          </ToolbarButton>
          <ToolbarButton onClick={handleRefresh} title="Home">
            <IconWrapper>
              <HomeIconSVG />
            </IconWrapper>
            <ToolbarLabel>Home</ToolbarLabel>
          </ToolbarButton>
          <ToolbarSeparator />
          <ToolbarButton disabled title="Search">
            <ToolbarIcon src={ICONS.search} alt="Search" />
            <ToolbarLabel>Search</ToolbarLabel>
          </ToolbarButton>
          <ToolbarButton disabled title="History">
            <ToolbarIcon src={ICONS.history} alt="History" />
            <ToolbarLabel>History</ToolbarLabel>
          </ToolbarButton>
          <ToolbarButton disabled title="Print">
            <ToolbarIcon src={ICONS.print} alt="Print" />
            <ToolbarLabel>Print</ToolbarLabel>
          </ToolbarButton>
          <ToolbarButton disabled title="Mail">
            <ToolbarIcon src={ICONS.mail} alt="Mail" />
            <ToolbarLabel>Mail</ToolbarLabel>
          </ToolbarButton>
        </ToolbarSection>

        <ThrobberContainer>
          <Throbber>
            <ThrobberIcon
              src={isLoading ? ICONS.ieThrobberLoading : ICONS.ieThrobberIdle}
              alt="IE"
            />
          </Throbber>
        </ThrobberContainer>
      </Toolbar>

      {/* Address Bar - Read Only */}
      <AddressBarContainer>
        <AddressLabel>Address</AddressLabel>
        <AddressInputWrapper>
          <PageIconImg src={ICONS.page} alt="" />
          <AddressDisplay>{HOME_URL}</AddressDisplay>
          <DropdownButton type="button">▼</DropdownButton>
        </AddressInputWrapper>
      </AddressBarContainer>

      {/* Browser Content */}
      <BrowserFrame>
        {isLoading ? (
          <LoadingScreen>
            <LoadingLogo>
              <LoadingIcon src={ICONS.ie} alt="IE" />
            </LoadingLogo>
            <LoadingText>Opening page {HOME_URL}</LoadingText>
            <LoadingBarContainer>
              <LoadingBar />
            </LoadingBarContainer>
          </LoadingScreen>
        ) : (
          <HomePage />
        )}
      </BrowserFrame>

      {/* Status Bar */}
      <StatusBarContainer>
        <StatusSection $flex={3}>
          {isLoading ? (
            <>
              <StatusIconSmall src={ICONS.ie} alt="" />
              {statusText}
            </>
          ) : (
            statusText || 'Done'
          )}
        </StatusSection>
        <StatusSection $flex={1}>
          <ZoneIcon>🌐</ZoneIcon>
          Internet zone
        </StatusSection>
      </StatusBarContainer>
    </Container>
  );
};

// SVG Icon Components - Windows 98 IE4/5 style
const BackIcon = ({ disabled }: { disabled: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <rect x="8" y="4" width="10" height="14" fill={disabled ? '#808080' : '#ffff80'} stroke={disabled ? '#404040' : '#000'} strokeWidth="1"/>
    <rect x="10" y="6" width="6" height="1" fill={disabled ? '#404040' : '#000'}/>
    <rect x="10" y="8" width="6" height="1" fill={disabled ? '#404040' : '#000'}/>
    <rect x="10" y="10" width="4" height="1" fill={disabled ? '#404040' : '#000'}/>
    <polygon points="2,11 9,5 9,8 9,8 9,14 9,14 9,17" fill={disabled ? '#808080' : '#008000'} stroke={disabled ? '#404040' : '#004000'} strokeWidth="1"/>
    <polygon points="3,11 8,7 8,15" fill={disabled ? '#a0a0a0' : '#00c000'}/>
  </svg>
);

const ForwardIcon = ({ disabled }: { disabled: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <rect x="4" y="4" width="10" height="14" fill={disabled ? '#808080' : '#ffff80'} stroke={disabled ? '#404040' : '#000'} strokeWidth="1"/>
    <rect x="6" y="6" width="6" height="1" fill={disabled ? '#404040' : '#000'}/>
    <rect x="6" y="8" width="6" height="1" fill={disabled ? '#404040' : '#000'}/>
    <rect x="6" y="10" width="4" height="1" fill={disabled ? '#404040' : '#000'}/>
    <polygon points="20,11 13,5 13,8 13,8 13,14 13,14 13,17" fill={disabled ? '#808080' : '#008000'} stroke={disabled ? '#404040' : '#004000'} strokeWidth="1"/>
    <polygon points="19,11 14,7 14,15" fill={disabled ? '#a0a0a0' : '#00c000'}/>
  </svg>
);

const StopIconSVG = ({ disabled }: { disabled: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="11" r="9" fill={disabled ? '#808080' : '#ff0000'} stroke={disabled ? '#404040' : '#800000'} strokeWidth="1"/>
    <circle cx="11" cy="11" r="7" fill={disabled ? '#a0a0a0' : '#ff4040'}/>
    <line x1="7" y1="7" x2="15" y2="15" stroke={disabled ? '#606060' : '#fff'} strokeWidth="2"/>
    <line x1="15" y1="7" x2="7" y2="15" stroke={disabled ? '#606060' : '#fff'} strokeWidth="2"/>
  </svg>
);

const RefreshIconSVG = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M11 3 A8 8 0 1 1 3 11" stroke="#008000" strokeWidth="2" fill="none"/>
    <path d="M11 19 A8 8 0 1 1 19 11" stroke="#00c000" strokeWidth="2" fill="none"/>
    <polygon points="11,1 14,5 8,5" fill="#008000"/>
    <polygon points="11,21 8,17 14,17" fill="#00c000"/>
  </svg>
);

const HomeIconSVG = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <polygon points="11,2 2,10 4,10 4,19 18,19 18,10 20,10" fill="#c0c0c0" stroke="#000" strokeWidth="1"/>
    <polygon points="11,3 4,9 18,9" fill="#ff8080"/>
    <rect x="5" y="10" width="12" height="8" fill="#ffff80" stroke="#000" strokeWidth="1"/>
    <rect x="9" y="12" width="4" height="6" fill="#804000" stroke="#000" strokeWidth="1"/>
    <rect x="6" y="11" width="3" height="3" fill="#80c0ff" stroke="#000" strokeWidth="1"/>
    <rect x="13" y="11" width="3" height="3" fill="#80c0ff" stroke="#000" strokeWidth="1"/>
  </svg>
);

// Animations
const loadingProgress = keyframes`
  0% { width: 0%; }
  100% { width: 100%; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: #c0c0c0;
  font-family: 'MS Sans Serif', 'Segoe UI', Tahoma, sans-serif;
  font-size: 11px;
`;

const MenuBar = styled.div`
  display: flex;
  padding: 2px 0;
  background-color: #c0c0c0;
  border-bottom: 1px solid #808080;
`;

const MenuBarItem = styled.span`
  padding: 2px 8px;
  cursor: default;
  &:hover {
    background-color: #000080;
    color: #fff;
  }
`;

const Toolbar = styled.div`
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2px 4px;
  background-color: #c0c0c0;
  border-bottom: 1px solid #808080;
  min-height: 50px;
`;

const ToolbarSection = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 2px;
  flex-wrap: wrap;
`;

const ToolbarButton = styled.button<{ disabled?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3px 4px;
  background-color: transparent;
  border: none;
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
  min-width: 44px;
  opacity: ${props => props.disabled ? 0.6 : 1};

  &:hover:not(:disabled) {
    background-color: #dfdfdf;
    border: 1px solid;
    border-color: #fff #808080 #808080 #fff;
    padding: 2px 3px;
  }

  &:active:not(:disabled) {
    background-color: #c0c0c0;
    border: 1px solid;
    border-color: #808080 #fff #fff #808080;
    padding: 2px 3px;
  }
`;

const IconWrapper = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ToolbarIcon = styled.img`
  width: 24px;
  height: 24px;
  image-rendering: pixelated;
`;

const ToolbarLabel = styled.span`
  font-size: 9px;
  color: #000;
  margin-top: 2px;
`;

const ToolbarSeparator = styled.div`
  width: 2px;
  height: 40px;
  margin: 0 4px;
  border-left: 1px solid #808080;
  border-right: 1px solid #fff;
`;

const ThrobberContainer = styled.div`
  padding: 2px;
`;

const Throbber = styled.div`
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid;
  border-color: #fff #808080 #808080 #fff;
  overflow: hidden;
  background: #fff;
`;

const ThrobberIcon = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const AddressBarContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 2px 4px;
  background-color: #c0c0c0;
  border-bottom: 1px solid #808080;
  gap: 4px;
`;

const AddressLabel = styled.span`
  padding: 2px 6px;
  background-color: #c0c0c0;
  border: 1px solid;
  border-color: #fff #808080 #808080 #fff;
`;

const AddressInputWrapper = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  background-color: #fff;
  border: 2px solid;
  border-color: #808080 #dfdfdf #dfdfdf #808080;
  height: 22px;
`;

const PageIconImg = styled.img`
  width: 16px;
  height: 16px;
  margin: 0 2px;
  image-rendering: pixelated;
`;

const AddressDisplay = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-family: 'MS Sans Serif', Tahoma, sans-serif;
  font-size: 11px;
  padding: 0 4px;
  color: #000;
`;

const DropdownButton = styled.button`
  width: 18px;
  height: 18px;
  border: 1px solid;
  border-color: #dfdfdf #808080 #808080 #dfdfdf;
  background: #c0c0c0;
  font-size: 8px;
  cursor: default;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BrowserFrame = styled.div`
  flex: 1;
  min-height: 0;
  container-type: inline-size;
  overflow: auto;
  background-color: #fff;
  border: 2px solid;
  border-color: #808080 #dfdfdf #dfdfdf #808080;
  margin: 2px;
  position: relative;
`;

const LoadingScreen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #c0c0c0;
  gap: 15px;
`;

const LoadingLogo = styled.div`
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #87ceeb 0%, #4169e1 50%, #000080 100%);
  border: 3px solid;
  border-color: #fff #808080 #808080 #fff;
  animation: ${pulse} 1s ease-in-out infinite;
`;

const LoadingIcon = styled.img`
  width: 48px;
  height: 48px;
  image-rendering: pixelated;
`;

const LoadingText = styled.div`
  color: #000;
`;

const LoadingBarContainer = styled.div`
  width: min(300px, 90%);
  height: 20px;
  border: 2px solid;
  border-color: #808080 #dfdfdf #dfdfdf #808080;
  background-color: #fff;
  padding: 2px;
`;

const LoadingBar = styled.div`
  height: 100%;
  background: repeating-linear-gradient(
    90deg,
    #000080,
    #000080 10px,
    transparent 10px,
    transparent 12px
  );
  animation: ${loadingProgress} 2s ease-out forwards;
`;

const StatusBarContainer = styled.div`
  display: flex;
  padding: 2px;
  background-color: #c0c0c0;
  gap: 2px;
`;

const StatusSection = styled.div<{ $flex: number }>`
  flex: ${props => props.$flex};
  padding: 2px 4px;
  border: 1px solid;
  border-color: #808080 #dfdfdf #dfdfdf #808080;
  display: flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StatusIconSmall = styled.img`
  width: 16px;
  height: 16px;
  image-rendering: pixelated;
`;

const ZoneIcon = styled.span`
  font-size: 12px;
`;

export default BrowserContent;
