import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  FALLBACK_PROJECTS,
  getFallbackProjects,
} from '@/lib/projects-fallback';
import {
  VALID_CATEGORIES,
  VALID_STATUSES,
  VALID_TIERS,
  type ProjectItem,
  type ProjectTier,
} from '@/lib/project-types';

/**
 * GET /api/projects[?tier=major|vibe]
 *
 * Reads from Prisma/Neon first. If the table is missing or the DB
 * is unavailable, falls back to the static dataset in
 * lib/projects-fallback.ts so the /project page is never empty.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const tierParam = url.searchParams.get('tier');
  const tier: ProjectTier | undefined =
    tierParam && VALID_TIERS.includes(tierParam as ProjectTier)
      ? (tierParam as ProjectTier)
      : undefined;

  try {
    const projects = await prisma.project.findMany({
      where: tier ? { tier } : undefined,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json({ projects, source: 'db' satisfies 'db', tier: tier ?? 'all' });
  } catch (err) {
    // DB unavailable — fall back to the static seed. The page still works.
    const projects = getFallbackProjects(tier);
    return NextResponse.json({
      projects,
      source: 'fallback' as const,
      tier: tier ?? 'all',
    });
    // Note: FALLBACK_PROJECTS is re-exported so creators / admins can
    // inspect it from a server-only diagnostic route if needed.
    void FALLBACK_PROJECTS;
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<ProjectItem>;
    const {
      slug,
      title,
      tagline,
      description,
      category,
      tier = 'major',
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
        {
          error: 'missing_fields',
          required: ['slug', 'title', 'tagline', 'category', 'description'],
        },
        { status: 400 }
      );
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'invalid_category' }, { status: 400 });
    }
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'invalid_status' }, { status: 400 });
    }
    if (!VALID_TIERS.includes(tier)) {
      return NextResponse.json({ error: 'invalid_tier' }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        slug,
        title,
        tagline,
        description,
        category,
        tier,
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
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === 'P2002') {
      return NextResponse.json({ error: 'slug_taken' }, { status: 409 });
    }
    const message = (err as { message?: string })?.message;
    return NextResponse.json(
      { error: 'create_failed', message },
      { status: 500 }
    );
  }
}
