import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    if (!postId) return NextResponse.json({ error: "Post ID required" }, { status: 400 });

    const session = await auth();
    const userId = (session?.user as any)?.id;

    const comments = await prisma.comment.findMany({
      where: { postId, parentId: null },
      include: {
        author: { select: { id: true, name: true, avatar: true, role: true } },
        likes: { select: { userId: true } },
        replies: {
          include: {
            author: { select: { id: true, name: true, avatar: true, role: true } },
            likes: { select: { userId: true } },
            replies: {
              include: {
                author: { select: { id: true, name: true, avatar: true, role: true } },
                likes: { select: { userId: true } },
                replies: {
                  include: {
                    author: { select: { id: true, name: true, avatar: true, role: true } },
                    likes: { select: { userId: true } },
                  },
                  orderBy: [{ pinned: "desc" }, { createdAt: "asc" }],
                },
              },
              orderBy: [{ pinned: "desc" }, { createdAt: "asc" }],
            },
          },
          orderBy: [{ pinned: "desc" }, { createdAt: "asc" }],
        },
      },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    });

    const formatComment = (c: any) => ({
      ...c,
      likeCount: c.likes.length,
      liked: userId ? c.likes.some((l: any) => l.userId === userId) : false,
      likes: undefined,
      replies: c.replies?.map(formatComment),
    });

    const sorted = comments.map(formatComment).sort((a: any, b: any) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      const scoreA = a.likeCount * 3 + (Date.now() - new Date(a.createdAt).getTime() / 3600000);
      const scoreB = b.likeCount * 3 + (Date.now() - new Date(b.createdAt).getTime() / 3600000);
      return scoreB - scoreA;
    });

    return NextResponse.json(sorted);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Login required" }, { status: 401 });

    const userId = (session.user as any).id;
    const { content, postId, parentId } = await request.json();
    if (!content || !postId) return NextResponse.json({ error: "Content and postId required" }, { status: 400 });

    const comment = await prisma.comment.create({
      data: { content, postId, authorId: userId, parentId: parentId || null },
      include: {
        author: { select: { id: true, name: true, avatar: true, role: true } },
        likes: { select: { userId: true } },
      },
    });

    return NextResponse.json({
      ...comment,
      likeCount: 0,
      liked: false,
      replies: [],
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
