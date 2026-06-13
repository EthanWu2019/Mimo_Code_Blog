import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Login required" }, { status: 401 });

    const { id } = await params;
    const userId = (session.user as any).id;

    const existing = await prisma.commentLike.findUnique({
      where: { commentId_userId: { commentId: id, userId } },
    });

    if (existing) {
      await prisma.commentLike.delete({ where: { id: existing.id } });
      const count = await prisma.commentLike.count({ where: { commentId: id } });
      return NextResponse.json({ liked: false, likeCount: count });
    }

    await prisma.commentLike.create({ data: { commentId: id, userId } });
    const count = await prisma.commentLike.count({ where: { commentId: id } });
    return NextResponse.json({ liked: true, likeCount: count });
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
