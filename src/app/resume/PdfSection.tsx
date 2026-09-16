'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * PDF preview block.
 *
 * Why this is wrapped in a transparent always-on top layer:
 *   - The PDF is served inside an iframe. mousedown on the iframe
 *     starts a text-selection there and the event does NOT bubble
 *     past the iframe's edge — so we can't catch it on a parent
 *     div. The classic fix is a transparent absolutely-positioned
 *     <div> stacked on top of the iframe that absorbs pointer
 *     events; pointer events on that layer are then driven by
 *     our React state.
 *   - The owner wants to drag the PDF around (not select text) and
 *     zoom with Ctrl + wheel. With the overlay capturing pointer
 *     events, we control the entire interaction and the iframe's
 *     own event handlers never run.
 *   - The overlay is invisible (background: transparent) and
 *     pointer-events: auto. The iframe stays as a visual layer
 *     underneath; we never disable its visibility, just intercept
 *     the events.
 *
 * Cursor dot suppression: data-cursor-suppress on the outer
 * wrapper hides the global CursorGlow when the user hovers the
 * PDF, and the overlay itself uses cursor: grab / grabbing.
 */

const MIN_SCALE = 0.4;
const MAX_SCALE = 3.0;
// ~0.5% per wheel tick. The owner found 1.5% per tick (the prior
// version) still jumped. 0.5% is the smallest unit that still
// gives a perceptible change with each notch.
const WHEEL_STEP = 0.0004;
// 10% per click on the + / − toolbar buttons.
const BUTTON_STEP = 0.1;

export default function PdfSection({
  isAdmin,
  src,
}: {
  isAdmin: boolean;
  src: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const [isFs, setIsFs] = useState(false);
  const [canFullscreen, setCanFullscreen] = useState(false);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [grabbing, setGrabbing] = useState(false);
  // Show the floating zoom toolbar briefly after a zoom event or
  // pan so the new scale / position is legible. Pin when scale != 1.
  const [showUi, setShowUi] = useState(false);
  const uiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    if (uiTimer.current) clearTimeout(uiTimer.current);
    if (scale !== 1 || pan.x !== 0 || pan.y !== 0) {
      setShowUi(true);
    } else {
      uiTimer.current = setTimeout(() => setShowUi(false), 900);
    }
    return () => {
      if (uiTimer.current) clearTimeout(uiTimer.current);
    };
  }, [scale, pan.x, pan.y]);

  // All interaction handlers are bound to overlayRef (the
  // transparent top layer), not the iframe. This is the difference
  // that makes the controls actually work: the iframe swallows its
  // own events, so listeners on the iframe's parents never see
  // them. By sitting ON TOP of the iframe (z-10 vs the iframe's
  // implicit z-0), this overlay is the first to receive every
  // pointer event.
  const onWheel = useCallback((e: WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return; // let normal scroll through
    e.preventDefault();
    setScale((prev) => {
      const next = prev * (1 - e.deltaY * WHEEL_STEP);
      return Math.max(MIN_SCALE, Math.min(MAX_SCALE, next));
    });
  }, []);

  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  // Drag-to-pan. Tracks the cursor from mousedown onward, applies
  // the delta as a translate on the inner element via state. We use
  // PointerCapture so the drag continues even if the cursor leaves
  // the wrapper area.
  const panRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    pointerId: -1,
  });

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.button !== 1) return;
    if (e.ctrlKey || e.metaKey) return;
    e.preventDefault();
    panRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      pointerId: e.pointerId,
    };
    setGrabbing(true);
    setShowUi(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!panRef.current.active) return;
    if (e.pointerId !== panRef.current.pointerId) return;
    e.preventDefault();
    setPan({
      x: e.clientX - panRef.current.startX,
      y: e.clientY - panRef.current.startY,
    });
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!panRef.current.active) return;
    if (e.pointerId !== panRef.current.pointerId) return;
    e.preventDefault();
    panRef.current.active = false;
    setGrabbing(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // iOS Safari can throw on releasePointerCapture; ignore.
    }
  }, []);

  const resetView = useCallback(() => {
    setScale(1);
    setPan({ x: 0, y: 0 });
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
      console.warn('[PdfSection] fullscreen request failed', e);
    }
  }, []);

  const setScaleClamped = (v: number) =>
    setScale(Math.max(MIN_SCALE, Math.min(MAX_SCALE, v)));

  const uiVisible = showUi || scale !== 1 || pan.x !== 0 || pan.y !== 0;
  const transform = `scale(${scale}) translate3d(${pan.x}px, ${pan.y}px, 0)`;

  return (
    <div
      ref={wrapRef}
      data-cursor-suppress="5"
      className="relative bg-zinc-100 dark:bg-zinc-950"
    >
      <p className="lg:hidden mb-2 text-center text-[11px] uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
        Pinch to zoom · drag to move
      </p>
      <p className="hidden md:block mb-2 text-center text-[11px] uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
        Ctrl + scroll to zoom · drag to pan
      </p>

      {/* The PDF + its transparent event-absorbing overlay share a
          common wrapper. The iframe paints the document; the overlay
          sits on top (z-10) and intercepts every pointer event so
          our wheel + drag handlers always run. */}
      <div
        className="relative mx-auto"
        style={{ width: '100%', maxWidth: '816px' }}
      >
        <div
          className="relative"
          // The wrapper itself is the visual / transform target. The
          // transform combines scale and translate so a single CSS
          // property covers both zoom and pan.
          style={{
            transform,
            transformOrigin: 'top center',
            transition: 'transform 0.06s linear',
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
              // z-0 so the overlay always wins the click target.
              className="block w-full h-[80dvh] lg:h-auto lg:aspect-[8.5/11] bg-white dark:bg-zinc-950 relative z-0"
              style={{ border: 0 }}
            />
          </div>

          {/* The event-absorbing overlay. Sits on top of the iframe
              at z-10. We give it cursor: grab / grabbing so the user
              has a visual hint that the area is interactive. The
              overlay is fully transparent — invisible, but it
              intercepts every pointer event so wheel + pointerdown
              + pointermove + pointerup handlers can drive our state
              without competing with the iframe's own. */}
          <div
            ref={overlayRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onWheel={onWheel as unknown as React.WheelEventHandler<HTMLDivElement>}
            className={`absolute inset-0 z-10 ${
              grabbing ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          />
        </div>

        <div
          className={`hidden md:flex absolute top-3 right-3 z-20 items-center gap-1.5 rounded-full bg-zinc-900/85 dark:bg-white/90 text-white dark:text-zinc-900 backdrop-blur shadow-lg ring-1 ring-white/10 transition-opacity duration-200 px-1.5 py-1 ${
            uiVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <button
            type="button"
            onClick={() => setScaleClamped(scale - BUTTON_STEP)}
            aria-label="Zoom out"
            className="w-8 h-8 rounded-full hover:bg-white/10 dark:hover:bg-zinc-900/10 flex items-center justify-center text-base font-medium"
          >
            −
          </button>
          <button
            type="button"
            onClick={resetView}
            aria-label="Reset zoom and pan"
            className="px-2.5 h-8 rounded-full hover:bg-white/10 dark:hover:bg-zinc-900/10 flex items-center justify-center text-[11px] font-mono tabular-nums min-w-[3.5rem]"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            type="button"
            onClick={() => setScaleClamped(scale + BUTTON_STEP)}
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
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 9V4H4v5h5M15 9V4h5v5h-5M9 15v5H4v-5h5M15 15v5h5v-5h-5"
                  />
                </svg>
              ) : (
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"
                  />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
