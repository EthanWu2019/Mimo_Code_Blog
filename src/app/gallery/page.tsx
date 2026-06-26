'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import SecureImage from '@/components/SecureImage';

interface GalleryItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  tags: string[];
  date: string;
  imageUrl: string;
  aspectRatio: 'portrait' | 'landscape' | 'square';
  featured?: boolean;
  width?: number;
  height?: number;
}

// (data is fetched at runtime inside the component)
function buildHeroGroups(items: GalleryItem[], size: number): GalleryItem[][] {
  const groups: GalleryItem[][] = [];
  for (let i = 0; i < items.length; i += size) {
    groups.push(items.slice(i, i + size));
  }
  return groups;
}

function GalleryCard({ item, onOpen, likes, onLike }: {
  item: GalleryItem;
  onOpen: (item: GalleryItem) => void;
  likes: number;
  onLike: (id: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="mb-4 break-inside-avoid group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative rounded-xl overflow-hidden cursor-pointer border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-500"
        onClick={() => onOpen(item)}
        style={{
          aspectRatio:
            item.width && item.height
              ? `${item.width} / ${item.height}`
              : item.aspectRatio === 'portrait'
              ? '3 / 4'
              : item.aspectRatio === 'square'
              ? '1 / 1'
              : '4 / 3',
        }}
      >
        {/* Secure image with built-in watermark + blob: URL (no http:// exposure) */}
        <SecureImage
          slug={item.slug}
          alt={item.title}
          variant="thumb"
          className="absolute inset-0 w-full h-full transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Hover overlay -- non-interactive background, only buttons receive clicks */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 pointer-events-none"
            >
              <h3 className="text-white font-semibold text-lg">{item.title}</h3>
              <p className="text-zinc-300 text-sm mt-1">{item.subtitle}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {item.tags.map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-200 backdrop-blur-sm">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-zinc-400 text-xs">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onLike(item.id); }}
                  className="pointer-events-auto flex items-center gap-1.5 text-xs text-zinc-300 hover:text-[#bf5af2] transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill={likes > 0 ? '#bf5af2' : 'none'} stroke={likes > 0 ? '#bf5af2' : 'currentColor'} strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {likes}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Always visible like button */}
        {!isHovered && (
          <div className="absolute top-3 right-3 z-20">
            <button
              onClick={(e) => { e.stopPropagation(); onLike(item.id); }}
              className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-zinc-300 hover:text-[#bf5af2] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill={likes > 0 ? '#bf5af2' : 'none'} stroke={likes > 0 ? '#bf5af2' : 'currentColor'} strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function GalleryPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [tab, setTab] = useState<'all' | 'sref' | 'seed'>('all');
  const heroRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch gallery items from API
  useEffect(() => {
    let cancelled = false;
    fetch('/api/gallery')
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        const list = (data.items || []).map((it: any) => ({
          id: it.id,
          slug: it.slug,
          title: it.title,
          subtitle: it.subtitle || '',
          tags: it.tags || [],
          date: new Date(it.createdAt).toISOString().slice(0, 10),
          imageUrl: `/api/gallery/${it.slug}/image`,
          aspectRatio: it.aspectRatio || 'landscape',
          featured: it.featured || false,
          width: it.width,
          height: it.height,
        }));
        setItems(list);
        setLoading(false);
      })
      .catch(err => {
        console.error('Gallery fetch failed:', err);
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Init shimmer animations for skeleton bars
  useEffect(() => {
    if (!loading) return;
    const bars = document.querySelectorAll('.shimmer-bar');
    bars.forEach((el, i) => {
      gsap.fromTo(el, { x: '-100%' }, { x: '200%', duration: 1.5, ease: 'none', repeat: -1, delay: i * 0.08 });
    });
  }, [loading]);

  // Animate frame corner borders on hero
  useEffect(() => {
    if (loading || !heroRef.current) return;
    const corners = heroRef.current.querySelectorAll('div');
    corners.forEach((el, i) => {
      gsap.fromTo(el,
        { scaleX: i % 2 === 0 ? 0 : 1, scaleY: i % 2 === 0 ? 1 : 0 },
        { scaleX: 1, scaleY: 1, duration: 0.8, delay: 0.3 + i * 0.08, ease: 'power2.out', overwrite: true }
      );
    });
  }, [loading, currentSlide]);

  useEffect(() => {
    const stored = localStorage.getItem('gallery-likes');
    if (stored) setLikes(JSON.parse(stored));
  }, []);

  const handleLike = useCallback((id: string) => {
    setLikes(prev => {
      const next = { ...prev, [id]: (prev[id] || 0) + 1 };
      localStorage.setItem('gallery-likes', JSON.stringify(next));
      return next;
    });
  }, []);

  const filteredItems = activeTag
    ? items.filter(item => item.tags.includes(activeTag))
    : items;

  const sortedItems = sortBy === 'newest'
    ? [...filteredItems].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [...filteredItems].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedItem(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Hero slideshow auto-rotation
  const SLIDE_SIZE = 5;
  const heroGroups = buildHeroGroups(items, SLIDE_SIZE);
  useEffect(() => {
    if (isPaused || loading || heroGroups.length === 0) return;
    intervalRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % Math.max(heroGroups.length, 1));
    }, 4500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, loading, heroGroups.length]);

  const currentGroup = heroGroups[currentSlide] || heroGroups[0] || [];
  const allTags = Array.from(new Set(items.flatMap(item => item.tags)));

  // Simulated "currently generating" typewriter
  const fullPrompt = 'a quiet city street in tokyo at 3am, neon reflections on wet asphalt, cinematic grain, kodak portra 800';
  const metaString = 'SDXL 1.0 · 50 steps · CFG 7.5 · 1024×1024';
  const [typedPrompt, setTypedPrompt] = useState('');
  const [typedMeta, setTypedMeta] = useState('');
  const [progress, setProgress] = useState(0);
  const [genStep, setGenStep] = useState(0);

  useEffect(() => {
    let i = 0; setTypedPrompt('');
    const pId = setInterval(() => {
      i++; setTypedPrompt(fullPrompt.slice(0, i));
      if (i >= fullPrompt.length) clearInterval(pId);
    }, 35);
    let j = 0; setTypedMeta('');
    const mId = setInterval(() => {
      j++; setTypedMeta(metaString.slice(0, j));
      if (j >= metaString.length) clearInterval(mId);
    }, 50);
    return () => { clearInterval(pId); clearInterval(mId); };
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { setGenStep(s => (s + 1) % 4); return 0; }
        return p + 2;
      });
    }, 100);
    return () => clearInterval(id);
  }, []);

  const genStepLabels = ['Injecting noise', 'Denoising · 24/50 steps', 'Refining details', 'Upscaling 2×'];

  return (
    <div className="min-h-screen">
      {/* Hero Section — generative canvas concept */}
      <section
        className="relative -mt-[72px] pt-[72px] min-h-[100vh] overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* ==== Background layers ==== */}
        <div className="absolute inset-0">
          {/* Radial gradient orbs */}
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-[#bf5af2]/12 dark:bg-[#bf5af2]/8 blur-3xl animate-pulse will-change-[opacity]" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-[320px] h-[320px] rounded-full bg-indigo-500/12 dark:bg-indigo-500/8 blur-3xl animate-pulse will-change-[opacity]" style={{ animationDuration: '10s', animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-r from-[#bf5af2]/8 to-indigo-500/8 dark:from-[#bf5af2]/4 dark:to-indigo-500/4 blur-3xl" />

          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: 'linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)',
              backgroundSize: '56px 56px',
            }} />
          <div className="absolute inset-0 opacity-30 hidden dark:block"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: '56px 56px',
            }} />

          {/* Noise overlay — static, low-cost CSS texture */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.10] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>")`,
              backgroundSize: '200px 200px',
            }}
          />
        </div>

        {/* ==== Hero Content: 12-column asymmetric grid ==== */}
        <div className="relative z-10 max-w-7xl mx-auto px-8 pt-16 pb-20 min-h-[calc(100vh-72px)] flex items-center">
          <div className="grid grid-cols-12 gap-8 w-full items-center">
            {/* ==== LEFT: copy + meta + stats ==== */}
            <div className="col-span-12 lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-zinc-300 dark:border-white/10 bg-zinc-100/50 dark:bg-white/[0.03] backdrop-blur-sm mb-6"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#bf5af2] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#bf5af2]"></span>
                </span>
                <span className="text-[10px] font-medium tracking-[0.18em] uppercase text-zinc-600 dark:text-zinc-400">
                  Ethan's Blog · Generative
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl md:text-6xl xl:text-7xl font-semibold tracking-tighter text-zinc-900 dark:text-white leading-[0.95]"
              >
                Pixels born
                <br />
                from{' '}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-[#bf5af2] via-fuchsia-400 to-indigo-500 bg-clip-text text-transparent">
                    prompts
                  </span>
                  <svg className="absolute -bottom-2 left-0 w-full" height="6" viewBox="0 0 200 6" fill="none">
                    <path d="M2 4 Q 100 -2 198 4" stroke="url(#g1)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <defs>
                      <linearGradient id="g1" x1="0" x2="200" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#8b5cf6" />
                        <stop offset="1" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
                .
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="mt-5 text-base text-zinc-600 dark:text-zinc-400 max-w-md leading-relaxed"
              >
                A studio for images conjured from language. Stable Diffusion, Midjourney, Flux — and a great many midnight prompts.
              </motion.p>

              {/* Live generation block */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="mt-7 p-4 rounded-2xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-50/60 dark:bg-white/[0.02] backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#bf5af2] animate-pulse"></span>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                      live · now generating
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 tabular-nums">
                    {Math.floor(progress)}%
                  </span>
                </div>
                <div className="text-[12px] font-mono text-zinc-700 dark:text-zinc-300 leading-relaxed min-h-[3rem] break-words">
                  <span className="text-zinc-500 dark:text-zinc-500">&quot;{typedPrompt}</span>
                  <span className="inline-block w-1.5 h-3 bg-[#bf5af2] align-middle ml-0.5 animate-pulse"></span>
                  <span className="text-zinc-500 dark:text-zinc-500">&quot;</span>
                </div>
                <div className="mt-3 h-1 rounded-full bg-zinc-200 dark:bg-white/[0.06] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#bf5af2] via-fuchsia-500 to-indigo-500"
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-zinc-500 dark:text-zinc-500">
                  <span>{genStepLabels[genStep]}</span>
                  <span>seed: 8419207</span>
                </div>
              </motion.div>

              {/* Stat row */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="mt-6 flex gap-6"
              >
                <div>
                  <div className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-white">148</div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mt-0.5">prompts</div>
                </div>
                <div className="w-px bg-zinc-200 dark:bg-white/[0.06]" />
                <div>
                  <div className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-white">12</div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mt-0.5">models</div>
                </div>
                <div className="w-px bg-zinc-200 dark:bg-white/[0.06]" />
                <div>
                  <div className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-white">∞</div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mt-0.5">iterations</div>
                </div>
              </motion.div>
            </div>

            {/* ==== RIGHT: live "generating" preview with HUD ==== */}
            <div className="col-span-12 lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="relative aspect-[5/4] rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/[0.08] bg-zinc-100 dark:bg-zinc-900/40"
              >
                {/* The "image" — blurry → sharp as progress increases */}
                <div className="absolute inset-0">
                  <img
                    src="https://picsum.photos/seed/tokyo-neon-3am/1200/960"
                    alt="AI generated image preview"
                    className="w-full h-full object-cover"
                    loading="eager"
                    decoding="async"
                    style={{ filter: `blur(${Math.min((100 - progress) / 40, 2.5)}px) saturate(${0.9 + progress / 200})` }}
                  />
                </div>

                {/* Noise overlay — fades as progress increases (low-fps, small canvas) */}
                <div
                  className="absolute inset-0 mix-blend-overlay pointer-events-none"
                  style={{ opacity: (100 - progress) / 120 }}
                >
                  <canvas
                    ref={(el) => {
                      if (!el) return;
                      const ctx = el.getContext('2d');
                      if (!ctx) return;
                      const size = 160; // tiny canvas — tiled
                      el.width = size;
                      el.height = size;
                      const draw = () => {
                        const imageData = ctx.createImageData(size, size);
                        const d = imageData.data;
                        for (let i = 0; i < d.length; i += 4) {
                          const v = Math.random() < 0.5 ? 255 : 0;
                          d[i] = v; d[i + 1] = v; d[i + 2] = v;
                          d[i + 3] = Math.random() < 0.5 ? 20 : 0;
                        }
                        ctx.putImageData(imageData, 0, 0);
                      };
                      draw();
                      const id = setInterval(draw, 200); // 5fps
                      return () => clearInterval(id);
                    }}
                    className="w-full h-full"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>

                {/* Scan line */}
                <motion.div
                  className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-400/80 to-transparent"
                  initial={{ top: '0%' }}
                  animate={{ top: '100%' }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                />

                {/* Top HUD */}
                <div className="absolute top-0 inset-x-0 flex items-center justify-between p-3.5 text-[10px] font-mono uppercase tracking-widest text-white/90 z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    <span>REC</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>1024×1024</span>
                    <span className="opacity-50">·</span>
                    <span className="font-mono normal-case tracking-normal text-[10px]">{typedMeta}</span>
                  </div>
                </div>

                {/* Bottom HUD */}
                <div className="absolute bottom-0 inset-x-0 p-3.5 z-10">
                  <div className="flex items-center justify-between text-[10px] font-mono text-white/80">
                    <div className="flex items-center gap-3">
                      <span>step {Math.floor((progress / 100) * 50)}/50</span>
                      <span className="opacity-50">·</span>
                      <span>noise {Math.round(100 - progress)}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {['noise', 'denoise', 'refine', 'upscale'].map((s, i) => (
                        <span
                          key={s}
                          className={`h-1 rounded-full transition-all duration-300 ${
                            i === genStep ? 'w-6 bg-white' : i < genStep ? 'w-2 bg-white/60' : 'w-2 bg-white/20'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Corner brackets */}
                <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-white/40 z-10" />
                <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-white/40 z-10" />
                <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-white/40 z-10" />
                <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-white/40 z-10" />
              </motion.div>

              {/* Below preview: tab bar */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="mt-3 flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400"
              >
                <div className="flex items-center gap-3">
                  {(['all', 'sref', 'seed'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`uppercase tracking-widest transition-colors ${
                        tab === t ? 'text-zinc-900 dark:text-white' : 'hover:text-zinc-700 dark:hover:text-zinc-300'
                      }`}
                    >
                      {t === 'sref' ? 'style ref' : t}
                      {tab === t && <span className="ml-1.5 text-[#bf5af2]">·</span>}
                    </button>
                  ))}
                </div>
                <span>↓ scroll to collection</span>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Filter Bar — floating pill like navbar */}
      <div className="sticky top-[72px] z-40 flex justify-center px-4 py-3">
        <div className="glass-nav-acrylic rounded-full px-5 py-2.5 flex items-center gap-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveTag(null)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                activeTag === null
                  ? 'bg-[#bf5af2] text-white shadow-sm shadow-[#bf5af2]/20'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                  activeTag === tag
                    ? 'bg-[#bf5af2] text-white shadow-sm shadow-[#bf5af2]/20'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="w-px h-5 bg-zinc-200 dark:bg-white/10 mx-1" />
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSortBy('newest')}
              className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                sortBy === 'newest' ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500'
              }`}
            >
              Newest
            </button>
            <button
              onClick={() => setSortBy('oldest')}
              className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                sortBy === 'oldest' ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500'
              }`}
            >
              Oldest
            </button>
          </div>
        </div>
      </div>

      {/* Masonry Grid — 1 item: 2/3 width, 2 items: 2 cols, 3+: 3 cols */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {['280px', '360px', '240px', '320px', '260px', '380px'].map((h, i) => (
              <div key={i} className="mb-4 break-inside-avoid rounded-xl bg-zinc-200/60 dark:bg-white/[0.04] overflow-hidden relative" style={{ height: h }}>
                <div className="shimmer-bar absolute inset-0 bg-gradient-to-r from-transparent via-white/60 dark:via-white/[0.06] to-transparent" />
              </div>
            ))}
          </div>
        ) : (
        <motion.div
          layout
          className={
            sortedItems.length === 1
              ? 'columns-1 gap-4 max-w-[66.67%] mx-auto'
              : sortedItems.length === 2
              ? 'columns-1 sm:columns-2 gap-4'
              : 'columns-1 sm:columns-2 lg:columns-3 gap-4'
          }
        >
          <AnimatePresence mode="popLayout">
            {sortedItems.map((item) => (
              <GalleryCard
                key={item.id}
                item={item}
                onOpen={setSelectedItem}
                likes={likes[item.id] || 0}
                onLike={handleLike}
              />
            ))}
          </AnimatePresence>
        </motion.div>
        )}
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-[95vw] max-h-[92vh] overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.1] backdrop-blur-2xl"
              onClick={(e) => e.stopPropagation()}
              onContextMenu={(e) => e.preventDefault()}
            >
              {/* Buttons — at lightbox level (top of stacking context) */}
              <button
                onClick={() => {
                  const img = document.querySelector<HTMLImageElement>(
                    `[data-secure-img="${selectedItem.slug}-thumb"]`,
                  );
                  if (img?.requestFullscreen) img.requestFullscreen();
                }}
                aria-label="View fullscreen"
                title="View fullscreen"
                className="absolute top-4 right-16 z-[60] w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                aria-label="Close"
                className="absolute top-4 right-4 z-[60] w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex flex-col lg:flex-row max-h-[92vh]">
                {/* Image — click to open native fullscreen (browser's own zoom UI) */}
                <div
                  className="lg:w-2/3 relative bg-black/30 flex items-center justify-center cursor-zoom-in group"
                  style={{ minHeight: '300px', maxHeight: '92vh' }}
                  onContextMenu={(e) => e.preventDefault()}
                  onClick={() => {
                    const img = document.querySelector<HTMLImageElement>(
                      `[data-secure-img="${selectedItem.slug}-thumb"]`,
                    );
                    if (img?.requestFullscreen) img.requestFullscreen();
                  }}
                >
                  <SecureImage
                    slug={selectedItem.slug}
                    alt={selectedItem.title}
                    variant="thumb"
                    className="w-full h-full"
                  />
                  {/* Zoom hint */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-xs text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                    </svg>
                    Click image for fullscreen
                  </div>
                </div>

                {/* Metadata */}
                <div className="lg:w-1/3 p-6 flex flex-col justify-between overflow-y-auto">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedItem.title}</h2>
                    <p className="text-zinc-400 mt-2">{selectedItem.subtitle}</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {selectedItem.tags.map(tag => (
                        <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-[#bf5af2]/10 text-[#bf5af2] border border-[#bf5af2]/20">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-zinc-500 text-sm mt-4">
                      {new Date(selectedItem.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-2">
                    <button
                      onClick={() => handleLike(selectedItem.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#bf5af2]/10 border border-[#bf5af2]/20 text-[#bf5af2] hover:bg-[#bf5af2]/20 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill={likes[selectedItem.id] ? '#bf5af2' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {likes[selectedItem.id] || 0} Likes
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
