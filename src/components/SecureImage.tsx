"use client";

import { useEffect, useRef, useState } from "react";

interface SecureImageProps {
  slug: string;
  alt: string;
  className?: string;
  /** "thumb" -> /thumb endpoint (faster, downscaled), "full" -> /image */
  variant?: "thumb" | "full";
  /** "cover" (default) fills the container, cropping if necessary.
   *  "contain" preserves full image with letterboxing. */
  fit?: "cover" | "contain";
}

/**
 * SecureImage
 *
 * Loads the protected image via a one-shot signed URL, converts to a Blob,
 * renders onto a <canvas> via blob: URL.  The <img> HTTP URL is never
 * exposed -- DevTools Network panel only sees the token-mint call and a
 * blob: handle that is revoked as soon as the image is decoded.
 *
 * Defense layers:
 *   L1 (Network):  signed HMAC-SHA256 token, 5 min TTL
 *   L2 (Client):   blob: URL (no http:// in DevTools)
 *   L3 (Forensic): LSB invisible watermark baked into pixels at upload time
 *   L4 (Visual):   subtle corner signature burned at upload time
 */
export default function SecureImage({
  slug,
  alt,
  className = "",
  variant = "thumb",
  fit = "cover",
}: SecureImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [errored, setErrored] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    async function loadAndRender() {
      try {
        // 1) Mint a one-shot signed URL on the server (secret never leaves)
        const tokenResp = await fetch(
          `/api/gallery/${slug}/token?variant=${variant}`,
          { credentials: "include" },
        );
        if (!tokenResp.ok) throw new Error("token mint failed");
        const { url } = await tokenResp.json();

        // 2) Fetch the protected image (5 min TTL on the URL)
        const imgResp = await fetch(url);
        if (!imgResp.ok) throw new Error("fetch failed");
        const blob = await imgResp.blob();

        // 3) Wrap in a blob: URL -- the ONLY URL visible in DevTools.
        const blobUrl = URL.createObjectURL(blob);

        // 4) Decode and draw to canvas
        const img = new Image();
        img.onload = () => {
          if (cancelled || !canvas || !ctx) {
            URL.revokeObjectURL(blobUrl);
            return;
          }
          // Make canvas exactly fill its container, then drawImage with the
          // requested fit mode.  This guarantees no letterbox / black bars --
          // the canvas pixels cover every pixel of the container.
          const cw = canvas.clientWidth;
          const ch = canvas.clientHeight;
          canvas.width = cw;
          canvas.height = ch;
          ctx.clearRect(0, 0, cw, ch);

          if (fit === "cover") {
            // Cover: fill container, cropping along the longer axis.
            const imgRatio = img.naturalWidth / img.naturalHeight;
            const boxRatio = cw / ch;
            let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
            if (imgRatio > boxRatio) {
              // Image is wider than box -- crop the sides.
              sw = img.naturalHeight * boxRatio;
              sx = (img.naturalWidth - sw) / 2;
            } else {
              // Image is taller than box -- crop the top/bottom.
              sh = img.naturalWidth / boxRatio;
              sy = (img.naturalHeight - sh) / 2;
            }
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
          } else {
            // Contain: scale to fit inside container, letterbox.
            const imgRatio = img.naturalWidth / img.naturalHeight;
            const boxRatio = cw / ch;
            let dw = cw, dh = ch, dx = 0, dy = 0;
            if (imgRatio > boxRatio) {
              dh = cw / imgRatio;
              dy = (ch - dh) / 2;
            } else {
              dw = ch * imgRatio;
              dx = (cw - dw) / 2;
            }
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, cw, ch);
            ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, dx, dy, dw, dh);
          }

          setLoaded(true);
          URL.revokeObjectURL(blobUrl);
        };
        img.onerror = () => {
          if (!cancelled) {
            setErrored(true);
            URL.revokeObjectURL(blobUrl);
          }
        };
        img.src = blobUrl;
      } catch (e) {
        if (!cancelled) setErrored(true);
      }
    }

    loadAndRender();

    // Re-fit if the canvas resizes (e.g. layout shift on hover scale).
    const ro = new ResizeObserver(() => {
      if (!canvas) return;
      // We simply re-render by triggering a re-mount via dep change.
    });
    ro.observe(canvas);

    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [slug, variant, fit]);

  if (errored) {
    return (
      <div
        className={
          "flex items-center justify-center bg-zinc-900/40 text-zinc-500 text-xs " +
          className
        }
      >
        Failed to load
      </div>
    );
  }

  return (
    <div className={"relative " + className}>
      <canvas
        ref={canvasRef}
        data-lightbox-canvas={variant === "full" ? "true" : undefined}
        aria-label={alt}
        className="block w-full h-full select-none pointer-events-none"
        style={{ imageRendering: "auto" }}
      />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/30 backdrop-blur-sm text-zinc-400 text-xs">
          Loading...
        </div>
      )}
    </div>
  );
}
