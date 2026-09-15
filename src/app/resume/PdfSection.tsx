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
    // Outer wrapper holds the fullscreen target ref + the data attribute
    // that suppresses the global cursor dot. The fullscreen button used
    // to be anchored to THIS outer wrapper's top-right, which placed it
    // on top of the wrapper's scrollbar whenever the viewport was wider
    // than the iframe. Now the iframe + button share an inner relative
    // wrapper capped at the iframe's max-width (816 px), so the button
    // always sits flush into the iframe's actual top-right corner.
    <div ref={wrapRef} data-cursor-suppress="5" className="relative bg-zinc-100 dark:bg-zinc-950">
      {/* Mobile-only hint: on a phone the PDF renders inside Chrome's
          viewer, which owns pinch-zoom and pan gestures. Desktop keeps
          the exact-page aspect ratio. */}
      <p className="lg:hidden mb-2 text-center text-[11px] uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
        Pinch to zoom · drag to move
      </p>
      <div className="relative mx-auto" style={{ width: '100%', maxWidth: '816px' }}>
        <iframe
          src={`${src}#navpanes=0&toolbar=${isFs ? 1 : 0}&view=FitH&zoom=80`}
          title="Ethan Wu — Resume"
          className="block w-full h-[80dvh] lg:h-auto lg:aspect-[8.5/11] bg-white dark:bg-zinc-950"
          style={{
            // Mobile: the iframe fills 80dvh so Chrome's PDF viewer has
            // a full viewport to work in — the user pinch-zooms and
            // pans inside the viewer, which is far better than a
            // letter-aspect iframe shrunk to a 390px phone. Desktop
            // (lg+): aspect-ratio 8.5/11 pins the frame to the exact
            // US-Letter page (816 x 1056 px at 96 DPI), same as before.
            border: 0,
          }}
        />
        {canFullscreen && (
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFs ? 'Exit fullscreen' : 'View fullscreen'}
            title={isFs ? 'Exit fullscreen' : 'View fullscreen'}
            // Mobile hides the fullscreen button: the PDF viewer's own
            // pinch/zoom gestures are the mobile interaction; the
            // floating button would only cover the page.
            className="hidden lg:inline-flex absolute top-4 right-12 z-10 items-center justify-center w-9 h-9 rounded-full bg-zinc-900/85 dark:bg-white/90 text-white dark:text-zinc-900 backdrop-blur hover:bg-zinc-900 dark:hover:bg-white transition-colors shadow-lg ring-1 ring-white/10"
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
    </div>
  );
}
