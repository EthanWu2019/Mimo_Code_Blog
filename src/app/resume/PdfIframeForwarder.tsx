'use client';

import { useCallback, useRef } from 'react';

/**
 * PDF iframe that bridges mouse events from the iframe region back to
 * the parent document so the global cursor dot keeps tracking across
 * the preview.
 *
 * Why this is a separate component:
 *   - The global cursor dot listens for `mousemove` on `document` and
 *     reads `e.clientX/Y` to position itself.
 *   - HTML spec: when the cursor is over an <iframe>, the parent
 *     document does NOT receive mousemove events. The events are owned
 *     by the document inside the iframe. So the dot freezes while the
 *     cursor is over our PDF preview.
 *   - Chrome's PDF viewer is a sandboxed PDFium surface whose
 *     contentDocument is `about:blank` from the parent's view. We
 *     can't reach in to attach listeners.
 *
 * Fix: place a transparent overlay div on top of the iframe. The overlay
 * has `pointer-events: auto` (it captures mouse events) and `z-index: 2`
 * (above the iframe). The overlay forwards `mousemove` to the parent
 * document by dispatching a synthetic `MouseEvent('mousemove', …)`.
 * CursorGlow's existing document-level handler reads `e.clientX/Y` and
 * moves the dot — no change to CursorGlow needed.
 *
 * Trade-off: the overlay steals mouse events from the PDF viewer, so
 * scroll/zoom/text-select are disabled in the preview. The user views
 * the PDF in the preview but uses the Download PDF button to read it
 * locally with a real PDF reader. Acceptable per the user's design
 * direction.
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
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    document.dispatchEvent(
      new MouseEvent('mousemove', {
        clientX: e.clientX,
        clientY: e.clientY,
        bubbles: true,
      })
    );
  }, []);

  return (
    <div className="relative isolate" style={{ zIndex: 0 }}>
      <iframe
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
      {/*
        Transparent overlay that captures mouse events over the iframe
        region. Sits at z-2 (above iframe content but below the global
        CursorGlow dot at z-201, so the dot still draws on top). Has
        `pointer-events: auto` so the cursor's mousemove fires here
        instead of being absorbed by the PDF viewer's shadow DOM.
      */}
      <div
        aria-hidden
        onMouseMove={handleMove}
        className="absolute inset-0"
        style={{ zIndex: 2 }}
      />
    </div>
  );
}
