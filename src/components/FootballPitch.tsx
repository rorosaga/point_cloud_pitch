import { Line } from '@react-three/drei';
import { forwardRef, useImperativeHandle, useRef, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PITCH_LENGTH, PITCH_WIDTH, REVEAL_TEX_SIZE, SPLAT_RADIUS } from '../lib/pitchConstants';

// Pitch marking dimensions (proportional to FIFA standard)
const PL = PITCH_LENGTH;
const PW = PITCH_WIDTH;
const PA_L = PL * 0.157;  // penalty area length
const PA_W = PW * 0.593;  // penalty area width
const GA_L = PL * 0.052;  // goal area length
const GA_W = PW * 0.269;  // goal area width
const CR = PW * 0.134;    // center circle radius
const LINE_Y = 0.02;      // height above pitch

function circlePoints(cx: number, cz: number, r: number, segments = 64): [number, number, number][] {
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * r, LINE_Y, cz + Math.sin(a) * r]);
  }
  return pts;
}

function PitchLines() {
  const hw = PW / 2;
  const hl = PL / 2;
  const lineProps = { color: 'white', lineWidth: 2 } as const;

  return (
    <group>
      {/* Outer boundary */}
      <Line points={[[-hw, LINE_Y, -hl], [hw, LINE_Y, -hl], [hw, LINE_Y, hl], [-hw, LINE_Y, hl], [-hw, LINE_Y, -hl]]} {...lineProps} />
      {/* Halfway line */}
      <Line points={[[-hw, LINE_Y, 0], [hw, LINE_Y, 0]]} {...lineProps} />
      {/* Center circle */}
      <Line points={circlePoints(0, 0, CR)} {...lineProps} />
      {/* Center spot */}
      <Line points={circlePoints(0, 0, 0.05, 16)} {...lineProps} />

      {/* Penalty area - bottom */}
      <Line points={[
        [-PA_W / 2, LINE_Y, -hl],
        [-PA_W / 2, LINE_Y, -hl + PA_L],
        [PA_W / 2, LINE_Y, -hl + PA_L],
        [PA_W / 2, LINE_Y, -hl],
      ]} {...lineProps} />
      {/* Penalty area - top */}
      <Line points={[
        [-PA_W / 2, LINE_Y, hl],
        [-PA_W / 2, LINE_Y, hl - PA_L],
        [PA_W / 2, LINE_Y, hl - PA_L],
        [PA_W / 2, LINE_Y, hl],
      ]} {...lineProps} />

      {/* Goal area - bottom */}
      <Line points={[
        [-GA_W / 2, LINE_Y, -hl],
        [-GA_W / 2, LINE_Y, -hl + GA_L],
        [GA_W / 2, LINE_Y, -hl + GA_L],
        [GA_W / 2, LINE_Y, -hl],
      ]} {...lineProps} />
      {/* Goal area - top */}
      <Line points={[
        [-GA_W / 2, LINE_Y, hl],
        [-GA_W / 2, LINE_Y, hl - GA_L],
        [GA_W / 2, LINE_Y, hl - GA_L],
        [GA_W / 2, LINE_Y, hl],
      ]} {...lineProps} />

      {/* Penalty spots */}
      <Line points={circlePoints(0, -hl + PA_L * 0.72, 0.05, 16)} {...lineProps} />
      <Line points={circlePoints(0, hl - PA_L * 0.72, 0.05, 16)} {...lineProps} />
    </group>
  );
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uRevealMap;
  uniform float uRevealSoftness;
  varying vec2 vUv;

  void main() {
    float reveal = texture2D(uRevealMap, vUv).r;
    reveal = smoothstep(0.05, 0.05 + uRevealSoftness, reveal);

    // Green pitch where revealed, white fog where not
    vec3 pitchColor = vec3(0.18, 0.6, 0.18);
    vec3 fogColor = vec3(0.92, 0.92, 0.92);
    vec3 color = mix(fogColor, pitchColor, reveal);
    float alpha = mix(0.3, 1.0, reveal);

    gl_FragColor = vec4(color, alpha);
  }
`;

export interface FootballPitchHandle {
  addPoints: (points: Float32Array) => void;
}

export const FootballPitch = forwardRef<FootballPitchHandle>((_props, ref) => {
  const revealData = useRef(new Uint8Array(REVEAL_TEX_SIZE * REVEAL_TEX_SIZE));
  const dirtyRef = useRef(false);

  const revealTexture = useMemo(() => {
    const tex = new THREE.DataTexture(
      revealData.current,
      REVEAL_TEX_SIZE,
      REVEAL_TEX_SIZE,
      THREE.RedFormat,
    );
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }, []);

  const fogMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uRevealMap: { value: revealTexture },
        uRevealSoftness: { value: 0.3 },
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
  }, [revealTexture]);

  const paintPoints = useCallback((points: Float32Array) => {
    const data = revealData.current;
    const size = REVEAL_TEX_SIZE;
    const numPoints = points.length / 3;

    for (let i = 0; i < numPoints; i++) {
      const lx = points[i * 3 + 0]; // Go2 forward
      const ly = points[i * 3 + 1]; // Go2 right

      const u = (ly / PITCH_WIDTH) + 0.5;
      const v = lx / PITCH_LENGTH;

      const px = Math.floor(u * size);
      const py = Math.floor(v * size);

      for (let dx = -SPLAT_RADIUS; dx <= SPLAT_RADIUS; dx++) {
        for (let dy = -SPLAT_RADIUS; dy <= SPLAT_RADIUS; dy++) {
          const sx = px + dx;
          const sy = py + dy;
          if (sx >= 0 && sx < size && sy >= 0 && sy < size) {
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= SPLAT_RADIUS) {
              const intensity = Math.floor(255 * (1 - dist / SPLAT_RADIUS));
              const idx = sy * size + sx;
              data[idx] = Math.max(data[idx], intensity);
            }
          }
        }
      }
    }
    dirtyRef.current = true;
  }, []);

  useImperativeHandle(ref, () => ({ addPoints: paintPoints }), [paintPoints]);

  useFrame(() => {
    if (dirtyRef.current) {
      revealTexture.needsUpdate = true;
      dirtyRef.current = false;
    }
  });

  return (
    <group>
      {/* Green pitch plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[PW, PL]} />
        <primitive object={fogMaterial} attach="material" />
      </mesh>

      {/* White line markings */}
      <PitchLines />
    </group>
  );
});

FootballPitch.displayName = 'FootballPitch';
