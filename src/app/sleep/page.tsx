'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

type MediaType = 'video' | 'audio';

interface MediaItem {
  id: string;
  type: MediaType;
  title: string;
  series: string;
  src: string;
  thumbnail?: string;
  duration?: string;
  description?: string;
}

const SERIES_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  'black-coast-soybean': { label: '黑海岸豆浆', icon: '🌊', color: 'from-blue-500/30 to-cyan-500/20' },
  'traveler-daorong': { label: '行者道荣', icon: '🏔️', color: 'from-amber-500/30 to-orange-500/20' },
  'pebbles-thrilling': { label: '鹅卵石惊险又刺激', icon: '🪨', color: 'from-purple-500/30 to-pink-500/20' },
  'sleep-songs': { label: 'Sleep Songs', icon: '🌙', color: 'from-indigo-500/30 to-violet-500/20' },
  'white-noise': { label: 'Pure White Noise', icon: '🎧', color: 'from-slate-500/30 to-zinc-500/20' },
  'ambient-nature': { label: 'Ambient Nature', icon: '🍃', color: 'from-emerald-500/30 to-teal-500/20' },
};

const ITEMS: MediaItem[] = [
  { id: 'v1', type: 'video', title: 'Black Coast · 1', series: 'black-coast-soybean', src: '', thumbnail: 'https://picsum.photos/seed/v1/600/400', duration: '45:00' },
  { id: 'v2', type: 'video', title: 'Traveler · 1', series: 'traveler-daorong', src: '', thumbnail: 'https://picsum.photos/seed/v2/600/400', duration: '60:00' },
  { id: 'v3', type: 'video', title: 'Pebbles · 1', series: 'pebbles-thrilling', src: '', thumbnail: 'https://picsum.photos/seed/v3/600/400', duration: '30:00' },
  { id: 'a1', type: 'audio', title: 'Sleep Songs · 1', series: 'sleep-songs', src: '', duration: '45:00' },
  { id: 'a2', type: 'audio', title: 'White Noise · Rain', series: 'white-noise', src: '', duration: '∞' },
  { id: 'a3', type: 'audio', title: 'Ambient · Forest', series: 'ambient-nature', src: '', duration: '60:00' },
];

const SERIES_LIST = ['All', ...Array.from(new Set(ITEMS.map(i => i.series)))];
const TIMER_OPTIONS = [
  { label: 'Off', value: 0 },
  { label: '15m', value: 15 },
  { label: '30m', value: 30 },
  { label: '1h', value: 60 },
  { label: '2h', value: 120 },
];

