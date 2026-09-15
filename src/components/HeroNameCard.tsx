'use client';

/**
 * HeroNameCard — the personal business card that appears in the
 * right side of the home hero on hover.
 *
 * Design language mirrors the Footer "About" block (which the owner
 * explicitly prefers): bordered card, eyebrow label, large circular
 * avatar, name + role, the zh/en personal statement, contact line,
 * and the social row. Everything is one size up from the previous
 * version — the owner found the old card too small and the type too
 * small to read.
 *
 * Reveal logic: React state (NOT framer-motion whileHover, which did
 * not propagate hover to child variants in this build). Two trigger
 * sources OR'd:
 *   - `active` from the hero h1 hover (Ethan → Chengze swap moment)
 *   - local hover on the card's own area
 * Plus a 450ms hide grace period so the mouse can travel from the
 * h1 across the gap to the card and still click the links inside.
 */

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const SOCIAL_ROWS = [
  {
    label: 'GitHub',
    href: 'https://github.com/EthanWu2019',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/chengze-wu-3398a0224/',
  },
  {
    label: 'Cafe',
    href: 'https://ethanwu.cafe/',
  },
];

export default function HeroNameCard({ active = false }: { active?: boolean }) {
  const [localHover, setLocalHover] = useState(false);
  const wantVisible = active || localHover;

  // Grace period: when the mouse leaves the h1 and travels toward the
  // card, `active` drops to false for a few frames. Without a delay
  // the card would vanish mid-flight and the links inside would be
  // impossible to click.
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
    <motion.div
      onMouseEnter={() => setLocalHover(true)}
      onMouseLeave={() => setLocalHover(false)}
      animate={visible ? 'visible' : 'hidden'}
      initial="hidden"
      variants={{
        hidden: { opacity: 1 },
        visible: { opacity: 1 },
      }}
      transition={{ duration: 0.3 }}
      className="group relative w-full cursor-pointer"
      // No fixed aspect ratio: the card height follows its content.
      // The hidden "01" layer fills the same area via min-height so
      // the hero doesn't jump when the card swaps in.
      style={{ minHeight: '360px' }}
    >
      {/* Hidden-state layer: the big "01" baseline + hint. Fills the
          same min-height so the hero column keeps its shape. */}
      <motion.div
        variants={{
          hidden: { opacity: 1 },
          visible: { opacity: 0 },
        }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="absolute inset-0 flex flex-col items-center justify-center select-none"
        aria-hidden="true"
      >
        <span className="text-[120px] sm:text-[160px] xl:text-[200px] font-bold leading-none text-zinc-100 dark:text-zinc-800/40">
          01
        </span>
        <span className="mt-4 text-[11px] uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-600 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:text-zinc-700 motion-safe:animate-pulse" />
          Hover for the card
        </span>
      </motion.div>

      {/* Visible-state layer: the card. Footer-About-style layout,
          scaled up for the hero: roomier padding, larger type. */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 8, scale: 0.98 },
          visible: { opacity: 1, y: 0, scale: 1 },
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 flex flex-col rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.28)] dark:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.65)] p-6 text-left"
      >
        {/* Eyebrow — same uppercase tracking treatment as the Footer
            BlockLabel, so the card reads as part of the same system. */}
        <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500 font-medium">
          About
        </p>

        {/* Identity row: large avatar + name + role */}
        <div className="mt-4 flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 ring-1 ring-zinc-200/70 dark:ring-zinc-800/70 shrink-0">
            <img
              src="/avatar-96.png"
              srcSet="/avatar-96.png 1x, /avatar-192.png 2x"
              alt="Chengze Wu (also goes by Ethan)"
              loading="lazy"
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white leading-snug">
              Chengze <span className="text-zinc-500 dark:text-zinc-400 font-normal">(Ethan)</span> Wu
            </h3>
            <p className="mt-1 text-[13px] text-zinc-500 dark:text-zinc-400">
              Software Engineer · WashU CS
            </p>
          </div>
        </div>

        {/* Personal statement — zh + en, one size larger than before */}
        <p className="mt-5 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          热爱 cs, 做东西, 自动化一切事物, developing 内容。
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-500 italic">
          I love CS, building things, automating everything, and developing
          content about it.
        </p>

        {/* Contact + socials, anchored to the bottom of the card */}
        <div className="mt-auto pt-5">
          <a
            href="mailto:ethanwucz2019@gmail.com"
            className="block text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white underline underline-offset-4 decoration-zinc-300 dark:decoration-zinc-700 transition-colors"
          >
            ethanwucz2019@gmail.com
          </a>
          <div className="mt-3 flex items-center gap-2">
            {SOCIAL_ROWS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-[12px] font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
              >
                {s.label}
                <span className="text-zinc-400 dark:text-zinc-600" aria-hidden>
                  ↗
                </span>
              </a>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
