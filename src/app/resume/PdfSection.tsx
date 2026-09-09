'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import PdfIframeForwarder from './PdfIframeForwarder';

/**
 * PDF preview block: the styled card with the iframe inside. Adds a
 * fullscreen toggle so the user can blow up the PDF to fill the
 * viewport.
 *
 * Two interesting bits:
 *
 *  1. Cursor dot forwarding — the underlying PDF is rendered inside
 *     an iframe; HTML5 Fullscreen API accepts requestFullscreen() on
 *     ANY element including the iframe's contentDocument. We put the
 *     iframe inside a positioned wrapper and fullscreen the wrapper.
 *     CursorGlow's document-level mousemove listener continues to
 *     receive events inside the fullscreen element (it's a normal
 *     page state, just with one element at viewport size), so the
 *     cursor dot keeps tracking across the fullscreen PDF.
 *
 *  2. Fullscreen API needs a user gesture. We attach the request to
 *     the button's onClick. The button is only rendered when the
 *     document supports fullscreen (older browsers / iOS Safari may
 *     not), via the `canFullscreen` flag derived from the
 *     `fullscreenEnabled` Document property.
 */
export default function PdfSection({
  isAdmin,
  src,
}: {
  isAdmin: boolean;
  src: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  // The fullscreen API tracks which element is currently fullscreen.
  // We use that to flip the toggle button icon between enter/exit.
  const [isFs, setIsFs] = useState(false);
  const [canFullscreen, setCanFullscreen] = useState(false);

  useEffect(() => {
    setCanFullscreen(
      typeof document !== 'undefined' && !!document.fullscreenEnabled
    );
    const onChange = () => {
      setIsFs(document.fullscreenElement === wrapRef.current);
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const el = wrapRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await el.requestFullscreen();
      }
    } catch (e) {
      // Some browsers (Safari iOS) throw — ignore.
      console.warn('[PdfSection] fullscreen request failed', e);
    }
  }, []);

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-white/[0.02]">
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
          <span>Live preview</span>
        </div>
        <div className="flex items-center gap-1">
          {canFullscreen && (
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFs ? 'Exit fullscreen' : 'View fullscreen'}
              title={isFs ? 'Exit fullscreen' : 'View fullscreen'}
              className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-colors"
            >
              {isFs ? (
                // exit-fullscreen icon (corners pointing inward)
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4H4v5h5M15 9V4h5v5h-5M9 15v5H4v-5h5M15 15v5h5v-5h-5" />
                </svg>
              ) : (
                // enter-fullscreen icon (corners pointing outward)
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
      <div ref={wrapRef} className="bg-zinc-50 dark:bg-zinc-950/40">
        <PdfIframeForwarder isAdmin={isAdmin} src={src} />
      </div>
    </div>
  );
}
