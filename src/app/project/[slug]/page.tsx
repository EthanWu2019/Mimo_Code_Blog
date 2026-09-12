import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { getFallbackProjects } from '@/lib/projects-fallback';
import {
  CATEGORY_LABEL,
  STATUS_LABEL,
  STATUS_STYLE,
  type ProjectItem,
} from '@/lib/project-types';

/**
 * /project/[slug] — single-project case study page.
 *
 * Data source mirrors /api/projects: DB row first, curated fallback
 * dataset second, 404 when neither has the slug.
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
  if (!p) return { title: 'Not Found' };
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

  return (
    <div className="min-h-[calc(100vh-80px)] px-4 sm:px-6 py-10 sm:py-14">
      <article className="max-w-4xl mx-auto">
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
          <p className="mt-3 text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {p.tagline}
          </p>
        </header>

        {/* Cover */}
        {p.coverImage && (
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 mb-10 bg-zinc-100 dark:bg-zinc-900">
            <Image
              src={p.coverImage}
              alt={p.title}
              fill
              sizes="(min-width: 896px) 896px, 100vw"
              className="object-cover"
            />
          </div>
        )}

        {/* Description */}
        <section className="mb-10">
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 font-medium mb-4">
            About
          </h2>
          <p className="text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {p.description}
          </p>
        </section>

        {/* Highlights */}
        {p.highlights && p.highlights.length > 0 && (
          <section className="mb-10">
            <h2 className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 font-medium mb-4">
              Highlights
            </h2>
            <ul className="space-y-2.5">
              {p.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 shrink-0" />
                  {h}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Tech */}
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

        {/* Links */}
        {(p.link || p.repo) && (
          <div className="flex flex-wrap items-center gap-4 pt-2">
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
      </article>
    </div>
  );
}
