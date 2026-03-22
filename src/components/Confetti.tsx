import { useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { loadEmittersPlugin } from '@tsparticles/plugin-emitters';
import type { ISourceOptions } from '@tsparticles/engine';

const confettiOptions: ISourceOptions = {
  fullScreen: { zIndex: 1 },
  emitters: [
    {
      position: { x: 0, y: 30 },
      rate: { quantity: 5, delay: 0.15 },
      particles: {
        move: {
          direction: 'top-right',
          outModes: { top: 'none', left: 'none', default: 'destroy' },
        },
      },
    },
    {
      position: { x: 100, y: 30 },
      rate: { quantity: 5, delay: 0.15 },
      particles: {
        move: {
          direction: 'top-left',
          outModes: { top: 'none', right: 'none', default: 'destroy' },
        },
      },
    },
  ],
  particles: {
    color: { value: ['#FF0000', '#0066FF', '#FFD700', '#00CC44', '#FF6600', '#9933FF'] },
    move: {
      decay: 0.05,
      direction: 'top',
      enable: true,
      gravity: { enable: true },
      outModes: { top: 'none', default: 'destroy' },
      speed: { min: 10, max: 50 },
    },
    number: { value: 0 },
    opacity: { value: 1 },
    rotate: {
      value: { min: 0, max: 360 },
      direction: 'random',
      animation: { enable: true, speed: 30 },
    },
    tilt: {
      direction: 'random',
      enable: true,
      value: { min: 0, max: 360 },
      animation: { enable: true, speed: 30 },
    },
    size: {
      value: { min: 0, max: 2 },
      animation: { enable: true, startValue: 'min', count: 1, speed: 16, sync: true },
    },
    roll: {
      darken: { enable: true, value: 25 },
      enable: true,
      speed: { min: 5, max: 15 },
    },
    wobble: {
      distance: 30,
      enable: true,
      speed: { min: -7, max: 7 },
    },
    shape: {
      type: ['circle', 'square'],
    },
  },
};

export function Confetti() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
      await loadEmittersPlugin(engine);
    }).then(() => setReady(true));
  }, []);

  if (!ready) return null;

  return <Particles id="tsparticles" options={confettiOptions} />;
}
