'use client';

import { useEffect, useRef } from 'react';

export default function GlobalBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let raf: number;
    let w = 0, h = 0;

    const orbs = [
      { x: 0.2, y: 0.15, r: 0.35, color: [139, 92, 246], speed: 0.0003, phase: 0 },
      { x: 0.7, y: 0.6, r: 0.3, color: [6, 182, 212], speed: 0.0004, phase: 2 },
      { x: 0.5, y: 0.8, r: 0.25, color: [244, 114, 182], speed: 0.00035, phase: 4 },
      { x: 0.8, y: 0.2, r: 0.2, color: [251, 191, 36], speed: 0.00025, phase: 1 },
    ];

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let t = 0;
    const draw = () => {
      t++;
      ctx.clearRect(0, 0, w, h);

      const isDark = document.documentElement.classList.contains('dark');
      ctx.fillStyle = isDark ? '#06060a' : '#fafafa';
      ctx.fillRect(0, 0, w, h);

      for (const orb of orbs) {
        const ox = (orb.x + Math.sin(t * orb.speed + orb.phase) * 0.08) * w;
        const oy = (orb.y + Math.cos(t * orb.speed * 0.7 + orb.phase) * 0.06) * h;
        const or = orb.r * Math.max(w, h);

        const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, or);
        const alpha = isDark ? 0.12 : 0.08;
        grad.addColorStop(0, `rgba(${orb.color.join(',')},${alpha})`);
        grad.addColorStop(1, `rgba(${orb.color.join(',')},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(ox, oy, or, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}
