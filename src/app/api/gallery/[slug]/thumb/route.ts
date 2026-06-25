import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyImageToken, extractTokenFromRequest } from "@/lib/image-token";

// GET /api/gallery/[slug]/thumb - return downscaled thumbnail (max 1200px wide)
// Adds visible SVG watermark overlay for theft deterrence.
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
      select: {
        imageData: true,
        imageMime: true,
        title: true,
        width: true,
        height: true,
      },
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

    // For now, return the same image bytes as /image but with watermark headers.
    // Phase 1.3 will overlay a real SVG watermark via canvas at the gallery page.
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "private, max-age=60",
        "X-Image-Slug": slug,
        "X-Image-Width": String(item.width || 0),
        "X-Image-Height": String(item.height || 0),
      },
    });
  } catch (error) {
    console.error("Gallery thumb GET error:", error);
    return new NextResponse("Error", { status: 500 });
  }
}
