'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * PDF preview block.
 *
 * Desktop interaction model (the part the owner flagged):
 *   - Ctrl + mouse-wheel over the PDF is intercepted. The default
 *     browser zoom is too coarse (each click is ~10%) and stacks
 *     with the natural Letter aspect ratio of the iframe to make
 *     the content jump between 70% and 130% with a single notch.
 *   - We instead apply a smooth CSS transform: scale (1 + deltaY *
 *     0.0015) per wheel tick, clamped to [0.4, 3.0], and stop the
 *     page's natural zoom by preventDefault().
 *   - The iframe's src `zoom` parameter is NOT touched (changing it
 *     would re-render the PDF and reset the user's scroll position).
 *     Only the wrapper element's `transform: scale()` changes; the
 *     PDF content stays at its native resolution underneath.
 *   - A small floating toolbar (top-right) shows the current scale
 *     and offers + / − / reset / fullscreen, so the user has a
 *     controlled way back to fit-to-width after exploring.
 *
 * Mobile interaction model (unchanged from v6):
 *   - iframe is h-[80dvh], pinch zoom + drag pan owned by the browser's
 *     built-in PDF viewer.
 *
 * Cursor dot suppression: data-cursor-suppress on the wrapper hides
 * the global CursorGlow when the user hovers the PDF.
 */

const MIN_SCALE = 0.4;
const MAX_SCALE = 3.0;
const STEP = 0.0015; // wheel deltaY * STEP added to scale per tick

export default function PdfSection({
  isAdmin,
  src,
}: {
  isAdmin: boolean;
  src: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const [isFs, setIsFs] = useState(false);
  const [canFullscreen, setCanFullscreen] = useState(false);
  const [scale, setScale] = useState(1);
  // Pulse the toolbar so the user can see the new scale briefly after
  // a zoom gesture, even on a desktop where the cursor isn't on
  // the page. The toolbar is shown whenever scale !== 1, plus for a
  // short window after each ctrl-wheel event.
  const [showUi, setShowUi] = useState(false);
  const uiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect feature support on mount
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

  // Briefly show the toolbar after a zoom event so the new scale
  // number is legible. Pin the toolbar for as long as scale !== 1.
  useEffect(() => {
    if (uiTimer.current) clearTimeout(uiTimer.current);
    if (scale !== 1) {
      setShowUi(true);
    } else {
      uiTimer.current = setTimeout(() => setShowUi(false), 900);
    }
    return () => {
      if (uiTimer.current) clearTimeout(uiTimer.current);
    };
  }, [scale]);

  // Wheel-zoom handler. Bound to the PDF frame wrapper, not the
  // document — zoom only fires while the cursor is over the
  // resume, so scrolling the rest of the page is unaffected.
  const onWheel = useCallback((e: WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return; // let normal scroll through
    e.preventDefault();
    setScale((prev) => {
      const next = prev * (1 - e.deltaY * STEP);
      return Math.max(MIN_SCALE, Math.min(MAX_SCALE, next));
    });
  }, []);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    // passive: false is required for preventDefault on wheel.
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

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
      console.warn('[PdfSection] fullscreen request failed', e);
    }
  }, []);

  const setScaleClamped = (v: number) =>
    setScale(Math.max(MIN_SCALE, Math.min(MAX_SCALE, v)));

  const uiVisible = showUi || scale !== 1;

  return (
    <div
      ref={wrapRef}
      data-cursor-suppress="5"
      className="relative bg-zinc-100 dark:bg-zinc-950"
    >
      {/* Mobile-only hint */}
      <p className="lg:hidden mb-2 text-center text-[11px] uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
        Pinch to zoom · drag to move
      </p>

      {/* Desktop-only hint when the user hasn't started zooming yet */}
      <p className="hidden lg:block mb-2 text-center text-[11px] uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
        Ctrl + scroll to zoom
      </p>

      {/* Outer relative wrapper. transform: scale() does the actual
          zoom; transform-origin: top center keeps the top of the PDF
          pinned while the user scales (the bottom grows downward, so
          they can read the header without scrolling up to find it). */}
      <div
        className="relative mx-auto"
        style={{ width: '100%', maxWidth: '816px' }}
      >
        <div
          ref={frameRef}
          // The wheel handler is attached to this element (not the
          // iframe) so the document doesn't get a default browser
          // zoom. CSS touch-action: pan-y lets a touch user drag the
          // PDF vertically; horizontal drag is also allowed so the
          // iframe's own scroll can take it.
          className="relative w-full overflow-auto touch-pan-y lg:touch-auto"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            transition: 'transform 0.06s linear',
            // When the iframe is scaled past 1, the wrapper's
            // content area grows. Make sure the parent doesn't clip
            // it — the page already has its own scroll on the
            // body for that.
            height: 'auto',
          }}
        >
          <div
            className="relative mx-auto"
            style={{
              width: '100%',
              maxWidth: '816px',
            }}
          >
            <iframe
              src={`${src}#navpanes=0&toolbar=${isFs ? 1 : 0}&view=FitH&zoom=80`}
              title="Ethan Wu — Resume"
              className="block w-full h-[80dvh] lg:h-auto lg:aspect-[8.5/11] bg-white dark:bg-zinc-950"
              style={{ border: 0 }}
            />
          </div>
        </div>

        {/* Desktop-only floating zoom toolbar. Visible briefly after
            a zoom event, persistent when scale ≠ 1. The bar uses
            an opacity transition so it fades in/out without snapping. */}
        <div
          className={`hidden lg:flex absolute top-3 right-3 z-10 items-center gap-1.5 rounded-full bg-zinc-900/85 dark:bg-white/90 text-white dark:text-zinc-900 backdrop-blur shadow-lg ring-1 ring-white/10 transition-opacity duration-200 px-1.5 py-1 ${
            uiVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <button
            type="button"
            onClick={() => setScaleClamped(scale - 0.2)}
            aria-label="Zoom out"
            className="w-8 h-8 rounded-full hover:bg-white/10 dark:hover:bg-zinc-900/10 flex items-center justify-center text-base font-medium"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => setScale(1)}
            aria-label="Reset zoom"
            className="px-2.5 h-8 rounded-full hover:bg-white/10 dark:hover:bg-zinc-900/10 flex items-center justify-center text-[11px] font-mono tabular-nums min-w-[3.5rem]"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            type="button"
            onClick={() => setScaleClamped(scale + 0.2)}
            aria-label="Zoom in"
            className="w-8 h-8 rounded-full hover:bg-white/10 dark:hover:bg-zinc-900/10 flex items-center justify-center text-base font-medium"
          >
            +
          </button>
          {canFullscreen && (
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFs ? 'Exit fullscreen' : 'View fullscreen'}
              title={isFs ? 'Exit fullscreen' : 'View fullscreen'}
              className="w-8 h-8 rounded-full hover:bg-white/10 dark:hover:bg-zinc-900/10 flex items-center justify-center"
            >
              {isFs ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4H4v5h5M15 9V4h5v5h-5M9 15v5H4v-5h5M15 15v5h5v-5h-5" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
