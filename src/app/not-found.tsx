'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ───────────────────── 404 · NULL ROUTE ─────────────────────
   A "missing page" experience that matches the rest of the site:
     - Same palette: bg-[#fafafa] / bg-[#0a0a0b], zinc-100/zinc-900,
       single blue accent (#2563eb light / #60a5fa dark).
     - Same typography: Geist Sans for copy, Geist Mono for chips.
     - Interactive without being loud: monochrome signal-drift
       particles (zinc only), 3D-tilted type, typewriter boot log,
       quick-exit nav that mirrors the navbar.
   App Router auto-serves this for any unmatched route.
/four-oh-four/page.tsx is a re-export of this module so the visual
   stays single-source.

   Major change from previous version: dropped every purple/pink/
   cyan gradient and every rainbow-coloured element so it stops
   fighting the rest of the page. The experience is the same — drift
   through a noise field, hit a glitching 404, get an exit row —
   but the palette is zinc-900/zinc-50 on the dark bg with a single
   blue accent strip. */

const BOOT_LINES = [
  '> route resolver... ok',
  '> edge cache lookup... ok',
  '> ERROR: requested path not in manifest',
  '> trying /index... not found',
  '> trying fallback 404... reserved',
  '> redirect to null route...',
  '> you have arrived at the null route',
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
  const [elapsed, setElapsed] = useState(0);
  const [typedLog, setTypedLog] = useState<string[]>([]);
  const [typedDone, setTypedDone] = useState(false);

  // 1. Glitch loop — flickers the 404 title randomly
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchOn(true);
      setTimeout(() => setGlitchOn(false), 110);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // 2. Mouse parallax on the title + tracker coords
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

  // 3. Elapsed counter
  useEffect(() => {
    const start = Date.now();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  // 4. Typewriter
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
        timer = window.setTimeout(tick, 140);
      } else {
        timer = window.setTimeout(tick, 18);
      }
    };
    timer = window.setTimeout(tick, 380);
    return () => {
      if (timer != null) window.clearTimeout(timer);
    };
  }, [typedDone]);

  // 5. Monochrome signal-drift particle field
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

    type Particle = { x: number; y: number; vx: number; vy: number; size: number; life: number };
    const particles: Particle[] = [];
    const max = 110;

    function spawn() {
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.18 + Math.random() * 1.1;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 0.4 + Math.random() * 1.6,
        life: 1,
      });
    }

    let mouseX = -1000;
    let mouseY = -1000;
    function onMouse(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }
    window.addEventListener('mousemove', onMouse);

    // Light vs dark: dark canvas washes white particles on a near-black
    // background; light canvas inverts to dim particles on near-white.
    const isDark = document.documentElement.classList.contains('dark');

    function draw() {
      if (!ctx) return;
      // Trailing fade — slightly stronger on dark to keep motion smudgy.
      ctx.fillStyle = isDark ? 'rgba(10,10,11,0.18)' : 'rgba(250,250,250,0.22)';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      if (particles.length < max && Math.random() < 0.4) spawn();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.hypot(dx, dy);
        if (dist < 150) {
          const force = (150 - dist) / 150;
          p.vx += (dx / dist) * force * 0.55;
          p.vy += (dy / dist) * force * 0.55;
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

        // Monochrome — particle intensity fades with life. Strict greyscale.
        if (isDark) {
          ctx.fillStyle = `rgba(220,220,225,${p.life * 0.55})`;
        } else {
          ctx.fillStyle = `rgba(50,50,55,${p.life * 0.45})`;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Sparse connection lines — also monochrome
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 100) {
            const alpha = ((1 - dist / 100) * 0.18 * Math.min(a.life, b.life)) ;
            ctx.strokeStyle = isDark
              ? `rgba(220,220,225,${alpha})`
              : `rgba(60,60,65,${alpha * 0.6})`;
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

  // Theme-aware echo — read once on mount; the 404 layer reads whatever
  // class <html> was hydrated with (the FOUC-safe inline script sets 'dark'
  // by default per globals.css :root vs .dark block — hush).
  const isDark =
    typeof document !== 'undefined'
      ? document.documentElement.classList.contains('dark')
      : true;

  return (
    <div
      ref={wrapRef}
      className="relative min-h-screen overflow-hidden bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100"
      style={{ perspective: '1200px' }}
    >
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-60"
      />

      {/* Single hairline stripe across the top — the one coloured accent
          in the whole page, using the same blue the rest of the site uses. */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />

      {/* Subtle scan-line CRT line — kept because the rest of the page
          does not have CRT lines, but for this 'glitch' page it's the
          only thematic flourish that matches the brand. */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, currentColor 2px, currentColor 3px)',
          backgroundSize: '100% 3px',
        }}
      />

      {/* Content */}
      <div
        className="relative z-20 min-h-screen flex flex-col items-center justify-center px-6 py-16"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Top corner chips */}
        <div className="absolute top-6 left-6 flex items-center gap-2 text-[11px] font-mono text-zinc-500 dark:text-zinc-500">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span className="uppercase tracking-wider">null-route</span>
          <span className="text-zinc-400 dark:text-zinc-600">· {formatElapsed(elapsed)}</span>
        </div>
        <div className="absolute top-6 right-6 font-mono text-[11px] text-zinc-500 dark:text-zinc-500 tabular-nums">
          <span className="uppercase tracking-wider">cursor</span>{' '}
          <span className="text-zinc-700 dark:text-zinc-300">
            [{typeof window !== 'undefined' ? mousePos.x.toFixed(0) : 0},{' '}
            {typeof window !== 'undefined' ? mousePos.y.toFixed(0) : 0}]
          </span>
        </div>

        {/* Massive 404 — monochrome chroma-aberration on glitch pulse.
            Glyph is rendered as transparent text + a clip-path that uses
            a black/white gradient, so we never paint colour — only
            the offset ghosts on pulse do, and they're greyscale. */}
        <div
          ref={titleRef}
          className="relative mb-10 select-none"
          style={{ transformStyle: 'preserve-3d', transition: 'transform 80ms linear' }}
        >
          <h1 className="flex text-[140px] sm:text-[200px] md:text-[260px] font-black leading-[0.95] tracking-tighter">
            {['4', '0', '4'].map((c, i) => (
              <span
                key={i}
                className="inline-block relative"
                style={{ fontFamily: 'system-ui, sans-serif' }}
              >
                <span
                  className={`relative inline-block bg-clip-text text-transparent bg-gradient-to-b ${
                    isDark
                      ? 'from-zinc-100 via-zinc-300 to-zinc-500'
                      : 'from-zinc-900 via-zinc-700 to-zinc-500'
                  }`}
                  style={{ filter: glitchOn ? 'blur(1.5px)' : 'none' }}
                >
                  {c}
                </span>
                {glitchOn && (
                  <>
                    {/* Greyscale echo only — no chroma — so the glitch
                        reads as 'broken display' rather than 'rainbow'. */}
                    <span
                      className="absolute inset-0 bg-clip-text text-transparent pointer-events-none bg-zinc-500/40 dark:bg-zinc-400/40"
                      style={{ transform: 'translate(-4px, 0)', opacity: 0.7 }}
                    >
                      {c}
                    </span>
                    <span
                      className="absolute inset-0 bg-clip-text text-transparent pointer-events-none bg-zinc-500/40 dark:bg-zinc-400/40"
                      style={{ transform: 'translate(4px, 0)', opacity: 0.7 }}
                    >
                      {c}
                    </span>
                  </>
                )}
              </span>
            ))}
          </h1>
          {/* A hairline below the 404, in the site accent — like
              navbar eyebrow underlines. */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-3 w-16 h-px bg-blue-500/70" />
        </div>

        {/* Heading + sub */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3 text-center"
        >
          The page you wanted is{' '}
          <span className="text-blue-500 dark:text-blue-400">not here</span>.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7, duration: 0.6 }}
          className="text-zinc-500 dark:text-zinc-400 text-center mb-8 max-w-md text-sm sm:text-base"
        >
          The link you followed either never existed, was moved, or was archived.
          Head home, or jump straight to one of the live sections.
        </motion.p>

        {/* Boot log — typewriter on first paint, monochrome. */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          ref={termRef}
          className="mb-8 max-w-lg w-full p-4 rounded-md bg-zinc-100/70 dark:bg-zinc-900/70 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 font-mono text-[11px] text-zinc-600 dark:text-zinc-400 text-left"
        >
          {BOOT_LINES.map((line, i) => (
            <div key={i} className="leading-relaxed min-h-[1.4em]">
              <span>{typedLog[i] ?? ''}</span>
              {typedLog[i] && typedLog[i].length < line.length && (
                <span className="inline-block w-1.5 h-3 bg-blue-500 ml-0.5 align-middle animate-pulse" />
              )}
              {typedDone && typedLog[i] && typedLog[i].length === line.length && (
                <span className="ml-1 text-zinc-400 dark:text-zinc-500">[ok]</span>
              )}
            </div>
          ))}
          {typedDone && (
            <div className="mt-2 text-zinc-400 dark:text-zinc-500">
              &gt; awaiting input…{' '}
              <span className="inline-block w-1.5 h-3 bg-blue-500 ml-0.5 align-middle animate-pulse" />
            </div>
          )}
        </motion.div>

        {/* Primary actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.5, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center gap-2"
        >
          <button
            onClick={goHome}
            className="inline-flex items-center gap-1.5 h-10 px-5 rounded-md bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 border border-zinc-900 transition-colors dark:bg-white dark:text-zinc-900 dark:border-white dark:hover:bg-zinc-100"
          >
            <ArrowLeftGlyph />
            <span>Go home</span>
          </button>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-1.5 h-10 px-5 rounded-md bg-zinc-100 text-zinc-700 text-sm font-medium border border-zinc-200 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-800 transition-colors"
          >
            <UndoGlyph />
            <span>Back</span>
          </button>
        </motion.div>

        {/* Quick exits — same chrome as the navbar */}
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4, duration: 0.6 }}
          aria-label="Other destinations"
          className="mt-10 w-full max-w-2xl"
        >
          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-500 text-center mb-3">
            Other destinations
          </div>
          <ul className="flex flex-wrap items-center justify-center gap-1.5">
            {QUICK_EXITS.map((q) => (
              <li key={q.href}>
                <a
                  href={q.href}
                  className="inline-flex items-center h-8 px-3 rounded-md text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200 hover:bg-zinc-200 hover:border-zinc-300 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-800 dark:hover:border-zinc-700 transition-all hover:-translate-y-[1px]"
                >
                  {q.label}
                </a>
              </li>
            ))}
          </ul>
        </motion.nav>

        {/* Footer chips */}
        <div className="absolute bottom-6 left-6 font-mono text-[10px] text-zinc-400 dark:text-zinc-600 hidden sm:block">
          [null-route] · state: unresolved · build: 404
        </div>
        <div className="absolute bottom-6 right-6 font-mono text-[10px] text-zinc-400 dark:text-zinc-600 hidden sm:block tabular-nums">
          step {elapsed.toString().padStart(4, '0')}
        </div>
      </div>
    </div>
  );
}

/* Inlined glyphs for the primary-action row — kept monochrome on purpose. */
function ArrowLeftGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}
function UndoGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-15-6.7L3 13" />
    </svg>
  );
}
