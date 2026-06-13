import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const post = await prisma.post.findUnique({
      where: { slug },
      select: { id: true, tags: { select: { id: true } } },
    });

    if (!post) {
      return NextResponse.json([]);
    }

    const tagIds = post.tags.map((t) => t.id);

    const related = await prisma.post.findMany({
      where: {
        published: true,
        id: { not: post.id },
        tags: { some: { id: { in: tagIds } } },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        createdAt: true,
        tags: { select: { id: true, name: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { viewCount: "desc" },
      take: 5,
    });

    return NextResponse.json(related);
  } catch (error) {
    console.error("Error fetching related posts:", error);
    return NextResponse.json([]);
  }
}
