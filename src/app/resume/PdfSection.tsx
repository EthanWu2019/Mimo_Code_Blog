'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * PDF preview block, minimal: just the iframe and a single floating
 * fullscreen button.
 *
 * What this component is NOT:
 *  - No card chrome (no border, no rounded-2xl wrapper)
 *  - No header bar (no "Live preview" label, no green status dot)
 *  - No floating toolbar / no overlay / no extra buttons
 *
 * What it IS:
 *  - A plain wrapper <div ref={wrapRef}> that holds the iframe and
 *    can be sent to the HTML5 Fullscreen API on user click.
 *  - One fullscreen toggle button positioned bottom-right of the
 *    wrapper. It's the only UI chrome visible to the user.
 *
 * The fullscreen button is only rendered when the browser supports
 * the Fullscreen API (`document.fullscreenEnabled`). On iOS Safari
 * (which doesn't), the user just sees the bare PDF and can scroll
 * the page naturally.
 */
export default function PdfSection({
  isAdmin,
  src,
}: {
  isAdmin: boolean;
  src: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
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
    <div ref={wrapRef} className="relative bg-zinc-100 dark:bg-zinc-950">
      <iframe
        src={src}
        title="Ethan Wu — Resume"
        className="w-full bg-white dark:bg-zinc-950 block mx-auto"
        style={{
          height: '1120px',
          width: '100%',
          maxWidth: '816px',
          border: 0,
        }}
      />
      {canFullscreen && (
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={isFs ? 'Exit fullscreen' : 'View fullscreen'}
          title={isFs ? 'Exit fullscreen' : 'View fullscreen'}
          className="absolute bottom-3 right-3 z-10 inline-flex items-center justify-center w-9 h-9 rounded-full bg-zinc-900/80 dark:bg-white/90 text-white dark:text-zinc-900 backdrop-blur hover:bg-zinc-900 dark:hover:bg-white transition-colors shadow-lg"
        >
          {isFs ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4H4v5h5M15 9V4h5v5h-5M9 15v5H4v-5h5M15 15v5h5v-5h-5" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
