'use client';

import { useCallback, useRef } from 'react';

/**
 * PDF iframe that bridges mouse events from the iframe back to the parent
 * document so the global CursorGlow dot keeps tracking across the
 * preview region.
 *
 * Why this exists:
 *   - The global cursor dot listens for `mousemove` on `document` and
 *     reads `e.clientX/Y` to position itself.
 *   - HTML spec: when the cursor is over an iframe, the parent document
 *     does NOT receive mousemove events. The events are owned by the
 *     document inside the iframe.
 *   - So without help, the dot freezes while the cursor is over our
 *     PDF preview. This component forwards iframe-internal mousemove to
 *     the parent document so CursorGlow's existing handler continues to
 *     receive coordinates and moves the dot.
 *
 * We dispatch a synthetic `mousemove` event on `document` with the iframe-
 * relative coordinates projected to the viewport. CursorGlow's existing
 * handler reads `e.clientX/Y` exactly the way we provide, so its I-beam
 * morph / colour-decide / press-scale logic continues to work without
 * any modification.
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

  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLIFrameElement>) => {
      document.dispatchEvent(
        new MouseEvent('mousemove', {
          clientX: e.clientX,
          clientY: e.clientY,
          bubbles: true,
        })
      );
    },
    []
  );

  return (
    <div className="relative isolate" style={{ zIndex: 0 }}>
      <iframe
        ref={ref}
        key={isAdmin ? 'admin' : 'guest'}
        src={src}
        title="Ethan Wu — Resume"
        className="w-full"
        onMouseMove={handleMove}
        style={{
          height: 'calc(100dvh - 360px)',
          minHeight: 720,
          border: 0,
        }}
      />
    </div>
  );
}
