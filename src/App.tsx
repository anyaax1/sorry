import { useState, useCallback } from 'react';
import { ThemeProvider } from 'styled-components';
import original from 'react95/dist/themes/original';
import { styleReset } from 'react95';
import { createGlobalStyle } from 'styled-components';

import BootScreen from './components/Boot/BootScreen';
import Desktop from './components/Desktop/Desktop';
import { useSessionTracking } from './hooks/useSessionTracking';

const GlobalStyles = createGlobalStyle`
  ${styleReset}

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
    overscroll-behavior: none;
  }

  body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
    overscroll-behavior: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    font-family: 'MS Sans Serif', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #008080;
  }

  #root {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
`;

type AppState = 'booting' | 'desktop';

function App() {
  const [appState, setAppState] = useState<AppState>('booting');

  // Track session duration and log visits
  useSessionTracking();

  const handleBootComplete = useCallback(() => {
    setAppState('desktop');
  }, []);

  return (
    <ThemeProvider theme={original}>
      <GlobalStyles />
      {appState === 'booting' && (
        <BootScreen onBootComplete={handleBootComplete} duration={2000} />
      )}
      {appState === 'desktop' && <Desktop />}
    </ThemeProvider>
  );
}

export default App;
