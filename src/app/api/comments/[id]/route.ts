// =============================================================
// /api/comments/[id]
//
// DELETE: comment author OR a site owner (per ADMIN_EMAILS) can
//   delete. Anyone else gets 403.
//
// Used by /profile's comments tab so the owner can clean up
// comments on their posts from anywhere, and so any logged-in user
// can remove their own comment from a post they no longer want to
// be associated with. There is no separate "edit" endpoint \u2014
// messages are immutable once posted.
// =============================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

const ADMIN_EMAILS = new Set<string>([
  "ethanwucz2019@gmail.com",
  "3401895383@qq.com",
  "ethanwucz2026@gmail.com",
]);

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const userId = (session.user as any).id as string;
  const email = (session.user as any)?.email as string | undefined;
  const isAdminUser = !!email && ADMIN_EMAILS.has(email.toLowerCase());

  const c = await prisma.comment.findUnique({
    where: { id: id },
    select: { id: true, authorId: true },
  });
  if (!c) {
    return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  }

  if (c.authorId !== userId && !isAdminUser) {
    return NextResponse.json(
      { error: "You can only delete your own comments." },
      { status: 403 }
    );
  }

  try {
    await prisma.comment.delete({ where: { id: id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[/api/comments DELETE]", e);
    return NextResponse.json({ error: "Failed to delete." }, { status: 500 });
  }
}
