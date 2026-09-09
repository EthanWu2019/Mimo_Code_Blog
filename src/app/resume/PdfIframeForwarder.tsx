'use client';

import { useCallback, useRef } from 'react';

/**
 * PDF iframe with a transparent overlay that bridges mouse events back
 * to the parent document so the global cursor dot keeps tracking.
 *
 * Why an overlay (not a contentDocument listener):
 *   - The global cursor dot listens for 'mousemove' on `document` and
 *     reads `e.clientX/Y` to position itself.
 *   - HTML spec: when the cursor is over an <iframe>, the parent
 *     document does NOT receive mousemove events. They are owned by
 *     the document inside the iframe.
 *   - Chrome's PDF viewer is a sandboxed PDFium surface whose
 *     contentDocument appears as 'about:blank' from the parent's
 *     view. Listening on the iframe's contentDocument catches
 *     'about:blank' events, not real PDF-internal mouse moves.
 *   - The previous attempt injected a listener into the iframe's
 *     contentDocument. It didn't fire reliably — the PDF renders in a
 *     shadow root inside Chrome's PDFium, and mouse events go to the
 *     shadow root, not the contentDocument. The cursor dot stayed
 *     frozen at its last position outside the PDF.
 *
 *   This fix: cover the iframe with a transparent overlay that has
 *   'pointer-events: auto'. The overlay's onMouseMove fires on every
 *   mouse move over the iframe area. The handler dispatches a
 *   synthetic 'mousemove' MouseEvent on the parent document with
 *   the same clientX/clientY. CursorGlow's existing document-level
 *   handler reads those and moves the dot.
 *
 * Trade-off: the overlay captures wheel / click / drag / text-select
 * events before they reach the PDF viewer, so scroll / zoom / select
 * are disabled in the preview. The user can hit the Download PDF
 * button to read the file locally with a real PDF reader. This
 * trade-off matches the user's previous design direction when the
 * same choice was discussed.
 *
 * CursorGlow is untouched.
 */
export default function PdfIframeForwarder({
  isAdmin,
  src,
}: {
  isAdmin: boolean;
  src: string;
}) {
  // Dispatch a synthetic 'mousemove' MouseEvent on the parent document.
  // CursorGlow's existing handler reads e.clientX/Y and moves the dot.
  const forward = useCallback((clientX: number, clientY: number) => {
    document.dispatchEvent(
      new MouseEvent('mousemove', {
        clientX,
        clientY,
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
          // Single-page A4 / letter sheet @ 96 DPI is 816 x 1056 px.
          // The user wants the PDF to display in full with no internal
          // scrollbar. We size the iframe to a value comfortably above
          // the page height (1120 px) and let the surrounding page scroll
          // if the viewport is shorter than that. 100dvh - 360px fell
          // about 200 px short on a 1080p screen, which is exactly the
          // kind of internal scrollbar the user reported.
          height: '1120px',
          width: '100%',
          maxWidth: '816px',
          margin: '0 auto',
          display: 'block',
          border: 0,
        }}
      />
      {/*
        Transparent overlay that captures mouse events on the iframe
        area. Sits at z-2 (above iframe content but below the global
        CursorGlow dot at z-201, so the dot still draws on top).
        'pointer-events: auto' is required to receive mousemove here.
      */}
      <div
        aria-hidden
        onMouseMove={(e) => forward(e.clientX, e.clientY)}
        className="absolute inset-0"
        style={{ zIndex: 2 }}
      />
    </div>
  );
}
