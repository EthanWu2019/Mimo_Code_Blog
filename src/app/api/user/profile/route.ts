import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        posts: {
          select: {
            id: true,
            title: true,
            slug: true,
            published: true,
            viewCount: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            post: {
              select: { title: true, slug: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        messages: {
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // isAdmin is computed server-side so the profile UI can hide
    // the "New Post" CTA for non-owners. Owner = email in ADMIN_EMAILS
    // (kept in sync with src/lib/auth.ts).
    const ADMIN_EMAILS = new Set<string>([
      "ethanwucz2019@gmail.com",
      "3401895383@qq.com",
      "ethanwucz2026@gmail.com",
    ]);
    const isAdminUser = ADMIN_EMAILS.has(user.email.toLowerCase());

    return NextResponse.json({
      ...user,
      isAdmin: isAdminUser,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { name, avatar } = await request.json();

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, image: avatar },
      select: { id: true, name: true, image: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
