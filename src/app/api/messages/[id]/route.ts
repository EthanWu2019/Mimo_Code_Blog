// =============================================================
// /api/messages/:id
//
// DELETE: signed-in. Author can delete their own. Admins (per
//   ADMIN_EMAILS) can delete any. Otherwise 403.
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

  const msg = await prisma.message.findUnique({
    where: { id: id },
    select: { id: true, authorId: true },
  });
  if (!msg) {
    return NextResponse.json({ error: "Message not found." }, { status: 404 });
  }

  if (msg.authorId !== userId && !isAdminUser) {
    return NextResponse.json(
      { error: "You can only delete your own messages." },
      { status: 403 }
    );
  }

  try {
    await prisma.message.delete({ where: { id: id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[/api/messages DELETE]", e);
    return NextResponse.json({ error: "Failed to delete." }, { status: 500 });
  }
}
