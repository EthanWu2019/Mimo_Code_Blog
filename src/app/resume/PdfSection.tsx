'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * PDF preview block.
 *
 * Design intent: the user must be able to read the PDF, select
 * text (the resume contains the visitor's name and the work history
 * — copy/paste is a real use case), zoom in fine detail, and pan
 * across a zoomed-in page. None of those interactions should
 * interfere with the others:
 *
 *  - Wheel:     Ctrl+wheel scales the PDF (~0.5% per tick). Plain
 *               wheel (no Ctrl) scrolls the page normally. The
 *               browser's native PDF-viewer pinch zoom is left alone.
 *  - Drag:      Pointerdown on the PDF starts an in-place scroll.
 *               The PDF is rendered into an `overflow: auto` frame
 *               so dragging moves the *scroll position*, not the
 *               document itself — like Chrome's own PDF viewer.
 *               Text selection is preserved (mousedown on the iframe
 *               is delivered to the iframe first; we only start our
 *               own drag if the user actually moves the pointer).
 *  - Cursor:    cursor: grab on hover, cursor: grabbing while
 *               dragging. The global CursorGlow dot is suppressed
 *               ONLY inside the PDF area, not the entire wrapper.
 *
 * Implementation note: an invisible overlay element is NOT used
 * here. The previous attempt installed one (z-10) to catch wheel +
 * pointerdown before the iframe grabbed them, but it had two bad
 * consequences:
 *  1. the overlay sat on top of the iframe and intercepted all
 *     pointer events, so text selection stopped working.
 *  2. the overlay was inset-0 of the inner wrapper, so it also
 *     stole wheel events — we couldn't reuse Chrome's native
 *     PDF-viewer pinch zoom either.
 * The right way: bind wheel + pointer handlers to the OUTER wrapper
 * div. They run when the event is dispatched to the wrapper. The
 * iframe's own handlers also run (events bubble up the DOM tree
 * too), and we call `stopPropagation` on wheel-with-ctrl and on
 * drag-pan so the iframe never zooms with its own viewer. Plain
 * wheel scrolls the page as expected.
 */

