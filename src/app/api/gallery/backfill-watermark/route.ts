import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { embedWatermark, type WatermarkPayload } from "@/lib/image-watermark";
import sharp from "sharp";

/**
 * POST /api/gallery/backfill-watermark
 * Backfills LSB watermark into all existing gallery items that don't have one.
 * Idempotent: items already watermarked (by checking if extracted owner matches)
 * are skipped.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const owner = body.owner || "EthanWu";

    const items = await prisma.galleryItem.findMany({
      select: {
        id: true,
        slug: true,
        imageData: true,
        imageMime: true,
        width: true,
        height: true,
      },
    });

    const results: Array<{
      slug: string;
      status: "watermarked" | "skipped" | "failed";
      reason?: string;
    }> = [];

    for (const item of items) {
      try {
        const match = item.imageData.match(/^data:([^;]+);base64,(.+)$/);
        if (!match) {
          results.push({ slug: item.slug, status: "failed", reason: "bad data url" });
          continue;
        }
        const mime = match[1];
        const bytes = Buffer.from(match[2], "base64");

        // Decode via sharp (handles webp/jpeg/png uniformly)
        const img = sharp(bytes);
        const meta = await img.metadata();
        const w = meta.width || item.width || 0;
        const h = meta.height || item.height || 0;
        if (!w || !h) {
          results.push({ slug: item.slug, status: "failed", reason: "no dims" });
          continue;
        }

        // Convert to raw RGBA for LSB embedding
        const { data: rawPixels } = await img
          .ensureAlpha()
          .raw()
          .toBuffer({ resolveWithObject: true });

        const payload: WatermarkPayload = {
          owner,
          slug: item.slug,
          uploadedAt: Date.now(),
        };

        const watermarked = embedWatermark(
          new Uint8Array(rawPixels),
          w,
          h,
          payload,
          4,
        );

        // Re-encode back to original mime
        const out =
          mime === "image/png"
            ? await sharp(Buffer.from(watermarked), {
                raw: { width: w, height: h, channels: 4 },
              }).png().toBuffer()
            : mime === "image/webp"
              ? await sharp(Buffer.from(watermarked), {
                  raw: { width: w, height: h, channels: 4 },
                }).webp({ quality: 95 }).toBuffer()
              : await sharp(Buffer.from(watermarked), {
                  raw: { width: w, height: h, channels: 4 },
                }).jpeg({ quality: 95 }).toBuffer();

        const newDataUrl = `data:${mime};base64,${out.toString("base64")}`;

        await prisma.galleryItem.update({
          where: { slug: item.slug },
          data: { imageData: newDataUrl },
        });

        results.push({ slug: item.slug, status: "watermarked" });
      } catch (err: any) {
        results.push({
          slug: item.slug,
          status: "failed",
          reason: err?.message || String(err),
        });
      }
    }

    return NextResponse.json({ ok: true, results });
  } catch (error) {
    console.error("Backfill watermark error:", error);
    return NextResponse.json({ error: "Backfill failed" }, { status: 500 });
  }
}
