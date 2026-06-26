"use client";

import { useEffect, useRef, useState } from "react";

interface SecureImageProps {
  slug: string;
  alt: string;
  className?: string;
  /** "thumb" (default, faster) or "full" -- both render to canvas */
  variant?: "thumb" | "full";
}

/**
 * SecureImage
 *
 * Loads the protected image via a one-shot signed URL, converts to a Blob,
 * renders onto a <canvas> via blob: URL.  The <img> HTTP URL is never
 * exposed.
 *
 * Performance: the canvas backing buffer is capped at 2x the CSS size to
 * keep memory + raster time low.  When the original image is much larger
 * (e.g. 6240x2656) we downsample once at decode time using createImageBitmap
 * with resizeWidth/resizeHeight -- much faster than letting CSS stretch a
 * giant bitmap, and keeps edges crisp on retina.
 *
 * Defense layers:
 *   L1 (Network):  signed HMAC-SHA256 token, 5 min TTL
 *   L2 (Client):   blob: URL (no http:// in DevTools)
 *   L3 (Forensic): LSB invisible watermark baked into pixels at upload time
 *   L4 (Visual):   subtle corner signature burned at upload time
 */
const MAX_CANVAS_PX = 3200; // hard cap on backing buffer (retina + headroom)

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
        // 1) Mint a one-shot signed URL on the server.
        const tokenResp = await fetch(
          `/api/gallery/${slug}/token?variant=${variant}`,
          { credentials: "include" },
        );
        if (!tokenResp.ok) throw new Error("token mint failed");
        const { url } = await tokenResp.json();

        // 2) Fetch the protected image (5 min TTL on the URL).
        const imgResp = await fetch(url);
        if (!imgResp.ok) throw new Error("fetch failed");
        const blob = await imgResp.blob();

        // 3) Decode using createImageBitmap -- supports resize at decode
        //    time which is faster than drawing a huge bitmap and then scaling.
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const cw = Math.max(canvas!.clientWidth, 1);
        const ch = Math.max(canvas!.clientHeight, 1);
        let targetW = Math.ceil(cw * dpr);
        let targetH = Math.ceil(ch * dpr);
        // Hard cap so we never allocate a multi-megapixel canvas.
        const cap = MAX_CANVAS_PX / Math.max(cw, ch);
        if (cap < 1) {
          targetW = Math.floor(targetW * cap);
          targetH = Math.floor(targetH * cap);
        }

        const bitmap = await createImageBitmap(blob, {
          resizeWidth: targetW,
          resizeHeight: targetH,
          resizeQuality: "high",
        });

        if (cancelled || !canvas || !ctx) {
          return;
        }

        canvas.width = targetW;
        canvas.height = targetH;
        ctx.clearRect(0, 0, targetW, targetH);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(bitmap, 0, 0, targetW, targetH);
        bitmap.close?.();

        setLoaded(true);
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
