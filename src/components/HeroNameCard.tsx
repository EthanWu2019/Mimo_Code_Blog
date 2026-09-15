'use client';

/**
 * HeroNameCard v4 — frosted-acrylic personal card, per Gemini's
 * design direction and the owner's constraints.
 *
 * Design language (from the reference):
 *   - real acrylic: backdrop-blur, translucent fill, 1px gradient
 *     highlight edge (glass refraction line at the top)
 *   - radius hierarchy: outer rounded-3xl(28px), inner panels
 *     rounded-2xl(16px), tags/buttons rounded-lg/xl
 *   - ambient glow blobs behind the card (cyan + indigo, very faint)
 *   - breathing gradient ring around the avatar, status dot
 *   - left-aligned header (avatar left, name + role + tags right)
 *   - recessed quote panel for the personal statement
 *   - bottom status bar (mono) — NO links inside the card
 *
 * Owner constraints kept:
 *   - English only
 *   - zero links inside the card (pure display; the arrow below
 *     points to the footer where the real links live)
 *   - reveal: React state, h1-hover OR local hover, 450ms grace
 */

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const TAGS = ['Full-Stack', 'AI Agent', 'Automation', 'Photography'];

export default function HeroNameCard({ active = false }: { active?: boolean }) {
  const [localHover, setLocalHover] = useState(false);
  const wantVisible = active || localHover;

  const [visible, setVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (wantVisible) {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }
      setVisible(true);
    } else {
      hideTimer.current = setTimeout(() => setVisible(false), 450);
    }
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [wantVisible]);

  return (
    <div className="relative w-full">
      <motion.div
        onMouseEnter={() => setLocalHover(true)}
        onMouseLeave={() => setLocalHover(false)}
        animate={visible ? 'visible' : 'hidden'}
        initial="hidden"
        variants={{ hidden: { opacity: 1 }, visible: { opacity: 1 } }}
        transition={{ duration: 0.3 }}
        className="relative w-full"
        style={{ minHeight: '400px' }}
      >
        {/* ── Hidden layer: the big '01' + hint ─────────────────── */}
        <motion.div
          variants={{ hidden: { opacity: 1 }, visible: { opacity: 0 } }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="absolute inset-0 flex flex-col items-center justify-center select-none"
          aria-hidden="true"
        >
          <span className="text-[130px] sm:text-[170px] xl:text-[210px] font-bold leading-none text-zinc-100 dark:text-zinc-800/40">
            01
          </span>
          <span className="mt-5 text-[11px] uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-600 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 motion-safe:animate-pulse" />
            Hover for the card
          </span>
        </motion.div>

        {/* ── Ambient glow blobs behind the card ─────────────────── */}
        <motion.div
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          aria-hidden="true"
          className="absolute -top-10 -left-10 w-44 h-44 bg-cyan-500/15 dark:bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          aria-hidden="true"
          className="absolute -bottom-10 -right-10 w-44 h-44 bg-indigo-500/15 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"
        />

        {/* ── Acrylic card ───────────────────────────────────────── */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 10, scale: 0.985 },
            visible: { opacity: 1, y: 0, scale: 1 },
          }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 overflow-hidden rounded-[28px] border border-zinc-200/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/40 p-7 backdrop-blur-2xl shadow-2xl shadow-zinc-900/10 dark:shadow-black/40"
        >
          {/* 1px top highlight — glass refraction line */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 dark:via-white/30 to-transparent"
          />

          {/* Header: avatar + name + role + tags */}
          <div className="flex items-start gap-5">
            {/* Avatar with breathing gradient ring + status dot */}
            <div className="relative shrink-0">
              <div
                aria-hidden
                className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-cyan-500/70 to-indigo-500/70 opacity-60 blur-sm transition duration-300"
              />
              <img
                src="/avatar-96.png"
                srcSet="/avatar-96.png 1x, /avatar-192.png 2x"
                alt="Chengze Wu"
                loading="lazy"
                width={72}
                height={72}
                className="relative w-[72px] h-[72px] rounded-full object-cover ring-2 ring-white/40 dark:ring-white/20"
              />
              <span className="absolute bottom-0 right-0 flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-500" />
              </span>
            </div>

            {/* Name + role + tags */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white/90 truncate">
                  Chengze Wu
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 dark:bg-white/5 border border-cyan-500/30 dark:border-white/10 text-cyan-600 dark:text-cyan-300 font-medium shrink-0">
                  Ethan
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-slate-400 mt-1 font-mono tracking-wide">
                CS Graduate Student @ WashU
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {TAGS.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 text-[11px] rounded-lg bg-zinc-100/70 dark:bg-white/[0.04] border border-zinc-200/70 dark:border-white/5 text-zinc-600 dark:text-slate-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Recessed quote panel — the personal statement */}
          <div className="relative mt-6 rounded-2xl border border-zinc-200/70 dark:border-white/5 bg-zinc-50/70 dark:bg-white/[0.02] p-4 backdrop-blur-md">
            <div className="flex items-start gap-2.5">
              <svg
                className="h-4 w-4 text-cyan-500 dark:text-cyan-400 shrink-0 mt-0.5 opacity-80"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-[13px] italic text-zinc-600 dark:text-slate-300/90 leading-relaxed">
                I love CS, building things, automating everything, and
                developing content about it.
              </p>
            </div>
          </div>

          {/* Bottom status bar — no links, pure status */}
          <div className="mt-6 pt-4 border-t border-zinc-200/70 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse motion-safe:animate-pulse" />
              <span className="text-[11px] font-mono text-zinc-500 dark:text-slate-400">
                Open to new roles
              </span>
            </div>
            <span className="text-[11px] font-mono text-zinc-400 dark:text-slate-500">
              ethanwu.work
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Arrow + caption below the card (points to the footer) ── */}
      <motion.div
        initial={false}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 4 }}
        transition={{ duration: 0.35, delay: visible ? 0.2 : 0 }}
        className="mt-3 flex flex-col items-center gap-1.5 text-center pointer-events-none"
        aria-hidden="true"
      >
        <svg
          className="w-4 h-4 text-zinc-400 dark:text-zinc-500 motion-safe:animate-bounce"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m0 0l-5-5m5 5l5-5" />
        </svg>
        <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
          Links live in the footer
        </p>
      </motion.div>
    </div>
  );
}
