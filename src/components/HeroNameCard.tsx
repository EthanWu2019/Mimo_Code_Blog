'use client';

/**
 * HeroNameCard \u2014 the personal business card that appears in the
 * right side of the home hero on hover.
 *
 * Why hover, not always-on: the hero's whole job is to push the
 * visitor to /project via the primary CTA. A second always-on card
 * competes for attention.
 *
 * Content (per owner):
 *   \u2014 name + dual name explanation
 *   \u2014 "热爱 cs, 做东西, 自动化一切事物, developing 内容" \u2014 i.e.
 *     what drives the owner to keep building
 *   \u2014 contact line (mail)
 *   \u2014 three social rows (GitHub / LinkedIn / cafe)
 *
 * Hover trigger is on the whole motion.div via whileHover; the
 * framer-motion whileHover variant is the most reliable cross-page
 * trigger we have for an in-place fade swap.
 *
 * The '01' decorative baseline is preserved as the hidden-state
 * layer so a recruiter who never hovers still sees the page design
 * intent (a numbered hero) and the small "hover" hint.
 */

import { motion } from 'framer-motion';

const HOVER_DELAY = 0.18;

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

export default function HeroNameCard() {
  return (
    <motion.div
      // The whole right-rail block is the hover target, not just a
      // button. This means recruiters don't need to know where to
      // click \u2014 anywhere on the decorative 01 area shows the card.
      whileHover="visible"
      initial="hidden"
      animate="hidden"
      variants={{
        hidden:  { opacity: 1 },
        visible: { opacity: 1 },
      }}
      transition={{ duration: 0.3 }}
      className="group relative w-full max-w-sm aspect-[4/3] cursor-pointer"
    >
      {/* Hidden-state layer: the big '01' baseline. Lives here forever
          so a recruiter who doesn't hover still sees the page design
          intent. The hint text is the in-page CTA that mirrors the
          Footer avatar's pulsing dot. */}
      <motion.div
        variants={{
          hidden:  { opacity: 1 },
          visible: { opacity: 0 },
        }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="absolute inset-0 flex flex-col items-center justify-center select-none"
        aria-hidden="true"
      >
        <span className="text-[120px] sm:text-[160px] xl:text-[200px] font-bold leading-none text-zinc-100 dark:text-zinc-800/40">
          01
        </span>
        <span className="mt-3 text-[10px] uppercase tracking-[0.18em] text-zinc-300 dark:text-zinc-700 flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-zinc-300 dark:text-zinc-700 motion-safe:animate-pulse" />
          Hover for the card
        </span>
      </motion.div>

      {/* Visible-state layer: the personal business card. */}
      <motion.div
        variants={{
          hidden:  { opacity: 0, y: 6, scale: 0.98 },
          visible: { opacity: 1, y: 0, scale: 1 },
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: HOVER_DELAY }}
        className="absolute inset-0 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] p-4 sm:p-5 flex flex-col text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 ring-1 ring-zinc-200 dark:ring-zinc-700 shrink-0">
            <img
              src="/avatar-96.png"
              srcSet="/avatar-96.png 1x, /avatar-192.png 2x"
              alt="Chengze Wu (also goes by Ethan)"
              loading="lazy"
              width={44}
              height={44}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-zinc-900 dark:text-white leading-tight">
              Chengze <span className="text-zinc-500 dark:text-zinc-400 font-normal">(Ethan)</span> Wu
            </div>
            <div className="text-[10.5px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Software Engineer · WashU CS
            </div>
          </div>
        </div>

        {/* What drives the owner. Short, line-broken so it stays inside
            the 4:3 card frame. The Chinese version of the personal
            statement reads more naturally to the owner; the English
            version reads naturally to the recruiter. Both show \u2014 a
            US recruiter who hovers will see "热爱 cs, 做东西, \u81ea\u52a8\u5316\u4e00\u5207\u4e8b\u7269"
            and the surrounding context makes the meaning clear. */}
        <p className="mt-3 text-[12.5px] leading-relaxed text-zinc-600 dark:text-zinc-400">
          热爱 cs, 做东西, 自动化一切事物, developing 内容。
        </p>
        <p className="text-[11.5px] leading-relaxed text-zinc-500 dark:text-zinc-500 italic">
          I love CS, building things, automating everything, and developing
          content about it.
        </p>

        <div className="mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-1.5">
          <a
            href="mailto:ethanwucz2019@gmail.com"
            className="block text-[11.5px] text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white underline underline-offset-4 decoration-zinc-300 dark:decoration-zinc-700 transition-colors"
          >
            ethanwucz2019@gmail.com
          </a>
          {SOCIAL_ROWS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <span>{s.label}</span>
              <span className="text-zinc-300 dark:text-zinc-600" aria-hidden>
                ↗
              </span>
            </a>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