const MIN_SCALE = 0.5;
const MAX_SCALE = 3.0;
const WHEEL_STEP = 0.0006; // ~0.5% per tick on average browsers
const BUTTON_STEP = 0.1;
const DRAG_THRESHOLD_PX = 4; // start drag only after the cursor
                              // moves at least this far; smaller
                              // movements stay a text-selection click

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
  // Pan is implemented as a scrollLeft / scrollTop offset on the
  // inner frame div. We never translate the frame itself; translation
  // would pull the PDF text along with the cursor (which is what made
  // the previous version feel wrong to the owner).
  const [dragging, setDragging] = useState(false);

  const [uiVisible, setUiVisible] = useState(false);
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
    if (scale !== 1) {
      setUiVisible(true);
    } else {
      uiTimer.current = setTimeout(() => setUiVisible(false), 900);
    }
    return () => {
      if (uiTimer.current) clearTimeout(uiTimer.current);
    };
  }, [scale]);

  // --- Wheel zoom: bind to wrapper, not to the iframe. Browsers
  // bubble wheel events up the DOM, so our handler on the outer
  // wrapper fires for wheel-over-iframe AND wheel-over-frame. We
  // only intervene on Ctrl+wheel; plain wheel keeps scrolling the
  // page (and the iframe's native pinch zoom on a Mac trackpad).
  const onWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    e.stopPropagation();
    setScale((prev) => {
      const next = prev * (1 - e.deltaY * WHEEL_STEP);
      return Math.max(MIN_SCALE, Math.min(MAX_SCALE, next));
    });
  }, []);

  // --- Drag-to-pan (a scroll on the inner frame). We use a click-vs-
  // drag threshold so a single click without movement still leaves
  // the iframe's text-selection alone. We also call preventDefault on
  // the pointerdown ONLY when we're committing to a drag (i.e. once
  // the cursor moves past the threshold) so a simple click does
  // nothing. We never use stopPropagation on pointerdown: that would
  // block the iframe's own text-selection handlers.
  const dragState = useRef({
    active: false,
    pending: false, // mousedown received but not yet past threshold
    startX: 0,
    startY: 0,
    startScrollLeft: 0,
    startScrollTop: 0,
    pointerId: -1,
  });

  const tryStartDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.button !== 1) return;
    if (e.ctrlKey || e.metaKey) return;
    // We mark the gesture as pending. The first pointermove that
    // exceeds DRAG_THRESHOLD_PX will commit it and stop further
    // text-selection events.
    const target = e.currentTarget;
    dragState.current = {
      active: false,
      pending: true,
      startX: e.clientX,
      startY: e.clientY,
      startScrollLeft: target.scrollLeft,
      startScrollTop: target.scrollTop,
      pointerId: e.pointerId,
    };
    target.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const ds = dragState.current;
    if (!ds.pending || e.pointerId !== ds.pointerId) return;
    const dx = e.clientX - ds.startX;
    const dy = e.clientY - ds.startY;
    if (!ds.active && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
    if (!ds.active) {
      // Crossing the threshold: cancel the iframe's text selection
      // and commit to a drag.
      e.preventDefault();
      ds.active = true;
      setDragging(true);
    }
    const target = e.currentTarget;
    target.scrollLeft = ds.startScrollLeft - dx;
    target.scrollTop = ds.startScrollTop - dy;
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const ds = dragState.current;
    if (e.pointerId !== ds.pointerId) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // iOS Safari can throw on releasePointerCapture; ignore.
    }
    if (ds.active) {
      e.preventDefault();
      setDragging(false);
    }
    ds.pending = false;
    ds.active = false;
  }, []);

  const onPointerCancel = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const ds = dragState.current;
    if (e.pointerId !== ds.pointerId) return;
    if (ds.active) setDragging(false);
    ds.pending = false;
    ds.active = false;
  }, []);

  const resetView = useCallback(() => {
    setScale(1);
    const fr = frameRef.current;
    if (fr) {
      fr.scrollLeft = 0;
      fr.scrollTop = 0;
    }
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

  return (
    <div
      ref={wrapRef}
      // Cursor-suppression is intentionally NOT on the outer
      // wrapper; the wrapper itself takes up the full row and
      // suppressing the global CursorGlow over the entire area
      // makes the cursor feel missing. We only want the dot gone
      // over the actual PDF (the inner frame), which is what the
      // data attribute on the frame below is for.
      className="relative bg-zinc-100 dark:bg-zinc-950"
    >
      <p className="lg:hidden mb-2 text-center text-[11px] uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
        Pinch to zoom · drag to move
      </p>
      <p className="hidden md:block mb-2 text-center text-[11px] uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
        Ctrl + scroll to zoom · drag to pan · select text
      </p>

      {/* The OUTER relative wrapper. The frame below is the
          drag/zoom target. Wheel + pointer handlers are on this div
          (not on the iframe) so we control how they propagate to
          the iframe. */}
      <div
        className="relative mx-auto"
        style={{ width: '100%', maxWidth: '816px' }}
      >
        <div
          ref={frameRef}
          onWheel={onWheel}
          onPointerDown={tryStartDrag}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          // 5px pad so the suppress zone matches the inner frame
          // exactly, not the empty space around it.
          data-cursor-suppress="5"
          // The cursor + scrollable area. The iframe renders the
          // document, this div defines the viewport. transform: scale
          // zooms the visible area (the iframe + a bottom blank band
          // when the PDF is shorter than the viewport, all scaled
          // together). The iframe's own scrollbars are inside this
          // div's overflow box, so the user can scroll with the
          // iframe's own scrollbar or by dragging the area.
          className={`relative w-full overflow-auto touch-pan-y cursor-${
            dragging ? 'grabbing' : 'grab'
          } lg:hover:cursor-grab lg:touch-auto select-none`}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            transition: 'transform 0.06s linear',
            // When scale > 1 the content grows; ensure the parent
            // doesn't clip it.
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
            aria-label="Reset zoom and scroll"
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
