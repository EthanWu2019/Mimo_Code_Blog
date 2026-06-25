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
 * Server-side:
 *  - decodes image via sharp
 *  - decodes the LSB watermark from any prior version (to preserve owner tag)
 *  - re-encodes with a fresh LSB watermark containing owner + slug + timestamp
 *  - upserts the GalleryItem
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

    // Decode + watermark
    const img = sharp(raw);
    const meta = await img.metadata();
    const w = meta.width || width || 0;
    const h = meta.height || height || 0;
    if (!w || !h) {
      return NextResponse.json({ error: "Could not determine image dims" }, { status: 400 });
    }

    const { data: rgba } = await img.ensureAlpha().raw().toBuffer({
      resolveWithObject: true,
    });

    // Fetch owner info for fingerprint
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const ownerTag = user?.email?.split("@")[0] || user?.name || "ethan";

    const perturbed = perturbImage(new Uint8Array(rgba), w, h, {
      seed: slug + ":" + userId,
      strength: 2,
    });

    const payload: WatermarkPayload = {
      owner: ownerTag,
      slug,
      uploadedAt: Date.now(),
    };

    const watermarked = embedWatermark(perturbed, w, h, payload, 4);

    // Re-encode to original mime at 95% quality (visually lossless)
    let out: Buffer;
    if (mime === "image/png") {
      out = await sharp(Buffer.from(watermarked), {
        raw: { width: w, height: h, channels: 4 },
      })
        .png({ compressionLevel: 9 })
        .toBuffer();
    } else if (mime === "image/webp") {
      out = await sharp(Buffer.from(watermarked), {
        raw: { width: w, height: h, channels: 4 },
      })
        .webp({ quality: 95 })
        .toBuffer();
    } else {
      out = await sharp(Buffer.from(watermarked), {
        raw: { width: w, height: h, channels: 4 },
      })
        .jpeg({ quality: 95, mozjpeg: true })
        .toBuffer();
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
      watermarked: true,
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
