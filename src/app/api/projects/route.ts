import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json({ projects });
  } catch (err) {
    // Fallback to empty list — Prisma client / table may not be deployed yet.
    return NextResponse.json({ projects: [], error: 'db_unavailable' });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      slug,
      title,
      tagline,
      description,
      category,
      status = 'shipped',
      tech = [],
      highlights = [],
      link = null,
      repo = null,
      coverImage = null,
      featured = false,
      sortOrder = 0,
      year = new Date().getFullYear(),
    } = body ?? {};

    if (!slug || !title || !tagline || !category || !description) {
      return NextResponse.json(
        { error: 'missing_fields', required: ['slug', 'title', 'tagline', 'category', 'description'] },
        { status: 400 }
      );
    }

    const VALID_CATEGORIES = ['web', 'ml', 'mobile', 'systems', 'tooling', 'experiment'];
    const VALID_STATUSES = ['shipped', 'in-progress', 'archived'];
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'invalid_category' }, { status: 400 });
    }
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'invalid_status' }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        slug,
        title,
        tagline,
        description,
        category,
        status,
        tech,
        highlights,
        link,
        repo,
        coverImage,
        featured,
        sortOrder,
        year,
      },
    });
    return NextResponse.json({ project }, { status: 201 });
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return NextResponse.json({ error: 'slug_taken' }, { status: 409 });
    }
    return NextResponse.json({ error: 'create_failed', message: err?.message }, { status: 500 });
  }
}
