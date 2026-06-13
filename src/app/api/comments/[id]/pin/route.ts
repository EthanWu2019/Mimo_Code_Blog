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
    const userRole = (session.user as any).role;

    const comment = await prisma.comment.findUnique({
      where: { id },
      include: { post: { select: { authorId: true } } },
    });

    if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (userRole !== "admin" && comment.post.authorId !== userId) {
      return NextResponse.json({ error: "Only admin or post author can pin" }, { status: 403 });
    }

    const updated = await prisma.comment.update({
      where: { id },
      data: { pinned: !comment.pinned },
    });

    return NextResponse.json({ pinned: updated.pinned });
  } catch (error) {
    console.error("Error toggling pin:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
