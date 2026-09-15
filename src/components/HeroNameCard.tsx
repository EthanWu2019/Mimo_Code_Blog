'use client';

/**
 * HeroNameCard — the personal business card revealed on hover in the
 * right side of the home hero.
 *
 * Owner requirements (v3):
 *   - English only (drop the Chinese statement line)
 *   - NO links, no mailto, no social buttons inside the card — it is
 *     a pure display card. The owner explicitly does not want users
 *     to have to dart the mouse into a hover-revealed popup to reach
 *     a link. All actual links live in the footer.
 *   - An arrow + caption BELOW the card pointing down: "your links are
 *     in the footer".
 *   - More refined, less generic design than v2.
 *
 * Design language: centered business-card front. Small uppercase
 * eyebrow, a soft-glowing circular avatar, the name set in the site's
 * serif display voice with a quiet sans sub-line, a hairline rule,
 * the personal statement, and a bottom meta line. Large type, roomy
 * padding, minimal chrome.
 *
 * Reveal logic: React state (NOT framer-motion whileHover). Two
 * triggers OR'd: `active` from the hero h1 hover, or local hover on
 * the card area. 450ms hide grace period.
 */

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

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
      {/* Card area. No fixed aspect ratio; height follows content with
          a min-height so the hidden '01' layer and the visible card
          occupy the same footprint (no layout jump on swap). */}
      <motion.div
        onMouseEnter={() => setLocalHover(true)}
        onMouseLeave={() => setLocalHover(false)}
        animate={visible ? 'visible' : 'hidden'}
        initial="hidden"
        variants={{ hidden: { opacity: 1 }, visible: { opacity: 1 } }}
        transition={{ duration: 0.3 }}
        className="relative w-full cursor-default"
        style={{ minHeight: '400px' }}
      >
        {/* Hidden layer: the big '01' + hover hint. */}
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

        {/* Visible layer: centered business-card front. */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 10, scale: 0.985 },
            visible: { opacity: 1, y: 0, scale: 1 },
          }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-[0_24px_60px_-24px_rgba(0,0,0,0.3)] dark:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.7)] px-8 py-8 text-center"
        >
          {/* Soft top light so the card doesn't read flat. */}
          <div
            aria-hidden
            className="absolute inset-0 rounded-3xl bg-gradient-to-b from-zinc-50/70 via-transparent to-transparent dark:from-white/[0.04] pointer-events-none"
          />

          <div className="relative flex flex-col items-center">
            {/* Eyebrow */}
            <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-400 dark:text-zinc-500 font-medium">
              Profile
            </p>

            {/* Avatar with a soft double ring */}
            <div className="mt-6 relative">
              <div
                aria-hidden
                className="absolute -inset-2 rounded-full bg-zinc-900/[0.05] dark:bg-white/[0.05] blur-md"
              />
              <div className="relative w-20 h-20 rounded-full overflow-hidden ring-1 ring-zinc-200/80 dark:ring-zinc-700/80 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.25)]">
                <img
                  src="/avatar-96.png"
                  srcSet="/avatar-96.png 1x, /avatar-192.png 2x"
                  alt="Chengze Wu"
                  loading="lazy"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Name in the site's serif display voice */}
            <h3 className="mt-6 font-serif text-[38px] leading-none tracking-tight text-zinc-900 dark:text-white">
              Chengze Wu
            </h3>
            <p className="mt-2 text-[13px] text-zinc-500 dark:text-zinc-400">
              Also goes by <span className="text-zinc-800 dark:text-zinc-200 font-medium">Ethan</span>
            </p>

            {/* Hairline */}
            <div className="mt-6 w-12 h-px bg-zinc-300 dark:bg-zinc-700" />

            {/* Statement — the whole point of the card */}
            <p className="mt-6 max-w-[26ch] text-[14.5px] leading-relaxed text-zinc-600 dark:text-zinc-400">
              I love CS, building things, automating everything, and
              developing content about it.
            </p>

            {/* Bottom meta */}
            <p className="mt-7 text-[10px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
              Software Engineer · WashU CS · St. Louis
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Arrow + caption below the card. Not a link — a pointer toward
          the footer where the real links live. Fades in with the card
          so the whole reveal reads as one gesture. */}
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
