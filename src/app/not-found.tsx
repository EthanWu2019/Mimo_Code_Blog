'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

// 404 Page — maximum flex (canvas particles + glitch + scanlines + parallax + terminal log)

const BOOT_LINES = [
  '> initializing quantum field resolver...',
  '> scanning neural pathways...',
  '> ERROR: coordinate [x=42, y=∞] not found',
  '> WARNING: temporal drift detected',
  '> CRITICAL: reality anchor severed',
  '> FALLING THROUGH DIMENSIONAL SHIMMER...',
  '> YOU HAVE DRIFTED INTO THE VOID',
];

export default function NotFoundPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [glitchOn, setGlitchOn] = useState(false);

  // Glitch loop
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchOn(true);
      setTimeout(() => setGlitchOn(false), 120);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  // Mouse tracking
  useEffect(() => {
    const onMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // Title entrance — explode in
  useEffect(() => {
    if (!titleRef.current) return;
    const chars = titleRef.current.querySelectorAll('.num-char');
    gsap.fromTo(chars,
      { y: 200, opacity: 0, rotateX: -90 },
      {
        y: 0,
        opacity: 1,
        rotateX: 0,
        duration: 1.2,
        ease: 'elastic.out(1, 0.5)',
        stagger: 0.12,
      }
    );
  }, []);

  // Terminal log typewriter
  useEffect(() => {
    if (!termRef.current) return;
    const lines = termRef.current.querySelectorAll<HTMLElement>('.term-line');
    lines.forEach((line, i) => {
      const text = line.dataset.text || '';
      line.textContent = '';
      setTimeout(() => {
        let idx = 0;
        const interval = setInterval(() => {
          line.textContent = text.slice(0, ++idx);
          if (idx >= text.length) clearInterval(interval);
        }, 18);
      }, 400 + i * 380);
    });
  }, []);

  // Parallax tilt on hero
  useEffect(() => {
    if (!wrapRef.current) return;
    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      gsap.to(wrapRef.current, {
        rotateY: dx * 8,
        rotateX: -dy * 8,
        duration: 0.6,
        ease: 'power2.out',
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // Particle system — canvas 2D, full featured
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx!.scale(dpr, dpr);
    }
    resize();
    window.addEventListener('resize', resize);

    type Particle = { x: number; y: number; vx: number; vy: number; size: number; life: number; hue: number };
    const particles: Particle[] = [];
    const max = 120;

    function spawn() {
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.2 + Math.random() * 1.2;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 0.5 + Math.random() * 2,
        life: 1,
        hue: 270 + Math.random() * 50,
      });
    }

    let mouseX = -1000, mouseY = -1000;
    function onMouse(e: MouseEvent) { mouseX = e.clientX; mouseY = e.clientY; }
    window.addEventListener('mousemove', onMouse);

    function draw() {
      if (!ctx) return;
      ctx.fillStyle = 'rgba(10,10,11,0.12)';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      // Spawn new
      if (particles.length < max && Math.random() < 0.4) spawn();

      // Update + draw
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        // Mouse repulsion
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = (150 - dist) / 150;
          p.vx += (dx / dist) * force * 0.6;
          p.vy += (dy / dist) * force * 0.6;
        }
        // Damping
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.005;

        if (p.life <= 0 || p.x < -50 || p.x > window.innerWidth + 50 || p.y < -50 || p.y > window.innerHeight + 50) {
          particles.splice(i, 1);
          continue;
        }

        // Glow
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 8);
        grd.addColorStop(0, `hsla(${p.hue}, 80%, 70%, ${p.life * 0.9})`);
        grd.addColorStop(1, `hsla(${p.hue}, 80%, 70%, 0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 8, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.fillStyle = `hsla(${p.hue}, 100%, 85%, ${p.life})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Connection lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            const alpha = (1 - dist / 100) * 0.15 * Math.min(a.life, b.life);
            ctx.strokeStyle = `hsla(280, 80%, 70%, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative min-h-screen overflow-hidden bg-[#0a0a0b] text-white" style={{ perspective: '1200px' }}>
      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Scan lines */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.08]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.12) 2px, rgba(255,255,255,0.12) 3px)',
          backgroundSize: '100% 3px',
        }}
      />

      {/* CRT vignette */}
      <div className="pointer-events-none absolute inset-0 z-10"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center px-6" style={{ transformStyle: 'preserve-3d' }}>
        {/* Top corner labels */}
        <div className="absolute top-6 left-6 flex items-center gap-2 text-[10px] font-mono text-purple-400/70">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          SIGNAL_LOST
        </div>
        <div className="absolute top-6 right-6 font-mono text-[10px] text-purple-400/70">
          LAT 0.0000 · LON 0.0000
        </div>

        {/* Glitch 404 title */}
        <div ref={titleRef} className="relative mb-12" style={{ transformStyle: 'preserve-3d' }}>
          <h1 className="flex text-[120px] sm:text-[180px] md:text-[240px] font-black leading-none tracking-tighter select-none">
            {['4', '0', '4'].map((c, i) => (
              <span key={i} className="num-char inline-block relative" style={{ fontFamily: 'system-ui, sans-serif' }}>
                <span className="relative inline-block bg-gradient-to-b from-purple-300 via-purple-500 to-indigo-700 bg-clip-text text-transparent"
                  style={{ filter: glitchOn ? 'blur(2px)' : 'none' }}>
                  {c}
                </span>
                {/* Glitch ghost layers */}
                {glitchOn && (
                  <>
                    <span className="absolute inset-0 bg-gradient-to-b from-cyan-300 to-cyan-500 bg-clip-text text-transparent pointer-events-none" style={{ transform: 'translate(-3px, 0)', opacity: 0.7 }}>
                      {c}
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-b from-pink-400 to-red-500 bg-clip-text text-transparent pointer-events-none" style={{ transform: 'translate(3px, 0)', opacity: 0.7 }}>
                      {c}
                    </span>
                  </>
                )}
              </span>
            ))}
          </h1>
        </div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-center"
        >
          This dimension has <span className="text-purple-400">drifted away</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7, duration: 0.6 }}
          className="text-zinc-400 text-center mb-10 max-w-md text-sm sm:text-base"
        >
          The page you&apos;re looking for collapsed in the void.
          You can try to drift back home.
        </motion.p>

        {/* Terminal log */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.6 }}
          ref={termRef}
          className="mb-10 max-w-lg w-full p-4 rounded-lg bg-black/50 backdrop-blur-sm border border-purple-500/20 font-mono text-xs text-purple-300/70 text-left"
        >
          {BOOT_LINES.map((line, i) => (
            <div key={i} className="term-line leading-relaxed" data-text={line} />
          ))}
          <div className="inline-block w-2 h-3 bg-purple-400 animate-pulse ml-0.5" />
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.5, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <a
            href="/"
            className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all hover:scale-105"
          >
            ← Drift back home
          </a>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 rounded-full bg-white/[0.04] border border-white/[0.08] text-white hover:bg-white/[0.08] transition-all"
          >
            Reverse course
          </button>
        </motion.div>

        {/* Floating labels */}
        <div className="absolute bottom-6 left-6 font-mono text-[10px] text-purple-400/40 hidden sm:block">
          [VOID.SYS] · STATE: COLLAPSED · v0.4.04
        </div>
        <div className="absolute bottom-6 right-6 font-mono text-[10px] text-purple-400/40 hidden sm:block">
          COORD [x={mousePos.x.toFixed(0)}, y={mousePos.y.toFixed(0)}]
        </div>
      </div>

      {/* Aurora gradients */}
      <div className="pointer-events-none absolute top-0 left-0 w-96 h-96 rounded-full bg-purple-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-96 h-96 rounded-full bg-indigo-600/20 blur-[120px]" />
    </div>
  );
}
