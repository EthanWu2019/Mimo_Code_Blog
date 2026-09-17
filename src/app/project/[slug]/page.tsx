import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { getFallbackProjects } from '@/lib/projects-fallback';
import {
  CATEGORY_LABEL,
  STATUS_LABEL,
  type ProjectItem,
} from '@/lib/project-types';

/**
 * /project/[slug] — single-project case study page.
 *
 * Data source mirrors /api/projects: DB row first, curated fallback
 * dataset second, 404 when neither has the slug.
 *
 * When a project carries `detailSections`, they render as a masonry
 * card grid (CSS columns) so contributions read as distinct blocks
 * instead of one wall of text. `story` renders as a numbered
 * timeline. Projects without those fields fall back to the plain
 * description paragraph.
 */

async function findProject(slug: string): Promise<ProjectItem | null> {
  try {
    const row = await prisma.project.findUnique({ where: { slug } });
    if (row) return row as unknown as ProjectItem;
  } catch (e) {
    console.warn('[project/[slug]] DB read failed', e);
  }
  return getFallbackProjects().find((p) => p.slug === slug) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await findProject(slug);
  // Throw during the metadata phase: once the page has started
  // streaming, a notFound() call can only fall back to the built-in
  // NEXT_HTTP_ERROR_FALLBACK;404 page. Throwing here keeps the 404
  // inside the metadata/head phase, so the custom not-found.tsx
  // renders instead of the default white error shell.
  if (!p) notFound();
  return {
    title: p.title,
    description: p.tagline,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await findProject(slug);
  if (!p) notFound();

  const hasSections = (p.detailSections?.length ?? 0) > 0;
  const hasStory = (p.story?.length ?? 0) > 0;

  return (
    <div className="min-h-[calc(100vh-80px)] px-4 sm:px-6 py-10 sm:py-14">
      <article className="max-w-5xl mx-auto">
        {/* Back link */}
        <Link
          href="/project"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          All projects
        </Link>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-zinc-300 dark:bg-zinc-700" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 font-medium">
              {CATEGORY_LABEL[p.category]} · {STATUS_LABEL[p.status]} · {p.year}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-zinc-900 dark:text-white leading-[1.05]">
            {p.title}
          </h1>
          <p className="mt-3 text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl">
            {p.tagline}
          </p>
        </header>

        {/* Cover */}
        {p.coverImage && (
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 mb-8 bg-zinc-100 dark:bg-zinc-900">
            <Image
              src={p.coverImage}
              alt={p.title}
              fill
              sizes="(min-width: 1024px) 1024px, 100vw"
              className="object-cover"
            />
          </div>
        )}

        {/* Primary links — surfaced early, hiring managers click here */}
        {(p.link || p.repo) && (
          <div className="flex flex-wrap items-center gap-3 mb-12">
            {p.link && (
              <a
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-colors"
              >
                Open live site
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M9 7h8v8" />
                </svg>
              </a>
            )}
            {p.repo && (
              <a
                href={p.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2.9-.3 1.9-.4 2.9-.4s2 .1 2.9.4c2.3-1.2 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.7.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9 0-6.3-5.2-11.5-11.5-11.5z" />
                </svg>
                Source code
              </a>
            )}
          </div>
        )}

        {/* Contributions — masonry card grid */}
        {hasSections ? (
          <section className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-sm uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 font-medium">
                About &amp; my contributions
              </h2>
              <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="columns-1 md:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
              {p.detailSections!.map((s, i) => (
                <div
                  key={i}
                  className="break-inside-avoid mb-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-5"
                >
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-2 leading-snug">
                    {s.heading}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-sm uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 font-medium">
                About
              </h2>
              <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <p className="text-base text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-2xl whitespace-pre-line">
              {p.description}
            </p>
          </section>
        )}

        {/* Story — numbered timeline */}
        {hasStory && (
          <section className="mb-14">
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-sm uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 font-medium">
                The story
              </h2>
              <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <ol className="relative space-y-8 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-px before:bg-zinc-200 dark:before:bg-zinc-800">
              {p.story!.map((para, i) => (
                <li key={i} className="relative pl-12">
                  <span className="absolute left-0 top-1 flex items-center justify-center w-8 h-8 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    {i + 1}
                  </span>
                  <p className="text-sm md:text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
                    {para}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Stack */}
        {p.tech.length > 0 && (
          <section className="mb-10">
            <h2 className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 font-medium mb-4">
              Stack
            </h2>
            <ul className="flex flex-wrap gap-2">
              {p.tech.map((t) => (
                <li
                  key={t}
                  className="px-3 py-1 text-xs font-medium rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/50"
                >
                  {t}
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </div>
  );
}
