import { useRef, useMemo, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';

const MAX_POINTS = 50_000;

const vertexShader = `
  attribute vec3 position;
  uniform mat4 projectionMatrix;
  uniform mat4 modelViewMatrix;
  varying float vZ;

  void main() {
    vZ = position.z;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 3.0;
  }
`;

const fragmentShader = `
  varying float vZ;

  void main() {
    // Map z (height) to color gradient: blue (low) -> green (mid) -> red (high)
    float t = clamp(vZ / 3.0, 0.0, 1.0);
    vec3 color;
    if (t < 0.5) {
      color = mix(vec3(0.0, 0.0, 1.0), vec3(0.0, 1.0, 0.0), t * 2.0);
    } else {
      color = mix(vec3(0.0, 1.0, 0.0), vec3(1.0, 0.0, 0.0), (t - 0.5) * 2.0);
    }
    gl_FragColor = vec4(color, 1.0);
  }
`;

export interface LidarOverlayHandle {
  updatePoints: (points: Float32Array) => void;
}

export const LidarOverlay = forwardRef<LidarOverlayHandle>((_props, ref) => {
  const positionsRef = useRef<THREE.BufferAttribute | null>(null);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);

  const positionArray = useMemo(() => new Float32Array(MAX_POINTS * 3), []);

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: false,
      depthWrite: true,
    });
  }, []);

  useImperativeHandle(ref, () => ({
    updatePoints(points: Float32Array) {
      const count = Math.min(points.length / 3, MAX_POINTS);
      positionArray.set(points.subarray(0, count * 3));

      // Zero out remaining positions
      if (count < MAX_POINTS) {
        positionArray.fill(0, count * 3);
      }

      if (positionsRef.current) {
        positionsRef.current.needsUpdate = true;
      }
      if (geometryRef.current) {
        geometryRef.current.setDrawRange(0, count);
      }
    },
  }), [positionArray]);

  return (
    <group position={[0, 1.5, 0]}>
      <points>
        <bufferGeometry ref={geometryRef}>
          <bufferAttribute
            ref={positionsRef}
            attach="attributes-position"
            array={positionArray}
            count={MAX_POINTS}
            itemSize={3}
          />
        </bufferGeometry>
        <primitive object={shaderMaterial} attach="material" size={0.03} />
      </points>
    </group>
  );
});

LidarOverlay.displayName = 'LidarOverlay';
