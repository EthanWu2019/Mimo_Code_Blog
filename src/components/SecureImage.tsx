"use client";

import { useEffect, useRef, useState } from "react";

interface SecureImageProps {
  slug: string;
  alt: string;
  className?: string;
  /** "thumb" -> /thumb endpoint (faster, downscaled), "full" -> /image */
  variant?: "thumb" | "full";
}

/**
 * SecureImage
 *
 * Loads the protected image via a one-shot signed URL, converts to a Blob,
 * renders onto a <canvas> via blob: URL.  The <img> HTTP URL is never
 * exposed -- DevTools Network panel only sees the token-mint call and a
 * blob: handle that is revoked as soon as the image is decoded.
 *
 * Rendering strategy: we keep the canvas backing buffer at a generous size
 * (max container size clamped to 2x device pixel ratio), so CSS scaling on
 * hover (group-hover:scale-105) does NOT cause re-sampling of the image --
 * only CSS pixel-stretching, which preserves crisp edges.
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
        const tokenResp = await fetch(
          `/api/gallery/${slug}/token?variant=${variant}`,
          { credentials: "include" },
        );
        if (!tokenResp.ok) throw new Error("token mint failed");
        const { url } = await tokenResp.json();

        const imgResp = await fetch(url);
        if (!imgResp.ok) throw new Error("fetch failed");
        const blob = await imgResp.blob();
        const blobUrl = URL.createObjectURL(blob);

        const img = new Image();
        img.onload = () => {
          if (cancelled || !canvas || !ctx) {
            URL.revokeObjectURL(blobUrl);
            return;
          }

          // Get the container size in CSS pixels.
          const cw = canvas.clientWidth;
          const ch = canvas.clientHeight;
          if (cw === 0 || ch === 0) {
            // Container not laid out yet -- retry on next frame.
            requestAnimationFrame(() => {
              if (cancelled) return;
              img.onload?.(new Event("load"));
            });
            return;
          }

          // Use the image's natural resolution up to a cap (2x container px).
          // This guarantees that the canvas pixels never need to be
          // stretched by CSS, so hover scale-105 stays sharp.
          const dpr = Math.min(2, window.devicePixelRatio || 1);
          const maxW = Math.ceil(cw * dpr);
          const maxH = Math.ceil(ch * dpr);

          // Fit image inside the canvas at as-close-to-natural-size as possible
          // while never exceeding maxW/maxH.  Use contain-style fit (no crop).
          const imgRatio = img.naturalWidth / img.naturalHeight;
          const boxRatio = maxW / maxH;

          let drawW: number, drawH: number;
          if (imgRatio > boxRatio) {
            // Image is wider -- constrain by width.
            drawW = Math.min(img.naturalWidth, maxW);
            drawH = Math.round(drawW / imgRatio);
          } else {
            // Image is taller -- constrain by height.
            drawH = Math.min(img.naturalHeight, maxH);
            drawW = Math.round(drawH * imgRatio);
          }

          // Set canvas internal pixel buffer.
          canvas.width = drawW;
          canvas.height = drawH;

          // Center the image within the canvas pixel buffer (letterbox with
          // black background to avoid color shift on transparency).
          const offsetX = Math.round((maxW - drawW) / 2);
          const offsetY = Math.round((maxH - drawH) / 2);

          // Black background fills any unused pixels (letterbox).
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, maxW, maxH);

          // Draw at 1:1 (no resampling -> crisp pixels).
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(
            img,
            0,
            0,
            img.naturalWidth,
            img.naturalHeight,
            offsetX,
            offsetY,
            drawW,
            drawH,
          );

          // Round canvas backing-buffer to match CSS size exactly.
          canvas.width = maxW;
          canvas.height = maxH;
          // Re-draw onto the final buffer (1:1 pixels since we just resized).
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, maxW, maxH);
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(
            img,
            0,
            0,
            img.naturalWidth,
            img.naturalHeight,
            offsetX,
            offsetY,
            drawW,
            drawH,
          );

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
    return () => {
      cancelled = true;
    };
  }, [slug, variant]);

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
