'use client';

/**
 * Plain PDF iframe. No wrapper card, no overlay, no decoration.
 *
 * The PDF renders as it would in any browser: the user can scroll,
 * zoom, drag, right-click, and use Chrome's built-in PDF viewer
 * toolbar (download / print / rotate / find) directly inside the
 * frame. The only thing attached to this component is the
 * fullscreen toggle that lives on the parent wrapper.
 *
 * Earlier versions of this file put a transparent div on top of the
 * iframe to forward `mousemove` events to the parent document so the
 * global cursor dot would track across the PDF area. That overlay
 * captured all pointer events — click, wheel, drag, text-select —
 * making the PDF preview inert. The owner flagged this directly:
 * the PDF should just be a PDF, no overlay chrome. The cursor dot
 * now stops at the iframe boundary, which is the same behaviour any
 * browser exhibits when an iframe swallows pointer events; it is not
 * worth breaking the PDF reader to fix.
 */
export default function PdfIframeForwarder({
  src,
}: {
  isAdmin: boolean;
  src: string;
}) {
  return (
    <iframe
      src={src}
      title="Ethan Wu — Resume"
      className="w-full bg-white dark:bg-zinc-950"
      style={{
        // Single-page A4 / letter sheet @ 96 DPI is 816 x 1056 px.
        // The iframe is sized to comfortably cover the page height so
        // the surrounding page scrolls instead of an internal PDF
        // scrollbar appearing.
        height: '1120px',
        width: '100%',
        maxWidth: '816px',
        margin: '0 auto',
        display: 'block',
        border: 0,
      }}
    />
  );
}
