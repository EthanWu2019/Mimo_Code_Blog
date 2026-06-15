import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const userId = (session.user as any).id;
    const body = await request.json();
    const { title, excerpt, content, tags, published } = body;

    // Find the post and verify ownership
    const existing = await prisma.post.findUnique({
      where: { slug },
      include: { author: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (existing.authorId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Generate new slug if title changed
    let newSlug = slug;
    if (title && title !== existing.title) {
      newSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Check for slug collision (excluding current post)
      if (newSlug !== slug) {
        const collision = await prisma.post.findUnique({ where: { slug: newSlug } });
        if (collision) {
          return NextResponse.json({ error: 'A post with this title already exists' }, { status: 400 });
        }
      }
    }

    // Build update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (content !== undefined) updateData.content = content;
    if (published !== undefined) updateData.published = published;
    if (newSlug !== slug) updateData.slug = newSlug;

    // Handle tags: disconnect removed, connect/create new
    if (tags !== undefined && Array.isArray(tags)) {
      updateData.tags = {
        set: [], // disconnect all existing tags
        connectOrCreate: tags.map((tag: string) => ({
          where: { name: tag },
          create: { name: tag },
        })),
      };
    }

    const post = await prisma.post.update({
      where: { slug },
      data: updateData,
      include: { author: { select: { id: true, name: true, avatar: true } }, tags: true },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}
