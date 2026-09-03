'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ───────────── 404 · SCATTERED SIGNALS ─────────────
   A "missing-page" experience that intentionally diverges from the
   rest of the site. The /not-found page in App Router is automatically
   served for any unmatched route — that means this layout is also
   served at /does-not-exist, /old-permalink, /posts/<bad-slug>, etc.
   The /four-oh-four route in this project is a thin re-export pointing
   at the same file, so the design stays one source of truth.

   Visual elements:
     1. A floating field of drifting signal particles (Web Canvas).
     2. A real-time clock + signal status indicator (top corners).
     3. A massive "404" with intermittent chromatic glitch + tilt.
     4. A terminal-style boot log that "types" itself on first paint.
     5. A primary action (drift back home) + quick exits to the
        rest of the navbar so the user doesn't have to retype a URL.
*/

const BOOT_LINES = [
  '> initializing quantum field resolver...',
  '> scanning neural pathways...',
  '> ERROR: coordinate [x=42, y=∞] not found',
  '> WARNING: temporal drift detected',
  '> CRITICAL: reality anchor severed',
  '> FALLING THROUGH DIMENSIONAL SHIMMER...',
  '> YOU HAVE DRIFTED INTO THE VOID',
];

const QUICK_EXITS = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/project', label: 'Projects' },
  { href: '/gallery', label: 'AI Gallery' },
  { href: '/photography', label: 'Photography' },
  { href: '/podcast', label: 'Podcast' },
] as const;

