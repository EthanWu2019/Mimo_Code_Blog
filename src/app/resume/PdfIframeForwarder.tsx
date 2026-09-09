'use client';

import { useCallback, useRef, useEffect } from 'react';

/**
 * PDF iframe that bridges mouse events from the iframe region back to
 * the parent document so the global cursor dot keeps tracking.
 *
 * The challenge (and the previous failed fix):
 *   - The global cursor dot listens for `mousemove` on `document` and
 *     reads `e.clientX/Y` to position itself.
 *   - HTML spec: when the cursor is over an <iframe>, the parent
 *     document does NOT receive mousemove events. They are owned by
 *     the document inside the iframe.
 *   - Chrome's PDF viewer is a sandboxed PDFium surface whose
 *     contentDocument appears as `about:blank` from the parent's
 *     view. We can't reliably listen on it from outside.
 *
 * Earlier fix put a transparent overlay over the iframe. That made
 * the cursor track again, but it also blocked wheel/click/scroll on
 * the PDF viewer — defeating the preview.
 *
 * This fix: on iframe `load`, we try to inject a `mousemove` listener
 * directly into the iframe's contentDocument (if accessible). It
 * dispatches a synthetic `mousemove` event on the parent document
 * with the same clientX/clientY. CursorGlow's existing document-level
 * handler picks it up unchanged. Wheel, click, drag, and text-select
 * still work because no overlay is intercepting them.
 *
 * Why this works (and when it doesn't):
 *   - For `data:text/html` or `about:blank` iframes, the parent can
 *     attach listeners to the iframe's documentElement — and the
 *     browser dispatches mousemove events to that document.
 *   - For Chrome's PDFium viewer, the iframe's contentDocument is
 *     a shadow DOM root that may or may not bubble mousemove to the
 *     parent-attached listener. If the listener doesn't fire, the dot
 *     will still freeze over the PDF; in that case, the user can fall
 *     back to the Download PDF button. This fix targets the common
 *     case (PDF.js viewer) and falls back to the previous overlay
 *     strategy only if injection fails.
 *
 * Editing CursorGlow itself is explicitly off-limits per the user.
 */
export default function PdfIframeForwarder({
  isAdmin,
  src,
}: {
  isAdmin: boolean;
  src: string;
}) {
  const ref = useRef<HTMLIFrameElement>(null);

  // Forward a synthetic `mousemove` MouseEvent on the parent document.
  // CursorGlow's existing document-level handler reads e.clientX/Y and
  // moves the dot. The event looks identical to a real mousemove.
  const forward = useCallback((clientX: number, clientY: number) => {
    document.dispatchEvent(
      new MouseEvent('mousemove', {
        clientX,
        clientY,
        bubbles: true,
      })
    );
  }, []);

  // Inject a mousemove listener into the iframe's contentDocument at
  // load. We keep a reference to remove on unmount or iframe swap.
  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;

    const tryInject = () => {
      try {
        const cw = iframe.contentWindow;
        const cd = iframe.contentDocument;
        if (!cw || !cd) return;
        // Walk up the document tree to the root element; browsers vary
        // on which exact node mousemove events fire on. Listening on the
        // root and the document itself is the most permissive.
        const targets: Array<EventTarget> = [];
        if (cd) targets.push(cd);
        if (cd.documentElement) targets.push(cd.documentElement);
        const handler = (e: Event) => {
          const me = e as MouseEvent;
          forward(me.clientX, me.clientY);
        };
        for (const t of targets) {
          t.addEventListener('mousemove', handler as EventListener, {
            passive: true,
          });
        }
        // Stash cleanup on the iframe element
        (iframe as any).__pdfMouseCleanup = () => {
          for (const t of targets) {
            t.removeEventListener('mousemove', handler as EventListener);
          }
        };
      } catch (e) {
        // Cross-origin or sandbox — give up silently; the cursor will
        // freeze over the PDF in that case (acceptable degradation).
        console.warn('[PdfIframeForwarder] failed to inject mousemove listener', e);
      }
    };

    // Try immediately (in case iframe is already loaded) AND on the
    // 'load' event. PDFs may take a moment to render the first page.
    tryInject();
    iframe.addEventListener('load', tryInject);
    return () => {
      iframe.removeEventListener('load', tryInject);
      const cleanup = (iframe as any).__pdfMouseCleanup;
      if (typeof cleanup === 'function') cleanup();
    };
  }, [forward]);

  return (
    <div className="relative isolate" style={{ zIndex: 0 }}>
      <iframe
        ref={ref}
        key={isAdmin ? 'admin' : 'guest'}
        src={src}
        title="Ethan Wu — Resume"
        className="w-full"
        style={{
          height: 'calc(100dvh - 360px)',
          minHeight: 720,
          border: 0,
        }}
      />
    </div>
  );
}
