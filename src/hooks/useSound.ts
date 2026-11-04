import { useCallback, useRef } from 'react';

export const useSound = (soundPath: string) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(soundPath);
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {
      // Autoplay may be blocked by browser - this is expected
      console.log('Sound playback blocked by browser');
    });
  }, [soundPath]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  return { play, stop };
};

export default useSound;
