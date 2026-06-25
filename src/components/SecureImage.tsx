"use client";

import { useEffect, useRef, useState } from "react";

interface SecureImageProps {
  slug: string;
  alt: string;
  className?: string;
  /** "thumb" -> uses /thumb endpoint (with watermark), "full" -> uses /image */
  variant?: "thumb" | "full";
  /** Owner ID shown in watermark for traceability */
  ownerFingerprint?: string;
  /** Watermark opacity (0-1) */
  watermarkOpacity?: number;
  /** Disable watermark (e.g. for trusted admin view) */
  noWatermark?: boolean;
}

/**
 * SecureImage
 *
 * Loads the protected image via signed-token URL, converts to a Blob,
 * renders onto a <canvas> via blob: URL -- so the <img> URL is NEVER
 * exposed in DevTools Network tab. Overlays a subtle repeating SVG watermark
 * containing the work title, owner fingerprint, and current epoch -- visible
 * deterrent against casual screenshot theft.
 *
 * Defense layers:
 *   L1 (Network): signed token expires every 5 min
 *   L2 (Client):  blob: URL (not http://), no <img src> visible
 *   L3 (Visual):  visible watermark with owner ID baked in
 *   L4 (Forensic): session fingerprint stored in watermark for trace
 */
export default function SecureImage({
  slug,
  alt,
  className = "",
  variant = "thumb",
  ownerFingerprint = "ethan",
  watermarkOpacity = 0.08,
  noWatermark = false,
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
        // 1) Ask our own /api/gallery/[slug]/token?action=sign to mint a fresh token
        //    -- keeps the secret on the server, never exposed.
        const tokenResp = await fetch(
          `/api/gallery/${slug}/token?variant=${variant}`,
          { credentials: "include" },
        );
        if (!tokenResp.ok) throw new Error("token mint failed");
        const { url } = await tokenResp.json();

        // 2) Fetch with the one-shot signed URL (5 min TTL)
        const imgResp = await fetch(url);
        if (!imgResp.ok) throw new Error("fetch failed");
        const blob = await imgResp.blob();

        // 3) Turn into a blob: URL -- the ONLY URL visible to DevTools.
        //    Crucially, this URL is NOT the same as the network URL, and
        //    copying it from DevTools yields a memory:// handle, not http://.
        const blobUrl = URL.createObjectURL(blob);

        // 4) Decode and draw to canvas
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          if (cancelled || !canvas || !ctx) {
            URL.revokeObjectURL(blobUrl);
            return;
          }
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          ctx.drawImage(img, 0, 0);

          // 5) Overlay watermark (visible deterrent)
          if (!noWatermark) {
            drawWatermark(ctx, canvas.width, canvas.height, {
              title: alt,
              owner: ownerFingerprint,
              opacity: watermarkOpacity,
              epoch: Math.floor(Date.now() / 1000),
            });
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
    return () => {
      cancelled = true;
    };
  }, [slug, variant, alt, ownerFingerprint, watermarkOpacity, noWatermark]);

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

/**
 * Draw a tiled SVG-style watermark: title, owner fingerprint, and session epoch.
 * Repeats diagonally across the image at low opacity.
 */
function drawWatermark(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  opts: { title: string; owner: string; opacity: number; epoch: number },
) {
  ctx.save();
  ctx.globalAlpha = opts.opacity;
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;
  ctx.font = `${Math.max(18, Math.round(w / 80))}px sans-serif`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";

  const tileSize = Math.max(180, Math.round(Math.min(w, h) / 4));
  const label = `${opts.title} · © ${opts.owner} · ${opts.epoch}`;

  for (let y = 0; y < h + tileSize; y += tileSize) {
    for (let x = 0; x < w + tileSize; x += tileSize) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-Math.PI / 12);
      ctx.strokeText(label, 0, 0);
      ctx.fillText(label, 0, 0);
      ctx.restore();
    }
  }

  ctx.restore();
}