function formatElapsed(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

export default function NotFoundPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [glitchOn, setGlitchOn] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds since this page mounted
  const [typedLog, setTypedLog] = useState<string[]>([]);
  const [typedDone, setTypedDone] = useState(false);

  // 1. Glitch loop — flickers the 404 title randomly
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchOn(true);
      setTimeout(() => setGlitchOn(false), 120);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // 2. Mouse parallax on the title
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      setMousePos({ x: e.clientX - cx, y: e.clientY - cy });
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      if (titleRef.current) {
        titleRef.current.style.transform =
          `translate3d(${dx * 8}px, ${dy * 8}px, 0) rotateX(${-dy * 4}deg) rotateY(${dx * 4}deg)`;
      }
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // 3. Real-time elapsed counter
  useEffect(() => {
    const start = Date.now();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  // 4. Typewriter for the terminal log
  useEffect(() => {
    if (typedDone) return;
    let lineIdx = 0;
    let charIdx = 0;
    let timer: number | null = null;
    const tick = () => {
      const line = BOOT_LINES[lineIdx];
      if (!line) {
        setTypedDone(true);
        return;
      }
      charIdx += 1;
      setTypedLog((prev) => {
        const next = prev.slice();
        next[lineIdx] = line.slice(0, charIdx);
        return next;
      });
      if (charIdx >= line.length) {
        charIdx = 0;
        lineIdx += 1;
        timer = window.setTimeout(tick, 120);
      } else {
        timer = window.setTimeout(tick, 18);
      }
    };
    timer = window.setTimeout(tick, 350);
    return () => {
      if (timer != null) window.clearTimeout(timer);
    };
  }, [typedDone]);

  // 5. Particle field — interactive signal drift
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

      if (particles.length < max && Math.random() < 0.4) spawn();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = (150 - dist) / 150;
          p.vx += (dx / dist) * force * 0.6;
          p.vy += (dy / dist) * force * 0.6;
        }
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.005;

        if (
          p.life <= 0 ||
          p.x < -50 || p.x > window.innerWidth + 50 ||
          p.y < -50 || p.y > window.innerHeight + 50
        ) {
          particles.splice(i, 1);
          continue;
        }

        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 8);
        grd.addColorStop(0, `hsla(${p.hue}, 80%, 70%, ${p.life * 0.9})`);
        grd.addColorStop(1, `hsla(${p.hue}, 80%, 70%, 0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `hsla(${p.hue}, 100%, 85%, ${p.life})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

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

  const goHome = useCallback(() => {
    if (typeof window !== 'undefined') window.location.assign('/');
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative min-h-screen overflow-hidden bg-[#0a0a0b] text-white"
      style={{ perspective: '1200px' }}
    >
      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Scan lines */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.08]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.12) 2px, rgba(255,255,255,0.12) 3px)',
          backgroundSize: '100% 3px',
        }}
      />

      {/* CRT vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      {/* Aurora gradients */}
      <div className="pointer-events-none absolute top-0 left-0 w-96 h-96 rounded-full bg-purple-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-96 h-96 rounded-full bg-indigo-600/20 blur-[120px]" />

      {/* Content */}
      <div
        className="relative z-20 min-h-screen flex flex-col items-center justify-center px-6 py-16"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Top corner labels — live status */}
        <div className="absolute top-6 left-6 flex items-center gap-2 text-[10px] font-mono text-purple-400/70">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          SIGNAL_LOST · {formatElapsed(elapsed)}
        </div>
        <div className="absolute top-6 right-6 font-mono text-[10px] text-purple-400/70 tabular-nums">
          LAT {(typeof window !== 'undefined' ? mousePos.y / window.innerHeight * 180 - 90 : 0).toFixed(2)} ·{' '}
          LON {(typeof window !== 'undefined' ? mousePos.x / window.innerWidth * 360 - 180 : 0).toFixed(2)}
        </div>

        {/* Massive 404 — chromatic glitch + 3D tilt */}
        <div
          ref={titleRef}
          className="relative mb-10 select-none"
          style={{ transformStyle: 'preserve-3d', transition: 'transform 80ms linear' }}
        >
          <h1 className="flex text-[120px] sm:text-[180px] md:text-[240px] font-black leading-none tracking-tighter">
            {['4', '0', '4'].map((c, i) => (
              <span
                key={i}
                className="inline-block relative"
                style={{ fontFamily: 'system-ui, sans-serif' }}
              >
                <span
                  className="relative inline-block bg-gradient-to-b from-purple-300 via-purple-500 to-indigo-700 bg-clip-text text-transparent"
                  style={{ filter: glitchOn ? 'blur(2px)' : 'none' }}
                >
                  {c}
                </span>
                {glitchOn && (
                  <>
                    <span
                      className="absolute inset-0 bg-gradient-to-b from-cyan-300 to-cyan-500 bg-clip-text text-transparent pointer-events-none"
                      style={{ transform: 'translate(-3px, 0)', opacity: 0.7 }}
                    >
                      {c}
                    </span>
                    <span
                      className="absolute inset-0 bg-gradient-to-b from-pink-400 to-red-500 bg-clip-text text-transparent pointer-events-none"
                      style={{ transform: 'translate(3px, 0)', opacity: 0.7 }}
                    >
                      {c}
                    </span>
                  </>
                )}
              </span>
            ))}
          </h1>
        </div>

        {/* Heading + sub */}
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
          className="text-zinc-400 text-center mb-8 max-w-md text-sm sm:text-base"
        >
          The page you&apos;re looking for collapsed in the void.
          You can try to drift back home.
        </motion.p>

        {/* Boot log — typewriter on first paint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          ref={termRef}
          className="mb-8 max-w-lg w-full p-4 rounded-lg bg-black/50 backdrop-blur-sm border border-purple-500/20 font-mono text-[11px] text-purple-300/80 text-left"
        >
          {BOOT_LINES.map((line, i) => (
            <div key={i} className="term-line leading-relaxed min-h-[1.4em]">
              <span>{typedLog[i] ?? ''}</span>
              {typedLog[i] && typedLog[i].length < line.length && (
                <span className="inline-block w-1.5 h-3 bg-purple-400 ml-0.5 align-middle animate-pulse" />
              )}
              {typedDone && typedLog[i] && typedLog[i].length === line.length && (
                <span className="ml-1 text-zinc-500">[ok]</span>
              )}
            </div>
          ))}
          {typedDone && (
            <div className="mt-2 text-zinc-500">
              &gt; ready. hit any key to continue…{' '}
              <span className="inline-block w-1.5 h-3 bg-purple-400 ml-0.5 align-middle animate-pulse" />
            </div>
          )}
        </motion.div>

        {/* Primary actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.5, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <button
            onClick={goHome}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all hover:scale-105"
          >
            ← Drift back home
          </button>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 rounded-full bg-white/[0.04] border border-white/[0.08] text-white hover:bg-white/[0.08] transition-all"
          >
            Reverse course
          </button>
        </motion.div>

        {/* Quick exits — the rest of the navbar so the user has somewhere
            to go without retyping. Not a discovery feature; it's an
            accessibility feature for the lost. */}
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4, duration: 0.6 }}
          aria-label="Other destinations"
          className="mt-10 w-full max-w-2xl"
        >
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-purple-400/50 text-center mb-3">
            Other destinations
          </div>
          <ul className="flex flex-wrap items-center justify-center gap-2">
            {QUICK_EXITS.map((q) => (
              <li key={q.href}>
                <a
                  href={q.href}
                  className="inline-flex items-center h-8 px-3 rounded-full text-xs font-medium bg-white/[0.04] border border-white/[0.08] text-zinc-300 hover:bg-white/[0.10] hover:text-white transition-all hover:-translate-y-[1px]"
                >
                  {q.label}
                </a>
              </li>
            ))}
          </ul>
        </motion.nav>

        {/* Footer chips */}
        <div className="absolute bottom-6 left-6 font-mono text-[10px] text-purple-400/40 hidden sm:block">
          [VOID.SYS] · STATE: COLLAPSED · v0.4.04
        </div>
        <div className="absolute bottom-6 right-6 font-mono text-[10px] text-purple-400/40 hidden sm:block tabular-nums">
          COORD [x={typeof window !== 'undefined' ? mousePos.x.toFixed(0) : 0}, y=
          {typeof window !== 'undefined' ? mousePos.y.toFixed(0) : 0}]
        </div>
      </div>
    </div>
  );
}
