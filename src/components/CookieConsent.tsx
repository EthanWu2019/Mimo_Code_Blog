'use client';

/**
 * CookieConsent — a self-aware cookie banner, v2.
 *
 * Copy (English, per owner):
 *   "Care for a cookie?"
 *   "No tracking, no analytics — we just overbaked and wanted to share."
 *   "Yum, thanks!" / "I'm full"
 *
 * The joke: every other site's cookie banner is legalese about
 * surveillance. Ours is a cookie with a face, offering itself.
 *
 * Functional behaviour unchanged from v1:
 *   - nothing is tracked; session cookies are set regardless
 *   - choice stored in localStorage, re-shown after 30 days
 *   - bottom-right floating card
 *
 * Visual: sticky-note card (slight rotation, tape strip on top),
 * a cookie character with eyes / smile / blush that wiggles on
 * hover, spring entrance ~0.6s after mount.
 */

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const STORAGE_KEY = 'ethanwu-cookie-consent';
const EXPIRY_DAYS = 30;

type Decision = 'accept' | 'decline' | null;

interface StoredConsent {
  decision: Exclude<Decision, null>;
  expiresAt: number;
}

function readConsent(): Decision {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    if (!parsed || !parsed.decision) return null;
    if (typeof parsed.expiresAt !== 'number' || parsed.expiresAt < Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed.decision;
  } catch {
    return null;
  }
}

function writeConsent(decision: Exclude<Decision, null>) {
  if (typeof window === 'undefined') return;
  const payload: StoredConsent = {
    decision,
    expiresAt: Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage unavailable (private mode) — swallow.
  }
}

/**
 * The cookie character. A warm brown cookie with two eyes, a smile,
 * blush cheeks, and a few chocolate chips. Rendered inline so there
 * is no asset to ship. The whole SVG is wrapped in a motion.span that
 * wiggles when the card is hovered — the cookie is happy to see you.
 */
function CookieCharacter() {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-16 h-16 sm:w-[72px] sm:h-[72px] shrink-0 drop-shadow-sm"
      aria-hidden
      initial={false}
      animate={{ rotate: 0 }}
      whileHover={{ rotate: [0, -7, 7, -4, 4, 0] }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      {/* soft ground shadow */}
      <ellipse cx="50" cy="88" rx="26" ry="5" fill="#000" opacity="0.10" />

      {/* body — irregular baked edge */}
      <path
        d="M32 40
           c-3 5 -3 12 1 17
           c3 6 10 10 17 10
           c7 0 13 -3 16 -8
           c3 -5 3 -12 -1 -17
           c-3 -5 -9 -8 -16 -8
           c-6 0 -13 2 -17 6
           z"
        fill="#C8905B"
        stroke="#7A4A22"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* chocolate chips */}
      <ellipse cx="38" cy="40" rx="3.4" ry="2.7" fill="#4A2A12" transform="rotate(-16 38 40)" />
      <ellipse cx="58" cy="44" rx="2.7" ry="2.2" fill="#4A2A12" transform="rotate(24 58 44)" />
      <ellipse cx="44" cy="56" rx="2.5" ry="2.0" fill="#4A2A12" transform="rotate(-6 44 56)" />
      <ellipse cx="62" cy="58" rx="2.9" ry="2.3" fill="#4A2A12" transform="rotate(18 62 58)" />

      {/* baked highlight */}
      <path
        d="M36 34 c3 -1.5 6 -1.5 9 0"
        stroke="#E2B078"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* blush */}
      <ellipse cx="43" cy="50" rx="3.4" ry="2.2" fill="#F2A6A0" opacity="0.85" />
      <ellipse cx="58" cy="50" rx="3.4" ry="2.2" fill="#F2A6A0" opacity="0.85" />

      {/* eyes — dark dots with tiny white highlights */}
      <circle cx="46" cy="46" r="2.3" fill="#3B2410" />
      <circle cx="55" cy="46" r="2.3" fill="#3B2410" />
      <circle cx="46.8" cy="45.2" r="0.8" fill="#FFFFFF" opacity="0.9" />
      <circle cx="55.8" cy="45.2" r="0.8" fill="#FFFFFF" opacity="0.9" />

      {/* smile — small open curve */}
      <path
        d="M46.5 52.5 c2 2.2 5 2.2 7 0"
        stroke="#3B2410"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* crumbs */}
      <circle cx="80" cy="82" r="1.8" fill="#7A4A22" opacity="0.6" />
      <circle cx="74" cy="86" r="1.1" fill="#7A4A22" opacity="0.4" />
    </motion.svg>
  );
}

export default function CookieConsent() {
  const [decision, setDecision] = useState<Decision>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDecision(readConsent());
  }, []);

  const handle = (d: Exclude<Decision, null>) => {
    writeConsent(d);
    setDecision(d);
  };

  return (
    <AnimatePresence>
      {mounted && decision === null && (
        <motion.div
          key="cookie-card"
          role="dialog"
          aria-live="polite"
          aria-label="Cookie notice"
          initial={{ opacity: 0, y: 36, rotate: 5, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, rotate: -1.6, scale: 1 }}
          exit={{ opacity: 0, y: 24, rotate: 3, scale: 0.94 }}
          transition={{
            type: 'spring',
            stiffness: 240,
            damping: 19,
            delay: 0.55,
          }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[60] w-[min(92vw,340px)] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-[#fffdf6] dark:bg-zinc-900/95 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.18),0_2px_6px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.6)] px-5 py-5"
        >
          {/* tape strip — sticky-note illusion */}
          <span
            aria-hidden
            className="absolute -top-2.5 left-1/2 -translate-x-1/2 -rotate-2 w-16 h-5 rounded-[2px] bg-zinc-300/70 dark:bg-zinc-700/60 backdrop-blur-sm"
          />

          <div className="flex items-center gap-4">
            <CookieCharacter />
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-white leading-snug">
                Care for a cookie?
              </p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                No tracking, no analytics — we just overbaked and wanted to share.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => handle('decline')}
              className="px-3.5 py-1.5 text-[12.5px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors"
            >
              I&apos;m full
            </button>
            <button
              type="button"
              onClick={() => handle('accept')}
              className="px-4 py-1.5 text-[12.5px] font-semibold rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-100 active:scale-95 transition-all"
            >
              Yum, thanks!
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
