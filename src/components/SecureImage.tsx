"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

export interface SecureImageHandle {
  /** Returns the underlying <img> element for native fullscreen requests. */
  getElement: () => HTMLImageElement | null;
}

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
 * Loads the protected image via a one-shot signed URL, sets an <img> src to
 * a blob: URL.  The original http:// URL is never exposed.
 *
 * Uses plain <img> with object-cover -- browser-native rendering is always
 * crisp, and group-hover:scale-105 / click handlers work without any canvas
 * quirks.  The blob: URL is revoked on unmount.
 *
 * Defense layers:
 *   L1 (Network):  signed HMAC-SHA256 token, 5 min TTL
 *   L2 (Client):   blob: URL (no http:// in DevTools)
 *   L3 (Forensic): LSB invisible watermark baked into pixels at upload time
 *   L4 (Visual):   subtle corner signature burned at upload time
 */
const SecureImage = forwardRef<SecureImageHandle, SecureImageProps>(
  function SecureImage(
    { slug, alt, className = "", variant = "thumb" },
    ref,
  ) {
    const [url, setUrl] = useState<string | null>(null);
    const [errored, setErrored] = useState(false);

    useImperativeHandle(
      ref,
      () => ({
        getElement: () => {
          const el = document.querySelector<HTMLImageElement>(
            `[data-secure-img="${slug}-${variant}"]`,
          );
          return el;
        },
      }),
      [slug, variant],
    );

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
      <div className={"relative overflow-hidden " + className}>
        {url ? (
          <img
            src={url}
            alt={alt}
            data-secure-img={`${slug}-${variant}`}
            className="block w-full h-full object-cover select-none"
            draggable={false}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/30 backdrop-blur-sm text-zinc-400 text-xs">
            Loading...
          </div>
        )}
      </div>
    );
  },
);

export default SecureImage;
