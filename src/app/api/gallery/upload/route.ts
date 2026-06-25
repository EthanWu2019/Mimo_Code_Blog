import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import sharp from "sharp";
import { embedWatermark, type WatermarkPayload } from "@/lib/image-watermark";
import { perturbImage } from "@/lib/image-perturb";

/**
 * POST /api/gallery/upload
 *
 * Body: { slug, title, subtitle?, description?, imageData, imageMime, width, height,
 *         aspectRatio, tags?, featured? }
 *
 * Server-side pipeline:
 *  1. Decode via sharp
 *  2. Apply PhotoGuard-style adversarial perturbation (RGB ±2/255)
 *  3. Embed LSB invisible watermark (owner / slug / timestamp)
 *  4. Burn subtle signature watermark into a corner (so casual viewers won't
 *     notice, but anyone looking closely sees the artist's mark)
 *  5. Upsert GalleryItem
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Login required" }, { status: 401 });
    }

    const body = await request.json();
    const {
      slug,
      title,
      subtitle,
      description,
      imageData,
      imageMime,
      width,
      height,
      aspectRatio,
      tags,
      featured,
    } = body;

    if (!slug || !title || !imageData) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const match = imageData.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
    }
    const mime = match[1];
    const raw = Buffer.from(match[2], "base64");

    const img = sharp(raw);
    const meta = await img.metadata();
    const w = meta.width || width || 0;
    const h = meta.height || height || 0;
    if (!w || !h) {
      return NextResponse.json(
        { error: "Could not determine image dims" },
        { status: 400 },
      );
    }

    // Decode to raw RGBA
    const { data: rgba } = await img.ensureAlpha().raw().toBuffer({
      resolveWithObject: true,
    });

    // Fetch owner info for fingerprint
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const ownerTag = user?.email?.split("@")[0] || user?.name || "ethan";

    // Apply PhotoGuard-style perturbation
    const perturbed = perturbImage(new Uint8Array(rgba), w, h, {
      seed: slug + ":" + userId,
      strength: 2,
    });

    // Embed LSB invisible watermark
    const payload: WatermarkPayload = {
      owner: ownerTag,
      slug,
      uploadedAt: Date.now(),
    };
    const watermarked = embedWatermark(perturbed, w, h, payload, 4);

    // Burn subtle signature watermark into bottom-right corner.
    // Uses SVG overlay so it scales perfectly, opacity ~0.18, fits in ~6% of width.
    const sigPng = await renderSignatureWatermark(ownerTag, w, h);
    const composited = await sharp(Buffer.from(watermarked), {
      raw: { width: w, height: h, channels: 4 },
    })
      .composite([{ input: sigPng, gravity: "southeast" }])
      .toBuffer();

    // Re-encode at 95% quality
    let out: Buffer;
    if (mime === "image/png") {
      out = await sharp(composited).png({ compressionLevel: 9 }).toBuffer();
    } else if (mime === "image/webp") {
      out = await sharp(composited).webp({ quality: 95 }).toBuffer();
    } else {
      out = await sharp(composited).jpeg({ quality: 95, mozjpeg: true }).toBuffer();
    }

    const finalDataUrl = `data:${mime};base64,${out.toString("base64")}`;

    const item = await prisma.galleryItem.upsert({
      where: { slug },
      create: {
        slug,
        title,
        subtitle: subtitle || null,
        description: description || null,
        imageData: finalDataUrl,
        imageMime: mime,
        width: w,
        height: h,
        aspectRatio: aspectRatio || "landscape",
        tags: Array.isArray(tags) ? tags : [],
        featured: !!featured,
        authorId: userId,
      },
      update: {
        title,
        subtitle: subtitle || null,
        description: description || null,
        imageData: finalDataUrl,
        imageMime: mime,
        width: w,
        height: h,
        aspectRatio: aspectRatio || "landscape",
        tags: Array.isArray(tags) ? tags : [],
        featured: !!featured,
      },
    });

    return NextResponse.json({
      ok: true,
      id: item.id,
      slug: item.slug,
      size: out.length,
      dims: { width: w, height: h },
    });
  } catch (error: any) {
    console.error("Gallery upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Upload failed" },
      { status: 500 },
    );
  }
}

/**
 * Render a subtle bottom-right signature watermark.
 *
 * Returns a PNG buffer suitable for sharp's composite() call.
 * Width = max(180, imageW / 16), positioned in the lower-right corner.
 * Opacity ~0.18 so it reads as an artist's mark, not a banner.
 */
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
