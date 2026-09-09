'use client';

import { useCallback, useRef, useEffect } from 'react';

/**
 * PDF iframe that bridges mouse events from the iframe region back to
 * the parent document so the global cursor dot keeps tracking.
 *
 * Background:
 *   - The global cursor dot listens for 'mousemove' on `document` and
 *     reads `e.clientX/Y` to position itself.
 *   - HTML spec: when the cursor is over an <iframe>, the parent
 *     document does NOT receive mousemove events. They are owned by
 *     the document inside the iframe.
 *   - Chrome's PDF viewer is a sandboxed PDFium surface whose
 *     contentDocument appears as `about:blank` from the parent's
 *     view, so we can't reliably listen on it from outside.
 *
 * The fix: on iframe 'load', try to inject a 'mousemove' listener
 * directly into the iframe's contentDocument at the documentElement
 * level. The handler dispatches a synthetic 'mousemove' MouseEvent on
 * the parent document. CRITICAL: the inner-event's `clientX/Y` is
 * relative to the iframe's viewport, not the parent window. We must
 * add the iframe element's bounding-rect offset (top + left) so the
 * parent's `e.clientX/Y` is in viewport (page) coordinates that
 * CursorGlow can place the dot at the right location. Without the
 * offset, the dot drifts to wherever the iframe is positioned
 * (typically top-left of the page) instead of following the cursor.
 *
 * If access to contentDocument fails (sandbox / cross-origin), the
 * handler is not installed and the cursor freezes over the PDF — a
 * graceful fallback.
 */
export default function PdfIframeForwarder({
  isAdmin,
  src,
}: {
  isAdmin: boolean;
  src: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Dispatch a synthetic 'mousemove' MouseEvent on the parent document
  // with the given viewport-relative coordinates. CursorGlow's existing
  // document-level handler reads e.clientX/Y and moves the dot.
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
  // load. Walk up to the documentElement and the document itself; the
  // exact node depends on the PDF viewer.
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const tryInject = () => {
      try {
        const cw = iframe.contentWindow;
        const cd = iframe.contentDocument;
        if (!cw || !cd) return;

        // Closure captures the live iframe element so we can read its
        // current bounding rect on every event (scroll moves the rect).
        const targets: Array<EventTarget> = [];
        if (cd) targets.push(cd);
        if (cd.documentElement) targets.push(cd.documentElement);

        const handler = (e: Event) => {
          const me = e as MouseEvent;
          const rect = iframe.getBoundingClientRect();
          // Translate iframe-viewport coords → page-viewport coords.
          forward(me.clientX + rect.left, me.clientY + rect.top);
        };

        for (const t of targets) {
          t.addEventListener('mousemove', handler as EventListener, {
            passive: true,
          });
        }
        (iframe as any).__pdfMouseCleanup = () => {
          for (const t of targets) {
            t.removeEventListener('mousemove', handler as EventListener);
          }
        };
      } catch (e) {
        console.warn('[PdfIframeForwarder] failed to inject mousemove listener', e);
      }
    };

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
        ref={iframeRef}
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
