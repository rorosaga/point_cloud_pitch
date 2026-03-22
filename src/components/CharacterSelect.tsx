import { useState, useCallback, useEffect, useRef } from 'react';

const CHARACTERS = [
  { id: 'go1', name: 'Go1', img: '/go1.png' },
  { id: 'go2', name: 'Go2', img: '/go2.png' },
  { id: 'person', name: 'Human', img: '/person.png' },
];

type Selection = { id: string; img: string } | null;

export function CharacterSelect({ onReady }: { onReady: () => void }) {
  const [p1, setP1] = useState<Selection>(null);
  const [p2, setP2] = useState<Selection>(null);
  const [p1Locked, setP1Locked] = useState(false);
  const [p2Locked, setP2Locked] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [shake, setShake] = useState<1 | 2 | 0>(0);
  const [flash, setFlash] = useState(false);
  const cheerRef = useRef<HTMLAudioElement | null>(null);

  const currentPlayer = !p1Locked ? 1 : !p2Locked ? 2 : 0;
  const bothLocked = p1Locked && p2Locked;

  const handleHover = useCallback((id: string, img: string) => {
    setHovered(id);
    if (!p1Locked) {
      setP1({ id, img });
    } else if (!p2Locked) {
      setP2({ id, img });
    }
  }, [p1Locked, p2Locked]);

  const handleSelect = useCallback((id: string, img: string) => {
    if (!p1Locked) {
      setP1({ id, img });
      setP1Locked(true);
      setShake(1);
      setFlash(true);
      setTimeout(() => { setShake(0); setFlash(false); }, 400);
    } else if (!p2Locked) {
      setP2({ id, img });
      setP2Locked(true);
      setShake(2);
      setFlash(true);
      setTimeout(() => { setShake(0); setFlash(false); }, 400);
    }
  }, [p1Locked, p2Locked]);

  const handleStart = useCallback(() => {
    const cheer = new Audio('/cheer.mp3');
    cheerRef.current = cheer;
    cheer.play().catch(() => {});
    setTimeout(onReady, 1500);
  }, [onReady]);

  // Inject keyframe animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slamIn {
        0% { transform: scale(0.3) rotate(-8deg); opacity: 0; }
        50% { transform: scale(1.15) rotate(3deg); opacity: 1; }
        100% { transform: scale(1) rotate(0deg); opacity: 1; }
      }
      @keyframes shakeSlot {
        0%, 100% { transform: translateX(0); }
        10% { transform: translateX(-12px) rotate(-2deg); }
        30% { transform: translateX(10px) rotate(2deg); }
        50% { transform: translateX(-8px) rotate(-1deg); }
        70% { transform: translateX(6px) rotate(1deg); }
        90% { transform: translateX(-3px); }
      }
      @keyframes screenFlash {
        0% { opacity: 0.7; }
        100% { opacity: 0; }
      }
      @keyframes pulseGlow {
        0%, 100% { box-shadow: 0 0 20px rgba(255,255,255,0.1); }
        50% { box-shadow: 0 0 40px rgba(255,255,255,0.3); }
      }
      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <div style={styles.container}>
      {/* Screen flash on select */}
      {flash && <div style={styles.flash} />}

      <h1 style={styles.title}>CHOOSE YOUR FIGHTER</h1>
      <p style={styles.subtitle}>
        {currentPlayer === 1 && '⬅ PLAYER 1 — SELECT'}
        {currentPlayer === 2 && 'PLAYER 2 — SELECT ➡'}
        {bothLocked && '⚡ READY ⚡'}
      </p>

      {/* VS Display — large character portraits */}
      <div style={styles.vsRow}>
        {/* Player 1 slot */}
        <div style={{
          ...styles.slot,
          borderColor: p1Locked ? '#e63946' : (currentPlayer === 1 && hovered ? 'rgba(230,57,70,0.5)' : 'rgba(0,0,0,0.1)'),
          boxShadow: p1Locked ? '0 0 60px rgba(230,57,70,0.5), inset 0 0 30px rgba(230,57,70,0.1)' : '0 4px 20px rgba(0,0,0,0.05)',
          animation: shake === 1 ? 'shakeSlot 0.4s ease-out' : undefined,
        }}>
          {p1 ? (
            <img
              src={p1.img}
              alt="P1"
              style={{
                ...styles.slotImg,
                animation: p1Locked ? 'slamIn 0.4s ease-out' : undefined,
              }}
            />
          ) : (
            <span style={styles.question}>?</span>
          )}
          <div style={{ ...styles.playerTag, background: '#e63946' }}>P1</div>
          {p1Locked && <div style={{ ...styles.lockedBanner, background: '#e63946' }}>LOCKED IN</div>}
        </div>

        {/* VS text */}
        <div style={styles.vs}>VS</div>

        {/* Player 2 slot */}
        <div style={{
          ...styles.slot,
          borderColor: p2Locked ? '#457b9d' : (currentPlayer === 2 && hovered ? 'rgba(69,123,157,0.5)' : 'rgba(0,0,0,0.1)'),
          boxShadow: p2Locked ? '0 0 60px rgba(69,123,157,0.5), inset 0 0 30px rgba(69,123,157,0.1)' : '0 4px 20px rgba(0,0,0,0.05)',
          animation: shake === 2 ? 'shakeSlot 0.4s ease-out' : undefined,
        }}>
          {p2 ? (
            <img
              src={p2.img}
              alt="P2"
              style={{
                ...styles.slotImg,
                animation: p2Locked ? 'slamIn 0.4s ease-out' : undefined,
              }}
            />
          ) : (
            <span style={styles.question}>?</span>
          )}
          <div style={{ ...styles.playerTag, background: '#457b9d' }}>P2</div>
          {p2Locked && <div style={{ ...styles.lockedBanner, background: '#457b9d' }}>LOCKED IN</div>}
        </div>
      </div>

      {/* Character roster */}
      <div style={styles.roster}>
        {CHARACTERS.map((char) => {
          const isP1Pick = p1Locked && p1?.id === char.id;
          const isP2Pick = p2Locked && p2?.id === char.id;
          const isHovered = hovered === char.id;
          const accent = currentPlayer === 1 ? '#e63946' : '#457b9d';

          return (
            <div
              key={char.id}
              style={{
                ...styles.card,
                borderColor: isP1Pick ? '#e63946' : isP2Pick ? '#457b9d' : isHovered ? accent : 'rgba(0,0,0,0.1)',
                transform: isHovered ? 'scale(1.1) translateY(-8px)' : 'scale(1)',
                boxShadow: isHovered ? `0 12px 30px ${accent}33` : '0 4px 12px rgba(0,0,0,0.05)',
              }}
              onMouseEnter={() => handleHover(char.id, char.img)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleSelect(char.id, char.img)}
            >
              <img src={char.img} alt={char.name} style={styles.cardImg} />
              <span style={styles.cardName}>{char.name}</span>
            </div>
          );
        })}
      </div>

      {/* START button */}
      {bothLocked && (
        <button style={styles.startBtn} onClick={handleStart}>
          START
        </button>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100vw',
    height: '100vh',
    background: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    color: '#111',
    userSelect: 'none',
    position: 'relative',
    overflow: 'hidden',
  },
  flash: {
    position: 'absolute',
    inset: 0,
    background: 'white',
    zIndex: 100,
    pointerEvents: 'none',
    animation: 'screenFlash 0.4s ease-out forwards',
  },
  title: {
    fontSize: 52,
    fontWeight: 900,
    letterSpacing: 8,
    margin: 0,
    color: '#111',
    animation: 'slideUp 0.6s ease-out',
  },
  subtitle: {
    fontSize: 18,
    color: '#888',
    marginTop: 8,
    marginBottom: 40,
    minHeight: 24,
    fontWeight: 600,
    letterSpacing: 3,
  },
  vsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 50,
    marginBottom: 50,
  },
  slot: {
    width: 280,
    height: 320,
    border: '4px solid rgba(0,0,0,0.1)',
    borderRadius: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.02)',
    position: 'relative',
    transition: 'border-color 0.3s, box-shadow 0.3s',
    overflow: 'hidden',
  },
  slotImg: {
    width: '90%',
    height: '90%',
    objectFit: 'contain',
  },
  question: {
    fontSize: 100,
    fontWeight: 900,
    color: '#ddd',
  },
  playerTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    padding: '4px 14px',
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 800,
    color: '#fff',
    letterSpacing: 2,
  },
  lockedBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    textAlign: 'center',
    padding: '6px 0',
    fontSize: 13,
    fontWeight: 800,
    color: '#fff',
    letterSpacing: 3,
  },
  vs: {
    fontSize: 64,
    fontWeight: 900,
    color: '#222',
    letterSpacing: 6,
  },
  roster: {
    display: 'flex',
    gap: 24,
    animation: 'slideUp 0.8s ease-out',
  },
  card: {
    width: 140,
    height: 160,
    border: '3px solid rgba(0,0,0,0.1)',
    borderRadius: 14,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s',
    gap: 8,
  },
  cardImg: {
    width: 85,
    height: 85,
    objectFit: 'contain',
  },
  cardName: {
    fontSize: 14,
    fontWeight: 700,
    color: '#555',
    letterSpacing: 1,
  },
  startBtn: {
    marginTop: 36,
    padding: '14px 60px',
    fontSize: 24,
    fontWeight: 900,
    letterSpacing: 6,
    border: '3px solid #222',
    borderRadius: 12,
    background: '#111',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s',
    animation: 'slideUp 0.5s ease-out',
  },
};
