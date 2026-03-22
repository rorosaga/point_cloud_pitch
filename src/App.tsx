import { useRef, useEffect, useCallback, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './components/Scene';
import type { ViewMode } from './components/Scene';
import { FootballPitch } from './components/FootballPitch';
import type { FootballPitchHandle } from './components/FootballPitch';
import { Confetti } from './components/Confetti';
import { usePointCloud } from './hooks/usePointCloud';
import { PITCH_LENGTH, PITCH_WIDTH } from './lib/pitchConstants';

function PitchWithData() {
  const pitchRef = useRef<FootballPitchHandle>(null);

  const handlePoints = useCallback((points: Float32Array) => {
    pitchRef.current?.addPoints(points);
  }, []);

  usePointCloud(handlePoints);

  // Demo mode: press D to simulate a reveal sweep
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'd' || e.key === 'D') {
        let progress = 0;
        const interval = setInterval(() => {
          const fakePoints = new Float32Array(300);
          for (let i = 0; i < 100; i++) {
            fakePoints[i * 3 + 0] = progress * PITCH_LENGTH + (Math.random() - 0.5) * 0.5;
            fakePoints[i * 3 + 1] = (Math.random() - 0.5) * PITCH_WIDTH;
            fakePoints[i * 3 + 2] = 0;
          }
          pitchRef.current?.addPoints(fakePoints);
          progress += 0.02;
          if (progress > 1) clearInterval(interval);
        }, 50);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return <FootballPitch ref={pitchRef} />;
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

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('perspective');

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

      <Confetti />
    </>
  );
}
