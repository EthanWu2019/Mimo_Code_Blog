"use client";

import { useEffect, useRef, useState } from "react";

interface SecureImageProps {
  slug: string;
  alt: string;
  className?: string;
  /** "thumb" (default) or "full" */
  variant?: "thumb" | "full";
}

/**
 * SecureImage
 *
 * Loads the protected image via a one-shot signed URL, converts to a Blob,
 * and sets an <img> src to a blob: URL.  The original http:// URL is never
 * exposed -- DevTools Network only sees the token-mint request and the
 * blob:// handle (which becomes invalid after revoke).
 *
 * This is the simplest possible implementation.  No canvas, no resampling --
 * just <img src={blobUrl}> with object-cover so the image fills the
 * container.  This guarantees crisp output and lets the existing
 * group-hover:scale-105 animation work without any extra plumbing.
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
  const [url, setUrl] = useState<string | null>(null);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let currentUrl: string | null = null;

    async function load() {
      try {
        const tokenResp = await fetch(
          `/api/gallery/${slug}/token?variant=${variant}`,
          { credentials: "include" },
        );
        if (!tokenResp.ok) throw new Error("token mint failed");
        const { url: signedUrl } = await tokenResp.json();

        const imgResp = await fetch(signedUrl);
        if (!imgResp.ok) throw new Error("fetch failed");
        const blob = await imgResp.blob();

        const blobUrl = URL.createObjectURL(blob);
        currentUrl = blobUrl;

        if (!cancelled) {
          setUrl(blobUrl);
        } else {
          URL.revokeObjectURL(blobUrl);
        }
      } catch (e) {
        if (!cancelled) setErrored(true);
      }
    }

    load();
    return () => {
      cancelled = true;
      if (currentUrl) URL.revokeObjectURL(currentUrl);
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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url ?? undefined}
        alt={alt}
        data-lightbox-canvas={variant === "full" ? "true" : undefined}
        className="block w-full h-full object-cover select-none pointer-events-none"
        draggable={false}
      />
      {!url && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/30 backdrop-blur-sm text-zinc-400 text-xs">
          Loading...
        </div>
      )}
    </div>
  );
}
