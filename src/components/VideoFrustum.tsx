import { useRef, useMemo, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';

export interface VideoFrustumHandle {
  updateFrame: (jpegBase64: string) => void;
}

export const VideoFrustum = forwardRef<VideoFrustumHandle>((_props, ref) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Offscreen canvas for decoding JPEG frames
  const { canvas, context, texture } = useMemo(() => {
    const cvs = document.createElement('canvas');
    cvs.width = 640;
    cvs.height = 360;
    const ctx = cvs.getContext('2d')!;
    const tex = new THREE.CanvasTexture(cvs);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    return { canvas: cvs, context: ctx, texture: tex };
  }, []);

  // Offscreen image element for loading base64 frames
  const imgRef = useRef<HTMLImageElement | null>(null);

  useImperativeHandle(ref, () => ({
    updateFrame(jpegBase64: string) {
      if (!imgRef.current) {
        imgRef.current = new Image();
        imgRef.current.onload = () => {
          context.drawImage(imgRef.current!, 0, 0, canvas.width, canvas.height);
          texture.needsUpdate = true;
        };
      }
      imgRef.current.src = `data:image/jpeg;base64,${jpegBase64}`;
    },
  }), [canvas, context, texture]);

  // Calibrated transform: yaw=0.6 rad around Y, then roll=pi/2 around Z
  const rotation = useMemo(() => {
    const euler = new THREE.Euler(0, 0, 0);
    const q = new THREE.Quaternion();
    // Apply yaw around Y
    const qYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.6);
    // Apply roll around Z
    const qRoll = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);
    q.multiplyQuaternions(qRoll, qYaw);
    euler.setFromQuaternion(q);
    return euler;
  }, []);

  return (
    <mesh
      ref={meshRef}
      position={[0.05, 1.5, 0.1]}
      rotation={rotation}
    >
      <planeGeometry args={[2, 1.125]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
});

VideoFrustum.displayName = 'VideoFrustum';
