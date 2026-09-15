'use client';

/**
 * HeroNameCard — the personal business card that appears in the
 * right side of the home hero on hover.
 *
 * Why hover, not always-on: the hero's whole job is to push the
 * visitor to /project via the primary CTA. A second always-on card
 * competes for attention. The name swap on the h1 (Ethan -> Chengze)
 * is the existing magic moment; this card extends it with concrete
 * identity info (Chinese given name, current title, where to reach)
 * so a non-Chinese reader who hovers the name learns who's behind
 * the site.
 *
 * Same content as the Footer "About" block — this is the on-page
 * counterpart, not a duplicate of the contact form. The Footer's
 * avatar still has its own hover cue (the small "hover me" dot)
 * which is the footer-level invitation.
 */

import { motion } from 'framer-motion';

const HOVER_DELAY = 0.18; // wait a beat so it doesn't feel twitchy

export default function HeroNameCard() {
  return (
    <motion.div
      // The whole right-rail block is the hover target, not just a
      // button. This means recruiters don't need to know where to
      // click — anywhere on the decorative 01 area shows the card.
      whileHover="visible"
      initial="hidden"
      animate="hidden"
      className="group relative w-full max-w-sm aspect-[4/3] cursor-pointer"
    >
      {/* Two stacked layers: the big "01" baseline that lives here
          forever, and the personal card that fades in on hover.
          Crossfade between them — owner gets a familiar number when
          the cursor is elsewhere, and a name card when they look
          closer. */}
      <motion.div
        variants={{
          hidden:  { opacity: 1 },
          visible: { opacity: 0 },
        }}
        transition={{ duration: HOVER_DELAY + 0.3, ease: 'easeOut' }}
        className="absolute inset-0 flex flex-col items-center justify-center select-none"
        aria-hidden="true"
      >
        <span className="text-[120px] sm:text-[160px] xl:text-[200px] font-bold leading-none text-zinc-100 dark:text-zinc-800/40">
          01
        </span>
        <span className="mt-3 text-[10px] uppercase tracking-[0.18em] text-zinc-300 dark:text-zinc-700">
          Hover the card
        </span>
      </motion.div>

      {/* Personal card. Replaces the "01" when hovered. */}
      <motion.div
        variants={{
          hidden:  { opacity: 0, y: 6, scale: 0.98 },
          visible: { opacity: 1, y: 0, scale: 1 },
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: HOVER_DELAY }}
        className="absolute inset-0 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] p-5 sm:p-6 flex flex-col"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 ring-1 ring-zinc-200 dark:ring-zinc-700 shrink-0">
            {/* Avatar — same source as the Footer card so the
                recruiter who hovers here sees the same face they see
                in the Footer. */}
            <img
              src="/avatar-96.png"
              srcSet="/avatar-96.png 1x, /avatar-192.png 2x"
              alt="Chengze Wu (also goes by Ethan)"
              loading="lazy"
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-zinc-900 dark:text-white leading-tight">
              Chengze <span className="text-zinc-500 dark:text-zinc-400 font-normal">(Ethan)</span> Wu
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Software Engineer · WashU CS
            </div>
          </div>
        </div>

        <p className="mt-4 text-[12.5px] leading-relaxed text-zinc-600 dark:text-zinc-400">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">Chengze</span> is my
          Chinese name; I go by <span className="font-medium text-zinc-800 dark:text-zinc-200">Ethan</span> in
          English. Same person, two names, one résumé.
        </p>

        <div className="mt-auto pt-4 space-y-1.5 text-[11.5px] text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-px bg-zinc-300 dark:bg-zinc-700" />
            <span>St. Louis, MO · Open to roles</span>
          </div>
          <a
            href="mailto:ethanwucz2019@gmail.com"
            className="block text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white underline underline-offset-4 decoration-zinc-300 dark:decoration-zinc-700 transition-colors"
          >
            ethanwucz2019@gmail.com
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}
