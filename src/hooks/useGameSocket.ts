import { useEffect, useRef } from 'react';

export interface GameSocketCallbacks {
  onPoints: (points: Float32Array) => void;
  onVideo: (jpegBase64: string) => void;
  onKick: () => void;
}

const WS_URL = 'ws://localhost:9091';
const RECONNECT_DELAY = 2000;

export function useGameSocket(callbacks: GameSocketCallbacks) {
  const cbRef = useRef(callbacks);
  cbRef.current = callbacks;

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let unmounted = false;

    function connect() {
      if (unmounted) return;

      console.log('[GameSocket] Connecting to', WS_URL);
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log('[GameSocket] Connected');
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          switch (msg.type) {
            case 'pointcloud': {
              // Decode base64 string -> ArrayBuffer -> Float32Array
              const binary = atob(msg.data);
              const bytes = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
              }
              const points = new Float32Array(bytes.buffer);
              cbRef.current.onPoints(points);
              break;
            }
            case 'video': {
              cbRef.current.onVideo(msg.data);
              break;
            }
            case 'kick': {
              cbRef.current.onKick();
              break;
            }
          }
        } catch (err) {
          console.error('[GameSocket] Failed to parse message:', err);
        }
      };

      ws.onclose = () => {
        console.log('[GameSocket] Disconnected, reconnecting in', RECONNECT_DELAY, 'ms');
        ws = null;
        if (!unmounted) {
          reconnectTimer = setTimeout(connect, RECONNECT_DELAY);
        }
      };

      ws.onerror = (err) => {
        console.error('[GameSocket] Error:', err);
        ws?.close();
      };
    }

    connect();

    return () => {
      unmounted = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) {
        ws.onclose = null; // prevent reconnect on cleanup
        ws.close();
      }
    };
  }, []);
}
