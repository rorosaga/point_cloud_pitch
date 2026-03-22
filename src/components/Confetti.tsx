import { useEffect, useState, memo } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { loadEmittersPlugin } from '@tsparticles/plugin-emitters';
import type { ISourceOptions } from '@tsparticles/engine';

const confettiOptions: ISourceOptions = {
  fullScreen: { zIndex: 1 },
  emitters: [
    // Far left — highest rate
    {
      position: { x: 0, y: 30 },
      rate: { quantity: 3, delay: 0.3 },
      particles: {
        move: {
          direction: 'top-right',
          outModes: { top: 'none', left: 'none', default: 'destroy' },
        },
      },
    },
    // Far right — highest rate
    {
      position: { x: 100, y: 30 },
      rate: { quantity: 3, delay: 0.3 },
      particles: {
        move: {
          direction: 'top-left',
          outModes: { top: 'none', right: 'none', default: 'destroy' },
        },
      },
    },
    // Mid-left — lower rate
    {
      position: { x: 15, y: 40 },
      rate: { quantity: 1, delay: 0.5 },
      particles: {
        move: {
          direction: 'top-right',
          outModes: { top: 'none', left: 'none', default: 'destroy' },
        },
      },
    },
    // Mid-right — lower rate
    {
      position: { x: 85, y: 40 },
      rate: { quantity: 1, delay: 0.5 },
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
      speed: { min: 10, max: 40 },
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

const ConfettiInner = memo(function ConfettiInner() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
      await loadEmittersPlugin(engine);
    }).then(() => setReady(true));
  }, []);

  if (!ready) return null;

  return <Particles id="tsparticles" options={confettiOptions} />;
});

export function Confetti() {
  return <ConfettiInner />;
}