export default function SleepPage() {
  const [loading, setLoading] = useState(true);
  const [activeSeries, setActiveSeries] = useState('All');
  const [nowPlaying, setNowPlaying] = useState<MediaItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [lockScreenEnabled, setLockScreenEnabled] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [timerRemaining, setTimerRemaining] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    function handleVisibility() {
      if (!lockScreenEnabled) return;
      if (document.hidden) {
        audioRef.current?.pause();
        videoRef.current?.pause();
        setIsPlaying(false);
      } else if (nowPlaying && !timerRemaining) {
        audioRef.current?.play().catch(() => {});
        if (nowPlaying.type === 'video') videoRef.current?.play().catch(() => {});
      }
    }
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [lockScreenEnabled, nowPlaying, timerRemaining]);

  useEffect(() => {
    if (timerMinutes === 0) {
      setTimerRemaining(null);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    setTimerRemaining(timerMinutes * 60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimerRemaining(prev => {
        if (prev === null) return null;
        if (prev <= 1) {
          audioRef.current?.pause();
          videoRef.current?.pause();
          setIsPlaying(false);
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerMinutes]);

  const playItem = useCallback((item: MediaItem) => {
    audioRef.current?.pause();
    videoRef.current?.pause();
    setNowPlaying(item);
    setIsPlaying(true);
    setTimeout(() => {
      if (item.type === 'audio') {
        audioRef.current?.play().catch(() => setIsPlaying(false));
      } else {
        videoRef.current?.play().catch(() => setIsPlaying(false));
      }
    }, 50);
  }, []);

  const togglePlay = useCallback(() => {
    if (!nowPlaying) return;
    const ref = nowPlaying.type === 'audio' ? audioRef : videoRef;
    if (isPlaying) {
      ref.current?.pause();
      setIsPlaying(false);
    } else {
      ref.current?.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [nowPlaying, isPlaying]);

  const stopPlayback = useCallback(() => {
    audioRef.current?.pause();
    videoRef.current?.pause();
    setIsPlaying(false);
    setNowPlaying(null);
  }, []);

  const filtered = activeSeries === 'All' ? ITEMS : ITEMS.filter(i => i.series === activeSeries);
  const timerDisplay = timerRemaining !== null
    ? `${Math.floor(timerRemaining / 60)}:${String(timerRemaining % 60).padStart(2, '0')}`
    : null;

  if (loading) return <SleepSkeleton />;

  return (
    // Single root div — NO background color, NO nested containers with backgrounds
    // All visuals come from this one root + decorative absolutely-positioned siblings
    // Content sits directly on body background (#fafafa / #0a0a0b)
    <div className="relative min-h-screen text-zinc-900 dark:text-white overflow-hidden">
      {/* Decorative layer — absolutely positioned, doesn't create any visual containers */}
      {/* Light mode: soft pastel clouds */}
      <div className="pointer-events-none absolute inset-0 dark:hidden overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full bg-purple-200/40 blur-3xl" />
        <div className="absolute top-1/4 -right-40 w-[600px] h-[600px] rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-pink-200/30 blur-3xl" />
      </div>
      {/* Dark mode: starfield + moon glow */}
      <div className="pointer-events-none absolute inset-0 hidden dark:block overflow-hidden">
        {Array.from({ length: 80 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${(i % 3) + 1}px`,
              height: `${(i % 3) + 1}px`,
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              opacity: 0.15 + (i % 5) * 0.1,
              animation: `pulse ${3 + (i % 4)}s ease-in-out infinite`,
              animationDelay: `${(i % 7) * 0.3}s`,
            }}
          />
        ))}
        <div className="absolute top-1/3 right-1/3 w-96 h-96 rounded-full bg-purple-500/10 blur-[120px]" />
        <div className="absolute bottom-1/3 left-1/3 w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      {/* Content — sits directly on the page, no wrapper div with background */}
      <div className="relative z-10 pt-24 pb-32 px-4 sm:px-6">
        {/* Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100/80 dark:bg-white/[0.04] border border-zinc-200/80 dark:border-white/[0.08] mb-5 backdrop-blur-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 dark:bg-purple-400 animate-pulse" />
            <span className="text-xs text-zinc-600 dark:text-zinc-400">Ethan&apos;s Blog · Sleep</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[0.9] mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-300 dark:to-indigo-300">Drift</span>
            <span className="text-zinc-400 dark:text-zinc-400"> Off</span>
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg max-w-xl mx-auto px-2">
            Soft videos and gentle audio for sleep
          </p>
        </div>

        {/* Series filter */}
        <div className="flex justify-center mb-12">
          <div className="glass-nav-acrylic rounded-full px-4 py-2 flex items-center gap-1 max-w-3xl overflow-x-auto scrollbar-hide">
            {SERIES_LIST.map(s => {
              const cfg = s === 'All' ? null : SERIES_CONFIG[s];
              return (
                <button
                  key={s}
                  onClick={() => setActiveSeries(s)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 flex-shrink-0 flex items-center gap-1.5 ${
                    activeSeries === s
                      ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {cfg && <span>{cfg.icon}</span>}
                  {s === 'All' ? 'All' : cfg?.label || s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content grid — direct on page, no wrapper with background */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {filtered.map(item => {
            const cfg = SERIES_CONFIG[item.series];
            const isCurrent = nowPlaying?.id === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => playItem(item)}
                whileHover={{ y: -2 }}
                className={`group relative aspect-[4/3] rounded-2xl overflow-hidden border ${
                  isCurrent
                    ? 'border-purple-500 dark:border-purple-400 ring-2 ring-purple-500/30 dark:ring-purple-400/30'
                    : 'border-zinc-200/60 dark:border-white/[0.06] hover:border-zinc-300 dark:hover:border-white/[0.12]'
                } transition-all bg-white/30 dark:bg-white/[0.02] backdrop-blur-sm`}
              >
                {/* Series gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${cfg?.color || 'from-zinc-500/20 to-zinc-700/10'}`} />
                {/* Thumbnail */}
                {item.thumbnail && (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover opacity-40 dark:opacity-50 mix-blend-overlay"
                  />
                )}
                {/* Type badge */}
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-sm text-[10px] uppercase tracking-wider text-zinc-700 dark:text-white">
                  {item.type}
                </div>
                {/* Playing indicator */}
                {isCurrent && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-500/80 dark:bg-purple-500/30 backdrop-blur-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-purple-400 animate-pulse" />
                    <span className="text-[10px] text-white dark:text-purple-200">Playing</span>
                  </div>
                )}
                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white/95 via-white/70 to-transparent dark:from-black/80 dark:via-black/40 dark:to-transparent">
                  <p className="text-zinc-900 dark:text-white font-medium text-sm text-left">{item.title}</p>
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5 text-left">
                    {cfg?.label || item.series}
                    {item.duration && ` · ${item.duration}`}
                  </p>
                </div>
                {/* Play icon overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-purple-600/80 dark:bg-purple-500/80 backdrop-blur-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Floating player — fixed position, sits on body bg */}
      <AnimatePresence>
        {nowPlaying && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-[600px] z-50"
          >
            <div className="glass-nav-acrylic rounded-2xl p-4 backdrop-blur-2xl border border-zinc-200/60 dark:border-white/[0.08] shadow-2xl shadow-zinc-900/10 dark:shadow-black/40">
              {/* Video preview */}
              {nowPlaying.type === 'video' && (
                <video
                  ref={videoRef}
                  src={nowPlaying.src}
                  className="w-full aspect-video rounded-lg mb-3 bg-black/50 object-cover"
                  loop
                  muted
                  playsInline
                />
              )}
              {nowPlaying.type === 'audio' && (
                <audio ref={audioRef} src={nowPlaying.src} loop />
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 flex-shrink-0 rounded-full bg-purple-600 hover:bg-purple-500 dark:bg-purple-500 dark:hover:bg-purple-400 flex items-center justify-center text-white transition-colors"
                >
                  {isPlaying ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
                  ) : (
                    <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-900 dark:text-white font-medium truncate">{nowPlaying.title}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {SERIES_CONFIG[nowPlaying.series]?.label || nowPlaying.series}
                    {timerDisplay && ` · ⏱ ${timerDisplay}`}
                  </p>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={e => {
                    const v = parseFloat(e.target.value);
                    setVolume(v);
                    if (audioRef.current) audioRef.current.volume = v;
                    if (videoRef.current) videoRef.current.volume = v;
                  }}
                  className="w-20 accent-purple-500 hidden sm:block"
                />
                <button
                  onClick={stopPlayback}
                  className="w-8 h-8 rounded-full bg-zinc-200/80 dark:bg-white/[0.06] hover:bg-zinc-300 dark:hover:bg-white/[0.12] flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-200/60 dark:border-white/[0.06]">
                <button
                  onClick={() => setLockScreenEnabled(v => !v)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                    lockScreenEnabled
                      ? 'bg-purple-500/30 text-purple-700 dark:text-purple-200'
                      : 'bg-zinc-100 dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/[0.08]'
                  }`}
                  title="When ON: audio stops when screen locks. When OFF: audio continues playing when screen locks."
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    {lockScreenEnabled ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 10V7a6 6 0 0112 0v3M5 10h14a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9a1 1 0 011-1z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 10V7a6 6 0 0111.66-2M5 10h14a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9a1 1 0 011-1zM3 3l18 18" />
                    )}
                  </svg>
                  Lock: {lockScreenEnabled ? 'Pause on hide' : 'Always play'}
                </button>

                <div className="flex items-center gap-1 ml-auto">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-500">Sleep</span>
                  {TIMER_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setTimerMinutes(opt.value)}
                      className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                        timerMinutes === opt.value
                          ? 'bg-purple-500/30 text-purple-700 dark:text-purple-200'
                          : 'bg-zinc-100 dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/[0.08]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SleepSkeleton() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const bars = ref.current.querySelectorAll('.shimmer-bar');
    bars.forEach((el, i) => {
      gsap.fromTo(el, { x: '-100%' }, { x: '200%', duration: 1.5, ease: 'none', repeat: -1, delay: i * 0.08 });
    });
  }, []);
  return (
    // No bg here either — sit on body bg
    <div ref={ref} className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 dark:hidden overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full bg-purple-200/40 blur-3xl" />
        <div className="absolute top-1/4 -right-40 w-[600px] h-[600px] rounded-full bg-indigo-200/30 blur-3xl" />
      </div>
      <div className="pointer-events-none absolute inset-0 hidden dark:block overflow-hidden">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="absolute w-1 h-1 rounded-full bg-white/20"
            style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%` }} />
        ))}
      </div>
      <div className="relative z-10 pt-24 pb-10 px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="mx-auto w-44 h-6 rounded-full bg-zinc-200/60 dark:bg-white/[0.04] overflow-hidden relative mb-5 backdrop-blur-sm">
            <div className="shimmer-bar absolute inset-0 bg-gradient-to-r from-transparent via-white/60 dark:via-white/[0.06] to-transparent" />
          </div>
          <div className="mx-auto w-80 h-16 rounded-lg bg-zinc-200/60 dark:bg-white/[0.04] overflow-hidden relative">
            <div className="shimmer-bar absolute inset-0 bg-gradient-to-r from-transparent via-white/60 dark:via-white/[0.06] to-transparent" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] rounded-2xl bg-zinc-200/40 dark:bg-white/[0.02] overflow-hidden relative backdrop-blur-sm">
              <div className="shimmer-bar absolute inset-0 bg-gradient-to-r from-transparent via-white/60 dark:via-white/[0.04] to-transparent" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
