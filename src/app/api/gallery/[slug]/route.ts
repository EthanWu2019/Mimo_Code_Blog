import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/gallery/[slug] - get single item including imageData
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const item = await prisma.galleryItem.findUnique({
      where: { slug },
    });

    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Increment viewCount atomically
    await prisma.galleryItem.update({
      where: { id: item.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Gallery slug GET error:", error);
    return NextResponse.json({ error: "Failed to load item" }, { status: 500 });
  }
}

// DELETE /api/gallery/[slug] - delete (login required, only author)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Login required" }, { status: 401 });
    }

    const { slug } = await params;
    const item = await prisma.galleryItem.findUnique({ where: { slug } });
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (item.authorId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.galleryItem.delete({ where: { slug } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Gallery slug DELETE error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}