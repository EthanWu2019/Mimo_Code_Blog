import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/gallery/[slug]/image - return raw image bytes
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const item = await prisma.galleryItem.findUnique({
      where: { slug },
      select: { imageData: true, imageMime: true },
    });

    if (!item) {
      return new NextResponse("Not found", { status: 404 });
    }

    // imageData is "data:image/webp;base64,XXX..."
    const match = item.imageData.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      return new NextResponse("Invalid data", { status: 500 });
    }

    const mime = match[1];
    const bytes = Buffer.from(match[2], "base64");

    return new NextResponse(bytes, {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Gallery image GET error:", error);
    return new NextResponse("Error", { status: 500 });
  }
}