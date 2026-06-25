import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/gallery - list all gallery items (public, sorted newest first)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where = featured === "true" ? { featured: true } : undefined;

    const items = await prisma.galleryItem.findMany({
      where,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: Math.min(limit, 100),
      // Strip heavy imageData from list responses
      select: {
        id: true,
        slug: true,
        title: true,
        subtitle: true,
        description: true,
        imageMime: true,
        width: true,
        height: true,
        aspectRatio: true,
        tags: true,
        featured: true,
        viewCount: true,
        likeCount: true,
        authorId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Gallery GET error:", error);
    return NextResponse.json({ error: "Failed to load gallery" }, { status: 500 });
  }
}

// POST /api/gallery - create new item (login required)
export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Login required" }, { status: 401 });
    }

    const body = await request.json();
    const { slug, title, subtitle, description, imageData, imageMime, width, height, aspectRatio, tags, featured } = body;

    if (!slug || !title || !imageData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const item = await prisma.galleryItem.create({
      data: {
        slug,
        title,
        subtitle: subtitle || null,
        description: description || null,
        imageData,
        imageMime: imageMime || "image/webp",
        width: width || 0,
        height: height || 0,
        aspectRatio: aspectRatio || "landscape",
        tags: Array.isArray(tags) ? tags : [],
        featured: !!featured,
        authorId: userId,
      },
    });

    return NextResponse.json({ ok: true, id: item.id, slug: item.slug });
  } catch (error: any) {
    console.error("Gallery POST error:", error);
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}