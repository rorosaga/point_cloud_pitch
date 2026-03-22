import { useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './components/Scene';
import type { ViewMode } from './components/Scene';
import { FootballPitch } from './components/FootballPitch';
import { Confetti } from './components/Confetti';
import { CharacterSelect } from './components/CharacterSelect';

function PitchWithData() {
  return (
    <>
      <FootballPitch />
    </>
  );
}

// Idle crowd ambient audio — resumes on first user interaction if autoplay is blocked
function useCrowdAudio(active: boolean, muted: boolean) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (active) {
      const audio = new Audio('/idle_crowd.mp3');
      audio.loop = true;
      audio.volume = 0.3;
      audio.muted = muted;
      audioRef.current = audio;

      const tryPlay = () => {
        audio.play().catch(() => {});
      };

      // Try immediately, and also on first click if blocked
      tryPlay();
      const onClick = () => { tryPlay(); document.removeEventListener('click', onClick); };
      document.addEventListener('click', onClick);

      return () => {
        document.removeEventListener('click', onClick);
        audio.pause();
        audioRef.current = null;
      };
    }
  }, [active]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = muted;
    }
  }, [muted]);
}

const viewButtons: { mode: ViewMode; label: string }[] = [
  { mode: 'perspective', label: '3D' },
  { mode: 'side', label: 'Side' },
  { mode: 'topdown', label: 'Top' },
];

const btnStyle = (active: boolean): React.CSSProperties => ({
  padding: '8px 20px',
  border: 'none',
  borderRadius: 6,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  background: active ? '#222' : 'rgba(0,0,0,0.08)',
  color: active ? '#fff' : '#333',
  transition: 'all 0.2s',
});

type Screen = 'select' | 'pitch';

export default function App() {
  const [screen, setScreen] = useState<Screen>('select');
  const [viewMode, setViewMode] = useState<ViewMode>('side');
  const [muted, setMuted] = useState(false);

  useCrowdAudio(true, muted);

  if (screen === 'select') {
    return <CharacterSelect onReady={() => setScreen('pitch')} muted={muted} onToggleMute={() => setMuted(m => !m)} />;
  }

  return (
    <>
      <Canvas
        camera={{ position: [0, 8, 10], fov: 50 }}
        style={{ background: 'white' }}
      >
        <Scene viewMode={viewMode}>
          <PitchWithData />
        </Scene>
      </Canvas>

      {/* Video stream overlay */}
      <div style={{
        position: 'fixed',
        top: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        border: '2px solid rgba(0,0,0,0.1)',
        pointerEvents: 'none',
      }}>
        <iframe
          src="/stream"
          title="Video stream"
          style={{
            display: 'block',
            width: 640,
            height: 360,
            border: 'none',
            background: '#111',
          }}
        />
      </div>

      {/* View mode buttons */}
      <div style={{
        position: 'fixed',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 8,
        zIndex: 20,
        background: 'rgba(255,255,255,0.85)',
        padding: '6px 10px',
        borderRadius: 10,
        backdropFilter: 'blur(8px)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
      }}>
        {viewButtons.map(({ mode, label }) => (
          <button
            key={mode}
            style={btnStyle(viewMode === mode)}
            onClick={() => setViewMode(mode)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Back button */}
      <button
        onClick={() => setScreen('select')}
        style={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 20,
          padding: '8px 16px',
          border: 'none',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          background: 'rgba(0,0,0,0.08)',
          color: '#333',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
          transition: 'all 0.2s',
        }}
      >
        ← Back
      </button>

      {/* Mute button */}
      <button
        onClick={() => setMuted(m => !m)}
        style={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 20,
          width: 40,
          height: 40,
          border: 'none',
          borderRadius: 10,
          fontSize: 20,
          cursor: 'pointer',
          background: 'rgba(0,0,0,0.08)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {muted ? '🔇' : '🔊'}
      </button>

      <Confetti />
    </>
  );
}
