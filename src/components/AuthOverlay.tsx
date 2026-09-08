'use client';

import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';

/**
 * Global OAuth sign-in loading overlay.
 *
 * Wraps next-auth's `signIn` so any provider button (Google / GitHub) shows
 * a centered spinner + status text instead of a dead click. The overlay
 * closes automatically when:
 *   - the signIn() promise resolves (i.e. the user is redirected away),
 *   - the user comes back to the tab (visibilitychange),
 *   - 90 s of inactivity (failsafe for stalled signin flow).
 *
 * We mutate the global signIn at import time so existing call sites
 * (`onClick={() => signIn('google', { callbackUrl: '/' })}`) get the
 * overlay for free — no need to change every button.
 */

type Provider = 'google' | 'github' | 'credentials';
type SignInArgs = Parameters<typeof signIn>;

const TIMEOUT_MS = 90_000;

let setOverlayState:
  | ((s: { id: number; provider: Provider; visible: boolean; error?: string }) => void)
  | null = null;

let idCounter = 0;

export function signInWithOverlay(provider: Provider, options?: SignInArgs[1]) {
  const id = ++idCounter;
  setOverlayState?.({ id, provider, visible: true });
  return signIn(provider, options as SignInArgs[1]);
}

export default function AuthOverlay() {
  const [state, setState] = useState<{
    id: number;
    provider: Provider;
    visible: boolean;
    error?: string;
  } | null>(null);

  // Expose the setter globally for the wrapper above.
  useEffect(() => {
    setOverlayState = setState;
    return () => {
      setOverlayState = null;
    };
  }, []);

  // Failsafe: hide after 90s in case the signIn() promise never resolves
  // (e.g. user closed the OAuth popup, or the callback silently failed).
  useEffect(() => {
    if (!state?.visible) return;
    const t = setTimeout(() => {
      setState((s) => (s ? { ...s, visible: false, error: 'Sign-in took too long. Try again.' } : s));
    }, TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [state?.visible, state?.id]);

  // Hide overlay if user returns to the tab (OAuth flow dropped through).
  useEffect(() => {
    if (!state?.visible) return;
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        setState(null);
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [state?.visible]);

  if (!state?.visible) return null;

  const label = state.provider === 'google'
    ? 'Authenticating with Google…'
    : state.provider === 'github'
    ? 'Authenticating with GitHub…'
    : 'Signing in…';

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[300] flex items-center justify-center px-4"
      data-auth-overlay
    >
      <div
        className="absolute inset-0 bg-zinc-900/50 dark:bg-black/70 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div className="relative bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/60 dark:border-white/[0.08] rounded-2xl shadow-2xl shadow-zinc-900/10 dark:shadow-black/40 px-8 py-7 flex flex-col items-center gap-4 min-w-[280px]">
        <div className="relative w-12 h-12 flex items-center justify-center">
          {state.provider === 'google' && (
            <svg className="w-7 h-7" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.7 1.22 9.2 3.6l6.9-6.9C35.9 2.4 30.3 0 24 0 14.6 0 6.4 5.4 2.5 13.3l8 6.2C12.3 13.3 17.7 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.9 7.2l7.6 5.9c4.4-4 6.9-9.9 6.9-17.6z"/>
              <path fill="#FBBC05" d="M10.5 28.5c-.6-1.8-1-3.7-1-5.7s.4-3.9 1-5.7l-8-6.2C.9 14.4 0 18.1 0 22c0 3.9.9 7.6 2.5 10.9l8-6.4z"/>
              <path fill="#34A853" d="M24 46c6.2 0 11.4-2 15.2-5.6l-7.6-5.9c-2.1 1.4-4.8 2.3-7.6 2.3-6.3 0-11.7-3.8-13.5-9.4l-8 6.2C6.4 42.6 14.6 46 24 46z"/>
            </svg>
          )}
          {state.provider === 'github' && (
            <svg className="w-7 h-7 text-zinc-900 dark:text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2.9-.8 2-.3 3-.4 1-.1 2.1 0 3.1.9 1.5 2.1 1.2 3.1.8 1.2 2.7 1.1 3.4.7 1.3-.8 1.6-1.6 1.6 1.1 0 2-.1 2.1 1.6 1 0 0 .7 0 2-1.6.7.1.6-1.7 1.4-1.4 1.7-1.6 1.4-3.5 1.4-3.3 0-1.7-.3-2-1.6-1.5 0-3.1-1.5-3.1-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2.9-.8 2-.3 3-.4 1-.1 2.1 0 3.1.9 1.5 2.1 1.2 3.1.8 1.2 2.7 1.1 3.4.7 1.3-.8 1.6-1.6 1.6 1.1 0 2-.1 2.1 1.6 1 0 0 .7 0 2z"/>
            </svg>
          )}
          {state.provider === 'credentials' && (
            <svg className="w-7 h-7 text-zinc-400 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="9" opacity="0.25" />
              <path d="M21 12a9 9 0 0 1-9 9" strokeLinecap="round" />
            </svg>
          )}
        </div>
        <p className="text-sm font-medium text-zinc-900 dark:text-white">{label}</p>
        {state.error ? (
          <p className="text-xs text-red-600 dark:text-red-400 max-w-[260px] text-center">
            {state.error}
          </p>
        ) : (
          <p className="text-xs text-zinc-400 dark:text-white/30">
            Complete the prompt in the new tab
          </p>
        )}
      </div>
    </div>
  );
}
