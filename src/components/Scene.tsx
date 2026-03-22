import { OrbitControls } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import { ReactNode, useRef, useEffect } from 'react';
import * as THREE from 'three';

export type ViewMode = 'perspective' | 'side' | 'topdown';

const VIEW_TARGETS: Record<ViewMode, { pos: [number, number, number]; target: [number, number, number] }> = {
  perspective: { pos: [0, 8, 10], target: [0, 0, 0] },
  side:        { pos: [-8, 5, 0], target: [0, 0, 0] },
  topdown:     { pos: [-8, 10, 0.01], target: [0, 0, 0] },
};

const LERP_SPEED = 3;

function CameraAnimator({ viewMode }: { viewMode: ViewMode }) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const targetPos = useRef(new THREE.Vector3(...VIEW_TARGETS[viewMode].pos));
  const targetLookAt = useRef(new THREE.Vector3(...VIEW_TARGETS[viewMode].target));

  useEffect(() => {
    const view = VIEW_TARGETS[viewMode];
    targetPos.current.set(...view.pos);
    targetLookAt.current.set(...view.target);
  }, [viewMode]);

  useFrame((_, delta) => {
    camera.position.lerp(targetPos.current, 1 - Math.exp(-LERP_SPEED * delta));
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLookAt.current, 1 - Math.exp(-LERP_SPEED * delta));
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      maxPolarAngle={Math.PI / 1.5}
      minDistance={2}
      maxDistance={25}
      enableDamping
    />
  );
}

export function Scene({ children, viewMode }: { children: ReactNode; viewMode: ViewMode }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <CameraAnimator viewMode={viewMode} />
      {children}
    </>
  );
}
