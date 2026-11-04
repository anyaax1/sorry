import { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

// Rolling Stones tracks with YouTube video IDs for audio
const TRACKS = [
  { title: "You Can't Always Get What You Want", year: "1969", youtubeId: "oqMl5CRoFdk" },
  { title: "Out of Time", year: "1966", youtubeId: "2GIOuEBrXII" },
  { title: "Honky Tonk Women", year: "1969", youtubeId: "bKPwNhPiYJ4" },
  { title: "Paint It Black", year: "1966", youtubeId: "O4irXQhgMqg" },
  { title: "Let It Bleed", year: "1969", youtubeId: "cT-dJvVJyPU" },
  { title: "It's Only Rock and Roll", year: "1974", youtubeId: "mwvJwKRvnG4" },
];

const MusicPlayer = () => {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef<YT.Player | null>(null);
  const intervalRef = useRef<number | null>(null);

  const playerHostRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef(0);

  // Each mount owns its player and callback, including StrictMode remounts.
  useEffect(() => {
    let disposed = false;
    const stopTimer = () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
    const syncMute = () => {
      if (localStorage.getItem('win95-muted') === 'true') playerRef.current?.mute();
      else playerRef.current?.unMute();
    };
    const initPlayer = () => {
      if (disposed || playerRef.current || !playerHostRef.current) return;
      const target = document.createElement('div');
      playerHostRef.current.replaceChildren(target);
      playerRef.current = new window.YT.Player(target, {
        height: '0', width: '0', videoId: TRACKS[0].youtubeId,
        playerVars: { autoplay: 0, controls: 0 },
        events: {
          onReady: event => { event.target.setVolume(70); syncMute(); },
          onStateChange: event => {
            if (disposed) return;
            stopTimer();
            if (event.data === window.YT.PlayerState.ENDED) {
              const next = (trackRef.current + 1) % TRACKS.length;
              trackRef.current = next;
              setCurrentTrack(next);
              setElapsed(5);
              event.target.loadVideoById({ videoId: TRACKS[next].youtubeId, startSeconds: 5 });
            } else if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              setDuration(event.target.getDuration() || 0);
              intervalRef.current = window.setInterval(() => setElapsed(event.target.getCurrentTime() || 0), 1000);
            } else {
              setIsPlaying(false);
            }
          },
        },
      });
    };
    const previousReady = window.onYouTubeIframeAPIReady;
    const onReady = () => { previousReady?.(); initPlayer(); };
    window.onYouTubeIframeAPIReady = onReady;
    if (window.YT?.Player) initPlayer();
    else if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(script);
    }
    window.addEventListener('win95-mute-change', syncMute);
    return () => {
      disposed = true;
      stopTimer();
      playerRef.current?.destroy();
      playerRef.current = null;
      window.removeEventListener('win95-mute-change', syncMute);
      if (window.onYouTubeIframeAPIReady === onReady) window.onYouTubeIframeAPIReady = previousReady;
    };
  }, []);

  const stopTimer = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  const handlePlayPause = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      // If at the start, skip to 5 seconds
      const currentTime = playerRef.current.getCurrentTime() || 0;
      if (currentTime < 5) {
        playerRef.current.seekTo(5, true);
      }
      playerRef.current.playVideo();
    }
  };

  const handlePrev = () => {
    const newIndex = currentTrack === 0 ? TRACKS.length - 1 : currentTrack - 1;
    trackRef.current = newIndex;
    setCurrentTrack(newIndex);
    setElapsed(5);
    if (playerRef.current) {
      playerRef.current.loadVideoById({
        videoId: TRACKS[newIndex].youtubeId,
        startSeconds: 5
      });
    }
  };

  const handleNext = () => {
    const newIndex = (currentTrack + 1) % TRACKS.length;
    trackRef.current = newIndex;
    setCurrentTrack(newIndex);
    setElapsed(5);
    if (playerRef.current) {
      playerRef.current.loadVideoById({
        videoId: TRACKS[newIndex].youtubeId,
        startSeconds: 5
      });
    }
  };

  const handleStop = () => {
    if (playerRef.current) {
      playerRef.current.stopVideo();
      setIsPlaying(false);
      setElapsed(0);
      stopTimer();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume);
    }
  };

  const handleTrackClick = (index: number) => {
    trackRef.current = index;
    setCurrentTrack(index);
    setElapsed(5);
    if (playerRef.current) {
      playerRef.current.loadVideoById({
        videoId: TRACKS[index].youtubeId,
        startSeconds: 5
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <PlayerContainer>
      {/* Hidden YouTube player */}
      <div ref={playerHostRef} style={{ display: 'none' }} />

      {/* WinAmp Style Header */}
      <PlayerHeader>
        <PlayerTitle>WINAMP</PlayerTitle>
        <PlayerButtons>
          <MiniButton>_</MiniButton>
          <MiniButton>□</MiniButton>
          <MiniButton>×</MiniButton>
        </PlayerButtons>
      </PlayerHeader>

      {/* Display */}
      <Display>
        <DisplayLeft>
          <TimeDisplay>{formatTime(elapsed)}</TimeDisplay>
          <Visualizer>
            {[...Array(16)].map((_, i) => (
              <VisualizerBar key={i} $active={isPlaying} style={{ animationDelay: `${i * 0.05}s` }} />
            ))}
          </Visualizer>
        </DisplayLeft>
        <DisplayRight>
          <TrackInfo>
            <ScrollingText $isPlaying={isPlaying}>
              {TRACKS[currentTrack].title} - The Rolling Stones ({TRACKS[currentTrack].year})
            </ScrollingText>
          </TrackInfo>
          <InfoRow>
            <InfoLabel>kbps</InfoLabel>
            <InfoValue>128</InfoValue>
            <InfoLabel>kHz</InfoLabel>
            <InfoValue>44</InfoValue>
          </InfoRow>
        </DisplayRight>
      </Display>

      {/* Progress Bar */}
      <ProgressContainer>
        <ProgressBar style={{ width: duration ? `${(elapsed / duration) * 100}%` : '0%' }} />
      </ProgressContainer>

      {/* Controls */}
      <Controls>
        <ControlButton onClick={handlePrev} title="Previous">⏮</ControlButton>
        <ControlButton onClick={handlePlayPause} title={isPlaying ? "Pause" : "Play"} $primary>
          {isPlaying ? '⏸' : '▶'}
        </ControlButton>
        <ControlButton onClick={handleStop} title="Stop">⏹</ControlButton>
        <ControlButton onClick={handleNext} title="Next">⏭</ControlButton>
        <VolumeContainer>
          <VolumeLabel>VOL</VolumeLabel>
          <VolumeSlider
            aria-label="Music volume"
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
          />
        </VolumeContainer>
      </Controls>

      {/* Playlist */}
      <Playlist>
        <PlaylistHeader>
          <PlaylistTitle>🎵 PLAYLIST 🎵</PlaylistTitle>
        </PlaylistHeader>
        <PlaylistTracks>
          {TRACKS.map((track, index) => (
            <PlaylistTrack
              key={index}
              $active={index === currentTrack}
              onClick={() => handleTrackClick(index)}
            >
              <TrackNumber>{index + 1}.</TrackNumber>
              <TrackTitle>{track.title}</TrackTitle>
              <TrackYear>({track.year})</TrackYear>
            </PlaylistTrack>
          ))}
        </PlaylistTracks>
      </Playlist>
    </PlayerContainer>
  );
};

// Add YouTube API types
declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

// Animations
const scroll = keyframes`
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
`;

const bounce = keyframes`
  0%, 100% { height: 3px; }
  50% { height: 15px; }
`;

// Styled Components
const PlayerContainer = styled.div`
  background: linear-gradient(180deg, #3a3a50 0%, #28283a 100%);
  border: 2px solid #555;
  border-radius: 3px;
  padding: 5px;
  max-width: 350px;
  margin: 20px auto;
  font-family: 'MS Sans Serif', Tahoma, sans-serif;
  box-shadow:
    inset 1px 1px 0 #666,
    inset -1px -1px 0 #222,
    3px 3px 10px rgba(0,0,0,0.5);
`;

const PlayerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(180deg, #4a4a6a 0%, #3a3a50 100%);
  padding: 2px 5px;
  border-bottom: 1px solid #222;
`;

const PlayerTitle = styled.span`
  color: #00ff00;
  font-size: 10px;
  font-weight: bold;
  letter-spacing: 1px;
`;

const PlayerButtons = styled.div`
  display: flex;
  gap: 2px;
`;

const MiniButton = styled.button`
  width: 12px;
  height: 12px;
  font-size: 8px;
  background: #555;
  border: 1px solid;
  border-color: #777 #333 #333 #777;
  color: #ccc;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  line-height: 1;
`;

const Display = styled.div`
  display: flex;
  background: #000;
  border: 2px solid;
  border-color: #222 #444 #444 #222;
  margin: 5px 0;
  padding: 5px;
  min-height: 50px;
`;

const DisplayLeft = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-right: 10px;
  border-right: 1px solid #333;
`;

const TimeDisplay = styled.div`
  color: #00ff00;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  font-weight: bold;
  text-shadow: 0 0 5px #00ff00;
`;

const Visualizer = styled.div`
  display: flex;
  gap: 2px;
  align-items: flex-end;
  height: 20px;
  margin-top: 5px;
`;

const VisualizerBar = styled.div<{ $active: boolean }>`
  width: 3px;
  background: linear-gradient(180deg, #00ff00 0%, #008800 100%);
  animation: ${props => props.$active ? bounce : 'none'} 0.3s ease-in-out infinite;
  height: 3px;
`;

const DisplayRight = styled.div`
  flex: 1;
  padding-left: 10px;
  overflow: hidden;
`;

const TrackInfo = styled.div`
  overflow: hidden;
  white-space: nowrap;
`;

const ScrollingText = styled.div<{ $isPlaying: boolean }>`
  color: #00ff00;
  font-size: 11px;
  animation: ${props => props.$isPlaying ? scroll : 'none'} 10s linear infinite;
  display: inline-block;
`;

const InfoRow = styled.div`
  display: flex;
  gap: 5px;
  margin-top: 8px;
`;

const InfoLabel = styled.span`
  color: #888;
  font-size: 8px;
`;

const InfoValue = styled.span`
  color: #00ff00;
  font-size: 10px;
  font-weight: bold;
`;

const ProgressContainer = styled.div`
  height: 8px;
  background: #222;
  border: 1px solid;
  border-color: #111 #444 #444 #111;
  margin: 5px 0;
`;

const ProgressBar = styled.div`
  height: 100%;
  background: linear-gradient(180deg, #00ff00 0%, #008800 100%);
  transition: width 0.5s linear;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  flex-wrap: wrap;
  padding: 5px;
`;

const ControlButton = styled.button<{ $primary?: boolean }>`
  width: ${props => props.$primary ? '35px' : '28px'};
  height: ${props => props.$primary ? '25px' : '22px'};
  font-size: ${props => props.$primary ? '14px' : '12px'};
  background: linear-gradient(180deg, #555 0%, #333 100%);
  border: 2px solid;
  border-color: #666 #222 #222 #666;
  color: #00ff00;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: linear-gradient(180deg, #666 0%, #444 100%);
  }

  &:active {
    border-color: #222 #666 #666 #222;
  }
`;

const VolumeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  margin-left: 10px;
`;

const VolumeLabel = styled.span`
  color: #888;
  font-size: 8px;
`;

const VolumeSlider = styled.input`
  width: 60px;
  height: 8px;
  -webkit-appearance: none;
  background: #222;
  border: 1px solid #444;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 8px;
    height: 14px;
    background: #00ff00;
    border: 1px solid #008800;
    cursor: pointer;
  }
`;

const Playlist = styled.div`
  background: #1a1a2a;
  border: 2px solid;
  border-color: #222 #444 #444 #222;
  margin-top: 5px;
`;

const PlaylistHeader = styled.div`
  background: linear-gradient(180deg, #3a3a50 0%, #28283a 100%);
  padding: 3px 5px;
  border-bottom: 1px solid #222;
`;

const PlaylistTitle = styled.div`
  color: #00ff00;
  font-size: 9px;
  text-align: center;
`;

const PlaylistTracks = styled.div`
  max-height: 120px;
  overflow-y: auto;
`;

const PlaylistTrack = styled.div<{ $active: boolean }>`
  display: flex;
  gap: 5px;
  padding: 3px 5px;
  cursor: pointer;
  background: ${props => props.$active ? '#004400' : 'transparent'};
  color: ${props => props.$active ? '#00ff00' : '#888'};
  font-size: 10px;

  &:hover {
    background: ${props => props.$active ? '#004400' : '#2a2a3a'};
    color: #00ff00;
  }
`;

const TrackNumber = styled.span`
  color: #666;
  width: 15px;
`;

const TrackTitle = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TrackYear = styled.span`
  color: #666;
  font-size: 9px;
`;

export default MusicPlayer;
