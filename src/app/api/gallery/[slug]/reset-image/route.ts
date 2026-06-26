import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import sharp from "sharp";
import { auth } from "@/lib/auth";

/**
 * POST /api/gallery/[slug]/reset-image
 *
 * Body: multipart/form-data with file=<image bytes>
 *
 * Resets a gallery item to the original uploaded image (no watermark, no
 * perturbation, no signature).  Use this to undo a bad backfill.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Login required" }, { status: 401 });
    }

    const { slug } = await params;
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buf = Buffer.from(bytes);

    const meta = await sharp(buf).metadata();
    if (!meta.width || !meta.height) {
      return NextResponse.json({ error: "Bad image" }, { status: 400 });
    }

    const dataUrl = `data:${file.type};base64,${buf.toString("base64")}`;

    const item = await prisma.galleryItem.update({
      where: { slug },
      data: {
        imageData: dataUrl,
        imageMime: file.type,
        width: meta.width,
        height: meta.height,
      },
    });

    return NextResponse.json({
      ok: true,
      slug: item.slug,
      width: meta.width,
      height: meta.height,
      bytes: buf.length,
    });
  } catch (error: any) {
    console.error("Reset image error:", error);
    return NextResponse.json(
      { error: error?.message || "Reset failed" },
      { status: 500 },
    );
  }
}
