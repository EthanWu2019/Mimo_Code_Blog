import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { buildSignedImageUrl } from "@/lib/image-token";

// GET /api/gallery/[slug]/token?variant=thumb|full
// Returns a one-shot signed URL valid for 5 minutes. Client uses this to
// fetch the actual image -- never exposes the secret or raw image URL.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const variant = (searchParams.get("variant") as "thumb" | "full") || "thumb";

    const item = await prisma.galleryItem.findUnique({
      where: { slug },
      select: { id: true, slug: true },
    });

    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const url = buildSignedImageUrl(slug, undefined, variant);
    return NextResponse.json({ url, expiresIn: 300 });
  } catch (error) {
    console.error("Gallery token mint error:", error);
    return NextResponse.json({ error: "Mint failed" }, { status: 500 });
  }
}
