import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import sharp from "sharp";
import { embedWatermark, type WatermarkPayload } from "@/lib/image-watermark";
import { perturbImage } from "@/lib/image-perturb";

/**
 * POST /api/gallery/backfill-watermark
 *
 * Applies full security pipeline to ALL existing gallery items:
 *  - PhotoGuard-style perturbation
 *  - LSB invisible watermark (owner / slug / timestamp)
 *  - Corner signature watermark
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

        const img = sharp(bytes);
        const meta = await img.metadata();
        const w = meta.width || item.width || 0;
        const h = meta.height || item.height || 0;
        if (!w || !h) {
          results.push({ slug: item.slug, status: "failed", reason: "no dims" });
          continue;
        }

        const { data: rawPixels, info } = await img
          .raw()
          .toBuffer({ resolveWithObject: true });

        const channels = info.channels;

        // Apply perturbation
        const perturbed = perturbImage(new Uint8Array(rawPixels), w, h, {
          seed: item.slug + ":backfill",
          strength: 2,
        });

        // Embed LSB watermark (works on RGBA; for RGB we pass 3 channels)
        const payload: WatermarkPayload = {
          owner,
          slug: item.slug,
          uploadedAt: Date.now(),
        };
        const watermarked = embedWatermark(
          perturbed,
          w,
          h,
          payload,
          channels === 4 ? 4 : 3,
        );

        // Render corner signature overlay
        const sigPng = await renderSignatureWatermark(owner, w, h);

        // Re-assemble using the correct channel count
        const composited = await sharp(Buffer.from(watermarked), {
          raw: { width: w, height: h, channels },
        })
          .composite([{ input: sigPng, gravity: "southeast" }])
          .toBuffer();

        // Re-encode in original format
        const out =
          mime === "image/png"
            ? await sharp(composited, { raw: { width: w, height: h, channels } })
                .png({ compressionLevel: 9 })
                .toBuffer()
            : mime === "image/webp"
              ? await sharp(composited, { raw: { width: w, height: h, channels } })
                  .webp({ quality: 95 })
                  .toBuffer()
              : await sharp(composited, { raw: { width: w, height: h, channels } })
                  .jpeg({ quality: 95, mozjpeg: true })
                  .toBuffer();

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

async function renderSignatureWatermark(
  owner: string,
  imageW: number,
  imageH: number,
): Promise<Buffer> {
  const sigW = Math.max(180, Math.round(imageW * 0.06));
  const sigH = Math.max(28, Math.round(imageW * 0.012));
  const fontSize = Math.max(11, Math.round(sigH * 0.5));

  const svg = `
    <svg width="${sigW}" height="${sigH}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.22"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.10"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="${sigW}" height="${sigH}" rx="4" ry="4" fill="url(#g)"/>
      <text x="${sigW / 2}" y="${sigH / 2 + fontSize * 0.35}"
            text-anchor="middle"
            font-family="ui-sans-serif, -apple-system, system-ui, sans-serif"
            font-size="${fontSize}"
            font-weight="500"
            letter-spacing="0.08em"
            fill="#ffffff"
            fill-opacity="0.55">© ${owner}</text>
    </svg>
  `;
  return sharp(Buffer.from(svg)).png().toBuffer();
}
