'use client';

/**
 * HeroNameCard v5 — monochrome acrylic card.
 *
 * Owner feedback round 4:
 *   - strip the color accents (cyan/indigo glows, cyan pill, emerald
 *     status dot, gradient ring) — the whole site is black/white/
 *     grey; the card must be too
 *   - type was too small for older hiring managers — bump every
 *     text size up a step
 *   - reveal trigger: ONLY hovering "Ethan" on the hero h1. Remove
 *     the local-hover trigger on the card's own area.
 *
 * Structure keeps the acrylic language (backdrop-blur, translucent
 * fill, 1px top highlight, radius hierarchy, left-aligned header,
 * recessed quote panel, bottom status bar) — just monochrome.
 *
 * Reveal: `active` prop only (h1 hover). No local hover. A short
 * 350ms hide grace keeps the fade-out smooth.
 */

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const TAGS = ['Full-Stack', 'AI Agent', 'Automation', 'Photography'];

export default function HeroNameCard({ active = false }: { active?: boolean }) {
  // The ONLY reveal source is `active` (hero h1 hover, Ethan -> Chengze).
  // No local hover listener on the card itself.
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (active) {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }
      setVisible(true);
    } else {
      hideTimer.current = setTimeout(() => setVisible(false), 350);
    }
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [active]);

  return (
    <div className="relative w-full">
      <motion.div
        animate={visible ? 'visible' : 'hidden'}
        initial="hidden"
        variants={{ hidden: { opacity: 1 }, visible: { opacity: 1 } }}
        transition={{ duration: 0.3 }}
        className="relative w-full"
        style={{ minHeight: '430px' }}
      >
        {/* Hidden layer: big '01' + hint */}
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
            Hover my name
          </span>
        </motion.div>

        {/* Acrylic card — monochrome */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 10, scale: 0.985 },
            visible: { opacity: 1, y: 0, scale: 1 },
          }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 overflow-hidden rounded-[28px] border border-zinc-200/70 dark:border-white/10 bg-white/80 dark:bg-zinc-900/50 p-7 backdrop-blur-2xl shadow-2xl shadow-zinc-900/10 dark:shadow-black/40"
        >
          {/* 1px top highlight — glass refraction line (already mono) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 dark:via-white/25 to-transparent"
          />

          {/* Header: avatar + name + role + tags */}
          <div className="flex items-start gap-5">
            {/* Avatar with a soft grey breathing ring */}
            <div className="relative shrink-0">
              <div
                aria-hidden
                className="absolute -inset-1 rounded-full bg-gradient-to-tr from-zinc-300/80 to-zinc-500/80 dark:from-zinc-600/60 dark:to-zinc-400/60 opacity-50 blur-sm"
              />
              <img
                src="/avatar-96.png"
                srcSet="/avatar-96.png 1x, /avatar-192.png 2x"
                alt="Chengze Wu"
                loading="lazy"
                width={80}
                height={80}
                className="relative w-20 h-20 rounded-full object-cover ring-2 ring-white/50 dark:ring-white/20"
              />
              <span className="absolute bottom-0 right-0 flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-900 dark:bg-zinc-100" />
              </span>
            </div>

            {/* Name + role + tags */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2.5">
                <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white truncate">
                  Chengze Wu
                </h3>
                <span className="text-sm px-2.5 py-0.5 rounded-full bg-zinc-900/5 dark:bg-white/10 border border-zinc-300/70 dark:border-white/15 text-zinc-700 dark:text-zinc-200 font-medium shrink-0">
                  Ethan
                </span>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 font-mono tracking-wide">
                CS Graduate Student @ WashU
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {TAGS.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 text-[13px] rounded-lg bg-zinc-100/80 dark:bg-white/[0.06] border border-zinc-200/80 dark:border-white/10 text-zinc-700 dark:text-zinc-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Recessed quote panel */}
          <div className="relative mt-6 rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-zinc-50/80 dark:bg-white/[0.04] p-4.5 backdrop-blur-md">
            <div className="flex items-start gap-3">
              <svg
                className="h-4.5 w-4.5 text-zinc-400 dark:text-zinc-500 shrink-0 mt-1 opacity-80"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-[15px] italic text-zinc-700 dark:text-zinc-200 leading-relaxed">
                I love CS, building things, automating everything, and
                developing content about it.
              </p>
            </div>
          </div>

          {/* Bottom status bar — pure status, no links */}
          <div className="mt-6 pt-4 border-t border-zinc-200/80 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-zinc-100 motion-safe:animate-pulse" />
              <span className="text-[13px] font-mono text-zinc-600 dark:text-zinc-300">
                Open to new roles
              </span>
            </div>
            <span className="text-[13px] font-mono text-zinc-500 dark:text-zinc-400">
              ethanwu.work
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Arrow + caption below the card (points to the footer) */}
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
        <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
          Links live in the footer
        </p>
      </motion.div>
    </div>
  );
}
