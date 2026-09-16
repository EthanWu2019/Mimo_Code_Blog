'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * PDF preview block.
 *
 * Desktop interaction model:
 *   - Ctrl + mouse-wheel over the PDF is intercepted. The default
 *     browser zoom is too coarse (~10% per notch) and stacks with
 *     the Letter aspect ratio of the iframe so a single tick
 *     visibly jumps the resume between two extreme sizes. We
 *     instead apply a smooth CSS transform: scale (1 - deltaY *
 *     STEP) per wheel tick, where STEP is 0.0004 (~0.5% per tick,
 *     four times finer than the previous version). Clamped to
 *     [0.4, 3.0].
 *   - PDF is NOT re-rendered, so the user's scroll position inside
 *     the document is preserved across zoom gestures.
 *   - Drag to pan: mousedown on the PDF switches the wrapper's
 *     transform-origin to the cursor position and starts tracking
 *     pointer movement, applying a translate(offsetX, offsetY)
 *     delta per frame. The cursor is `grab` on hover and
 *     `grabbing` while dragging. While dragging the iframe is
 *     pointer-event-none so its own scrollbar doesn't fight the
 *     pan. Releasing the mouse leaves the pan in place (subsequent
 *     zoom gestures keep the pan offset).
 *   - Floating zoom toolbar (top-right, desktop only, hidden when
 *     scale = 1). Buttons: − (zoom out 10%), percent (reset),
 *     + (zoom in 10%), fullscreen.
 *   - Step 0.1 (≈10%) per click on +/-, with the wheel giving
 *     the finer 0.5% per notch for precision.
 *
 * Mobile interaction model (unchanged):
 *   - iframe is h-[80dvh], pinch zoom + drag pan owned by the
 *     browser's built-in PDF viewer.
 *
 * Cursor dot suppression: data-cursor-suppress on the wrapper
 * hides the global CursorGlow when the user hovers the PDF, and
 * the wrapper itself uses cursor: grab/grabbing so the system
 * arrow is replaced with the proper hand cursor on the PDF.
 */

const MIN_SCALE = 0.4;
const MAX_SCALE = 3.0;
// ~0.5% per wheel tick — small enough to feel smooth, large
// enough to make a clear difference with each notch.
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
  const frameRef = useRef<HTMLDivElement>(null);

  const [isFs, setIsFs] = useState(false);
  const [canFullscreen, setCanFullscreen] = useState(false);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [grabbing, setGrabbing] = useState(false);
  // Show the floating zoom toolbar briefly after a zoom gesture or
  // while the user is dragging the PDF around. Hidden when scale=1,
  // no recent gesture, and not dragging.
  const [showUi, setShowUi] = useState(false);
  const uiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect fullscreen support on mount
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

  // Briefly show the toolbar after a zoom event or pan so the
  // new scale / position is legible. Pin it when scale != 1.
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

  // ---- Wheel zoom ----
  // Bound to the PDF frame wrapper, not the document, so zoom only
  // fires while the cursor is over the resume. preventDefault() kills
  // the browser's native Ctrl+wheel page zoom.
  const onWheel = useCallback((e: WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return; // let normal scroll through
    e.preventDefault();
    setScale((prev) => {
      const next = prev * (1 - e.deltaY * WHEEL_STEP);
      return Math.max(MIN_SCALE, Math.min(MAX_SCALE, next));
    });
  }, []);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  // ---- Drag to pan ----
  // Track the cursor relative to the wrapper's top-left, so that
  // transform-origin can be set to the exact click point. While
  // dragging we apply a translate transform on the inner div in
  // addition to the scale.
  const panRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    pointerId: -1,
  });

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Only middle-click or primary click drags. Primary is fine on
    // touch. Right-click keeps the browser's context menu.
    if (e.button !== 0 && e.button !== 1) return;
    // Don't initiate a pan if the user is ctrl+wheel-ing; the
    // wheel handler will fire.
    if (e.ctrlKey || e.metaKey) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    panRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      originX: e.clientX - rect.left,
      originY: e.clientY - rect.top,
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
    const dx = e.clientX - panRef.current.startX;
    const dy = e.clientY - panRef.current.startY;
    setPan({
      x: panRef.current.originX - (panRef.current.originX - dx),
      y: panRef.current.originY - (panRef.current.originY - dy),
    });
    // Easier: anchor the origin at the click point by setting
    // transform-origin dynamically. We compute it on every move.
    setPan((prev) => ({
      x: panRef.current.originX - (e.clientX - panRef.current.startX),
      y: panRef.current.originY - (e.clientY - panRef.current.startY),
    }));
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
      // Safari iOS sometimes throws on release; ignore.
    }
  }, []);

  // Reset pan to 0/0 in addition to scale.
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

  // The combined transform is scale + translate. We pre-build it as a
  // string so React doesn't re-create the style object every render.
  const transform = `scale(${scale}) translate3d(${pan.x}px, ${pan.y}px, 0)`;

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
      <p className="hidden md:block mb-2 text-center text-[11px] uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
        Ctrl + scroll to zoom · drag to pan
      </p>

      {/* Outer relative wrapper. transform: scale() does the actual
          zoom; transform-origin: top center keeps the top of the PDF
          pinned while the user scales (the bottom grows downward).
          The translate3d applies the drag-pan offset. We use 3d
          instead of plain translate because some browsers won't
          composite a 2d transform alongside the scale transform. */}
      <div
        className="relative mx-auto"
        style={{ width: '100%', maxWidth: '816px' }}
      >
        <div
          ref={frameRef}
          // The wheel handler is attached to this element (not the
          // iframe) so the document doesn't get a default browser
          // zoom. CSS touch-action: none on lg+ so the browser's own
          // scroll behavior doesn't fight our pointer-drag panning.
          // cursor: grab / grabbing overrides the system arrow with a
          // proper hand cursor.
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={`relative w-full overflow-auto touch-pan-y ${
            grabbing
              ? 'cursor-grabbing'
              : 'lg:cursor-grab lg:hover:cursor-grab'
          } lg:touch-auto select-none`}
          style={{
            transform,
            transformOrigin: 'top center',
            transition: 'transform 0.06s linear',
            // While dragging, stop the iframe from stealing wheel/click
            // events so the user can pan past its scrollbar.
            pointerEvents: 'auto',
          }}
        >
          {/* An invisible overlay above the iframe ONLY while
              dragging. This is how we keep the iframe from intercepting
              the rest of the pointer moves once the drag starts. */}
          {grabbing && (
            <div
              aria-hidden
              className="absolute inset-0 z-10"
              style={{ pointerEvents: 'auto' }}
            />
          )}

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
              // Disable iframe pointer events while the user is
              // panning the wrapper. Without this the iframe's own
              // scroll handlers can fight ours.
              style={{
                border: 0,
                pointerEvents: grabbing ? 'none' : 'auto',
              }}
            />
          </div>
        </div>

        {/* Floating zoom toolbar. Hidden on the narrowest screens
            (we show it on md+ — 768px and up — so the fullscreen
            button is back on iPad and not just desktop). Visible
            briefly after a zoom / pan gesture, persistent when
            scale != 1. */}
        <div
          className={`hidden md:flex absolute top-3 right-3 z-10 items-center gap-1.5 rounded-full bg-zinc-900/85 dark:bg-white/90 text-white dark:text-zinc-900 backdrop-blur shadow-lg ring-1 ring-white/10 transition-opacity duration-200 px-1.5 py-1 ${
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
