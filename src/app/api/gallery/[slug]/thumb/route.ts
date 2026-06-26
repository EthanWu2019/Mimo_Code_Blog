import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import sharp from "sharp";
import { verifyImageToken, extractTokenFromRequest } from "@/lib/image-token";

/**
 * GET /api/gallery/[slug]/thumb
 *
 * Returns a downscaled thumbnail (max 1600px on long edge) of the gallery
 * image, suitable for in-page display and lightbox preview.  This is what
 * should be loaded 99% of the time -- the /image endpoint is reserved for
 * full-resolution download.
 *
 * Cache-Control: private, max-age=300 -- the image rarely changes and the
 * 5 min TTL matches the signed-URL expiry window.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const token = extractTokenFromRequest(request);
    if (!token || !verifyImageToken(slug, token)) {
      return new NextResponse("Token invalid or expired", { status: 403 });
    }

    const item = await prisma.galleryItem.findUnique({
      where: { slug },
      select: { imageData: true, imageMime: true, width: true, height: true },
    });

    if (!item) {
      return new NextResponse("Not found", { status: 404 });
    }

    const match = item.imageData.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      return new NextResponse("Invalid data", { status: 500 });
    }

    const mime = match[1];
    const bytes = Buffer.from(match[2], "base64");

    // Downscale to max 1600px on the long edge for fast in-page display.
    const MAX_LONG_EDGE = 1600;
    const img = sharp(bytes);
    const meta = await img.metadata();
    const w = meta.width || 0;
    const h = meta.height || 0;

    let out: Buffer;
    if (w > MAX_LONG_EDGE || h > MAX_LONG_EDGE) {
      if (mime === "image/png") {
        out = await img.resize({ width: MAX_LONG_EDGE, height: MAX_LONG_EDGE, fit: "inside" }).png({ compressionLevel: 9 }).toBuffer();
      } else if (mime === "image/webp") {
        out = await img.resize({ width: MAX_LONG_EDGE, height: MAX_LONG_EDGE, fit: "inside" }).webp({ quality: 90 }).toBuffer();
      } else {
        out = await img.resize({ width: MAX_LONG_EDGE, height: MAX_LONG_EDGE, fit: "inside" }).jpeg({ quality: 90, mozjpeg: true }).toBuffer();
      }
    } else {
      // Already small enough -- just re-encode at slightly lower quality
      // to reduce payload without visible change.
      if (mime === "image/png") {
        out = await img.png({ compressionLevel: 9 }).toBuffer();
      } else if (mime === "image/webp") {
        out = await img.webp({ quality: 90 }).toBuffer();
      } else {
        out = await img.jpeg({ quality: 90, mozjpeg: true }).toBuffer();
      }
    }

    return new NextResponse(new Uint8Array(out), {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "private, max-age=300, must-revalidate",
        "X-Thumb-Max-Edge": String(MAX_LONG_EDGE),
      },
    });
  } catch (error) {
    console.error("Gallery thumb GET error:", error);
    return new NextResponse("Error", { status: 500 });
  }
}
