// =============================================================
// /api/messages
//
// GET: anyone (signed in or not) can read the public board.
//   - Returns messages newest-first, includes the author's display
//     name + avatar so the client doesn't need a second round-trip
//     per message.
//   - Pagination via ?cursor=<messageId> & ?limit=N (default 30).
//     Cursor is the id of the oldest message currently loaded; we
//     return messages with createdAt < that cursor's createdAt (and
//     tiebreak on id). Returns the next cursor in the response.
//
// POST: signed-in users only. Anyone in ADMIN_EMAILS too. Anyone
//   else gets 401.
//
// DELETE /api/messages/:id: signed-in. Author can delete their own.
//   Admins (per ADMIN_EMAILS) can delete any.
// =============================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

const ADMIN_EMAILS = new Set<string>([
  "ethanwucz2019@gmail.com",
  "3401895383@qq.com",
  "ethanwucz2026@gmail.com",
]);

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const cursorId = url.searchParams.get("cursor");
  const limitParam = parseInt(url.searchParams.get("limit") ?? "", 10);
  const limit = Math.min(
    Math.max(Number.isFinite(limitParam) && limitParam > 0 ? limitParam : DEFAULT_LIMIT, 1),
    MAX_LIMIT
  );

  try {
    let cursor: { createdAt: Date; id: string } | null = null;
    if (cursorId) {
      const c = await prisma.message.findUnique({
        where: { id: cursorId },
        select: { createdAt: true, id: true },
      });
      if (c) cursor = c;
    }

    const rows = await prisma.message.findMany({
      take: limit + 1, // fetch one extra to know if there's a next page
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      ...(cursor
        ? {
            cursor: { createdAt_id: cursor } as any,
            skip: 0,
          }
        : {}),
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    });

    // Prisma's compound cursor syntax (createdAt_id) requires the
    // @@unique annotation; we don't have one on Message. Fall back
    // to a simple "older than cursor" filter applied in JS when the
    // cursor is present.
    const filtered = cursor
      ? rows.filter((m) => {
          if (m.createdAt < cursor!.createdAt) return true;
          if (m.createdAt.getTime() === cursor!.createdAt.getTime() && m.id < cursor!.id) return true;
          return false;
        })
      : rows;

    const sliced = filtered.slice(0, limit);
    const hasMore = filtered.length > limit;
    const nextCursor = hasMore ? sliced[sliced.length - 1].id : null;

    return NextResponse.json({
      messages: sliced,
      nextCursor,
    });
  } catch (e) {
    console.error("[/api/messages GET]", e);
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in to leave a message." }, { status: 401 });
  }

  let body: { content?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const content = (body.content ?? "").trim();
  if (content.length === 0) {
    return NextResponse.json({ error: "Message cannot be empty." }, { status: 400 });
  }
  if (content.length > 1000) {
    return NextResponse.json({ error: "Message is too long (1000 char max)." }, { status: 400 });
  }

  const userId = (session.user as any).id as string;
  if (!userId) {
    return NextResponse.json({ error: "Session is missing user id." }, { status: 401 });
  }

  try {
    const created = await prisma.message.create({
      data: {
        content,
        authorId: userId,
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    });
    return NextResponse.json({ message: created });
  } catch (e) {
    console.error("[/api/messages POST]", e);
    return NextResponse.json({ error: "Failed to post message." }, { status: 500 });
  }
}
