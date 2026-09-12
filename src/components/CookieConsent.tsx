'use client';

/**
 * CookieConsent — a small, self-aware cookie banner.
 *
 * What it actually says: the site collects nothing. The Google /
 * GitHub OAuth flows use session cookies strictly to keep the
 * user signed in; we don't run analytics, ads, or any third-
 * party trackers. The banner is here because:
 *
 *   - It's the polite thing to do when any cookie is set, even
 *     essential ones, and
 *   - The owner wanted an in-joke: "we bought too many cookies,
 *     here's one".
 *
 * What it actually does: nothing functional. Session cookies are
 * always set regardless of the user's choice; the banner is a
 * visible acknowledgement, not a real opt-in/out. The choice is
 * remembered in localStorage (not a cookie) so we don't fire it
 * again for 30 days, after which the cookie metaphor expires.
 *
 * Position: bottom-right floating card, NOT a full-width banner.
 * Glass/blur background matching the navbar so it doesn't compete
 * with the site's primary content.
 *
 * No third-party libraries. ~120 lines.
 */

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'ethanwu-cookie-consent';
const EXPIRY_DAYS = 30;

type Decision = 'accept' | 'decline' | null;

interface StoredConsent {
  decision: Exclude<Decision, null>;
  /** epoch ms; null/undefined means expired */
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
    // localStorage may be unavailable (private mode, etc.) — swallow
    // rather than crash the page.
  }
}

/**
 * Hand-drawn cookie SVG. One plate-and-cookie pair sitting on a
 * napkin. All inline, no asset path. The "shading" on the cookie
 * is just three darker dots, deliberately childlike — the owner's
 * joke is the joke, not a render.
 */
function CookieIllustration() {
  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-14 h-14 sm:w-16 sm:h-16 shrink-0"
      aria-hidden
    >
      {/* napkin / plate (very thin ellipse, slightly off-axis) */}
      <ellipse cx="48" cy="72" rx="34" ry="4" fill="currentColor" opacity="0.12" />
      {/* cookie body — irregular circle. Drawn as a path so we can
          wobble the edge (real cookies aren't perfect circles). */}
      <path
        d="M30 38
           c-2 4 -2 9 0 14
           c2 6 8 10 14 11
           c6 1 13 -1 17 -5
           c5 -4 7 -11 4 -17
           c-2 -5 -7 -8 -12 -9
           c-6 -1 -13 1 -17 5
           c-1 1 -2 2 -2 3
           z"
        fill="#C28856"
        stroke="#7B4A1F"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* chocolate chip shadows — three irregular dark spots */}
      <ellipse cx="40" cy="42" rx="3.2" ry="2.6" fill="#3F1E0E" transform="rotate(-18 40 42)" />
      <ellipse cx="54" cy="50" rx="2.6" ry="2.0" fill="#3F1E0E" transform="rotate(22 54 50)" />
      <ellipse cx="46" cy="56" rx="2.4" ry="1.9" fill="#3F1E0E" transform="rotate(-8 46 56)" />
      {/* highlight — one small lighter arc to suggest a baked surface */}
      <path
        d="M34 38 c2 -1 5 -1 7 0"
        stroke="#E0B07A"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
      {/* crumb falling on the napkin */}
      <circle cx="72" cy="70" r="1.6" fill="#7B4A1F" opacity="0.7" />
      <circle cx="66" cy="74" r="1.0" fill="#7B4A1F" opacity="0.5" />
    </svg>
  );
}

export default function CookieConsent() {
  // null = not yet decided this session
  const [decision, setDecision] = useState<Decision>(null);
  // avoids hydration mismatch: SSR always renders nothing, the
  // banner appears after the client mounts and reads localStorage.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDecision(readConsent());
  }, []);

  if (!mounted || decision !== null) return null;

  const handle = (d: Exclude<Decision, null>) => {
    writeConsent(d);
    setDecision(d);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie notice"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[60] w-[min(92vw,360px)] rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-xl shadow-zinc-900/[0.08] dark:shadow-black/40 px-4 py-4 sm:px-5 sm:py-5"
    >
      <div className="flex items-start gap-3">
        <CookieIllustration />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-zinc-900 dark:text-white leading-snug">
            送你一个 cookie
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            我们没收集你的任何信息。
            OAuth 登录只用必要的 session cookie。买多了，送你一个。
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => handle('decline')}
          className="px-3 py-1.5 text-[12px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
        >
          不用了谢谢
        </button>
        <button
          type="button"
          onClick={() => handle('accept')}
          className="px-3 py-1.5 text-[12px] font-medium rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
        >
          收到，咬一口
        </button>
      </div>
    </div>
  );
}
