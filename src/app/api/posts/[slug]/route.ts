import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await auth();
    const userId = (session?.user as any)?.id;

    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        tags: true,
      },
    });

    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await prisma.post.update({ where: { slug }, data: { viewCount: { increment: 1 } } });

    const comments = await prisma.comment.findMany({
      where: { postId: post.id, parentId: null },
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
                  orderBy: [{ pinned: 'desc' }, { createdAt: 'asc' }],
                },
              },
              orderBy: [{ pinned: 'desc' }, { createdAt: 'asc' }],
            },
          },
          orderBy: [{ pinned: 'desc' }, { createdAt: 'asc' }],
        },
      },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    });

    const fmt = (c: any): any => ({
      ...c,
      likeCount: c.likes.length,
      liked: userId ? c.likes.some((l: any) => l.userId === userId) : false,
      likes: undefined,
      replies: c.replies?.map(fmt),
    });

    const sorted = comments.map(fmt).sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return (b.likeCount * 3) - (a.likeCount * 3);
    });

    return NextResponse.json({ ...post, comments: sorted });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { title, content, excerpt, coverImage, published, tags } = body;

    const post = await prisma.post.update({
      where: { slug },
      data: {
        title, content, excerpt, coverImage, published,
        tags: tags ? { set: [], connectOrCreate: tags.map((tag: string) => ({ where: { name: tag }, create: { name: tag } })) } : undefined,
      },
      include: { author: true, tags: true },
    });
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await prisma.post.delete({ where: { slug } });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
