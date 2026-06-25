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
 * Visible watermarks are burned into the image server-side (corner
 * signature + LSB invisible watermark), so this component renders the
 * image cleanly without any additional overlay.
 *
 * Defense layers:
 *   L1 (Network):  signed HMAC-SHA256 token, 5 min TTL
 *   L2 (Client):   blob: URL (no http:// in DevTools)
 *   L3 (Forensic): LSB invisible watermark baked into pixels at upload time
 *   L4 (AI-edit):  PhotoGuard-style adversarial perturbation in pixel LSBs
 *   L5 (Visual):   subtle corner signature burned at upload time
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
        //    Copying it out of DevTools yields a memory:// handle, not http://.
        const blobUrl = URL.createObjectURL(blob);

        // 4) Decode and draw to canvas
        const img = new Image();
        img.onload = () => {
          if (cancelled || !canvas || !ctx) {
            URL.revokeObjectURL(blobUrl);
            return;
          }
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          ctx.drawImage(img, 0, 0);
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
        className="block w-full h-full object-contain select-none pointer-events-none"
      />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/30 backdrop-blur-sm text-zinc-400 text-xs">
          Loading...
        </div>
      )}
    </div>
  );
}
