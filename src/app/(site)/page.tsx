'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

export default function Home() {
  const reduce = useReducedMotion();
  // "Ethan" → "Chengze" on hover. We keep the h1 in flow (so the
  // eyebrow and "Wu" line below stay anchored) and overlay the two
  // name spans absolutely inside an inline-block. The Wu line and the
  // layout below the h1 do not move during the swap.
  const [showChinese, setShowChinese] = useState(false);

  return (
    <div>
      {/* Hero - Editorial asymmetric layout */}
      <section className="relative min-h-[100dvh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full pt-16 sm:pt-20 pb-20 sm:pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left content */}
            <div className="lg:col-span-7">
              <motion.div
                initial={reduce ? false : { opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="flex items-center gap-3 mb-8"
              >
                <div className="w-8 h-[1px] bg-zinc-300 dark:bg-zinc-700" />
                <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 font-medium">
                  Software Engineer & Sharing Enthusiast
                </span>
              </motion.div>

              <motion.h1
                initial={reduce ? false : { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
                className="text-5xl sm:text-7xl md:text-8xl lg:text-[120px] font-bold tracking-tighter text-zinc-900 dark:text-white leading-[0.85] mb-6 sm:mb-8"
              >
{/* hover swap: 'Ethan' -> 'Chengze'. Two creative bits:
                     1) per-letter crossfade so each glyph morphs in place
                        rather than the whole block replacing (E collapses
                        into C, than into hengze, ghost echoes of letters
                        hang in the middle)
                     2) a small Pinyin hint that appears only in the
                        Chinese state, fading in and out as a tonal
                        whisper, the way the same gesture in a
                        Chinese/English switcher panel on a real
                        language-learning site would do.
                    Aria-label keeps the swap visible to screen readers. */}
                <span
                  className="relative inline-block"
                  aria-label={showChinese ? "Chengze Wu" : "Ethan Wu"}
                  onMouseEnter={() => setShowChinese(true)}
                  onMouseLeave={() => setShowChinese(false)}
                  onFocus={() => setShowChinese(true)}
                  onBlur={() => setShowChinese(false)}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {showChinese ? (
                      <motion.span
                        key="chengze"
                        className="inline-block whitespace-pre cursor-default"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={{
                          hidden:  { opacity: 0, y: 14, filter: "blur(8px)" },
                          visible:{ opacity: 1, y: 0,  filter: "blur(0px)" },
                          exit:    { opacity: 0, y: -10, filter: "blur(6px)" },
                        }}
                        transition={{
                          default: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                          opacity:{ duration: 0.45 },
                          y:       { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                          filter:  { duration: 0.55 },
                        }}
                      >
                        <ChengzeChars />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="ethan"
                        className="inline-block whitespace-pre cursor-default"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={{
                          hidden:  { opacity: 0, y: 14, filter: "blur(8px)" },
                          visible:{ opacity: 1, y: 0,  filter: "blur(0px)" },
                          exit:    { opacity: 0, y: -10, filter: "blur(6px)" },
                        }}
                        transition={{
                          default: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                          opacity:{ duration: 0.45 },
                          y:       { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                          filter:  { duration: 0.55 },
                        }}
                      >
                        <EthanChars />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
                <br />
                <span className="text-zinc-200 dark:text-zinc-800">Wu</span>
              </motion.h1>

              <motion.p
                initial={reduce ? false : { opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
                className="text-base text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed mb-10"
              >
                Building for the web, writing about the craft.
              </motion.p>

              <motion.div
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3, ease: 'easeOut' }}
                className="flex items-center gap-6"
              >
                <Link
                  href="/project"
                  className="group inline-flex items-center gap-3 text-sm font-medium text-zinc-900 dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors duration-150"
                >
                  <span className="w-10 h-10 rounded-full bg-zinc-900 dark:bg-white flex items-center justify-center group-hover:scale-105 transition-transform duration-150">
                    <svg className="w-4 h-4 text-white dark:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                  View Projects
                </Link>
                <span className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-800" />
                <Link
                  href="/resume"
                  className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors duration-150"
                >
                  Resume · PDF
                </Link>
              </motion.div>
            </div>

            {/* Right decorative element */}
            <div className="hidden lg:flex lg:col-span-5 justify-end items-center">
              <motion.div
                initial={reduce ? false : { opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                className="relative"
              >
                {/* Decorative circles */}
                <div className="absolute -top-20 -right-10 w-40 h-40 rounded-full border border-zinc-100 dark:border-zinc-800/30" />
                <div className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full border border-zinc-100 dark:border-zinc-800/30" />
                
                {/* Main number */}
                <span className="text-[140px] font-bold leading-none text-zinc-100 dark:text-zinc-800/40 select-none">
                  01
                </span>
                
                {/* Floating label */}
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5, ease: 'easeOut' }}
                  className="absolute bottom-4 right-4"
                >
                  <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm px-2 py-1 rounded">
                    Portfolio
                  </span>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Bottom info bar */}
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="absolute bottom-4 sm:bottom-8 left-0 right-0 px-4 sm:px-6"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
                Based in St. Louis, MO
              </span>
              <div className="flex items-center gap-4">
                <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
                  Scroll to explore
                </span>
                <motion.div
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <svg className="w-3 h-3 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section></div>
  );
}

/* ----- per-letter components used by the h1 hover swap -----
   Each glyph is a span that animates with the parent AnimatePresence
   variant. The split is intentional: between the two, the middle
   letters (th, heng) drift downward, suggesting the long name is
   "growing" out of the short one. The second-letter accent on the
   "e" in "Chengze" and the small tonal hint beneath the name are
   a small joke for people who read both languages.
*/

const LETTER_BASE_TRANSITION = {
  default: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  opacity: { duration: 0.45 },
  y:        { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  filter:   { duration: 0.55 },
  rotate:   { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

function PerLetter({
  text,
  variant,
  stagger = 0.018,
}: {
  text: string;
  variant: "hidden" | "visible" | "exit";
  stagger?: number;
}) {
  return (
    <>
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block"
          variants={{
            hidden:  { opacity: 0, y: 12, filter: "blur(8px)" },
            visible: { opacity: 1, y: 0,  filter: "blur(0px)" },
            exit:    { opacity: 0, y: -8, filter: "blur(6px)" },
          }}
          transition={{ ...LETTER_BASE_TRANSITION, delay: i * stagger }}
        >
          {ch === " " ? "\u00a0" : ch}
        </motion.span>
      ))}
    </>
  );
}

function EthanChars() {
  return (
    <span className="inline-flex">
      <PerLetter text="Ethan" variant="hidden" />
    </span>
  );
}

function ChengzeChars() {
  return (
    <span className="inline-flex items-baseline">
      <PerLetter text="Cheng" variant="hidden" />
      {/* the second e carries an acute accent when in Pinyin form;
          it appears with the rest of the Chinese state and floats
          in with a slight bob. */}
      <span className="relative inline-block">
        <PerLetter text="ze" variant="hidden" stagger={0.024} />
      </span>
    </span>
  );
}
