import { useEffect } from 'react';
import styled from 'styled-components';

interface BootScreenProps {
  onBootComplete: () => void;
  duration?: number;
}

const BootScreen = ({ onBootComplete, duration = 6000 }: BootScreenProps) => {
  useEffect(() => {
    const timer = setTimeout(onBootComplete, duration);
    return () => clearTimeout(timer);
  }, [duration, onBootComplete]);

  return (
    <Container aria-label="Starting Windows 95">
      <BootImage src="/images/win95-boot.png" alt="Windows 95" />
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100%;
  /* Sky gradient that matches the Windows 95 boot screen clouds */
  background: linear-gradient(
    180deg,
    #7eb4ea 0%,
    #a8cff0 15%,
    #c5dff5 30%,
    #d9ebf9 45%,
    #e8f3fc 60%,
    #d9ebf9 75%,
    #c5dff5 85%,
    #a8cff0 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  overflow: hidden;
`;

const BootImage = styled.img`
  /* Keep the complete original artwork visible at every aspect ratio. */
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
`;

export default BootScreen;
