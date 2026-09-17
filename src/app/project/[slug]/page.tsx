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
 * Layout (PC): cover image downsized on the left, contribution
 * sidebar on the right, then the full-width linear chapter timeline
 * below. The cover is intentionally not 16:9 full-bleed anymore — it
 * was hijacking attention away from the actual case study text.
 *
 * Preferred layout: `chapters` — one linear timeline that mixes the
 * story and the technical contributions in a single flow. Chapters
 * flagged `contribution: true` get a "MY CONTRIBUTION" badge; any
 * chapter can carry highlighted link pills (source repos, live
 * sites). Projects without chapters fall back to the older
 * detailSections masonry + story timeline, then to the plain
 * description.
 *
 * Buttons under the cover are typed per available surface: GitHub
 * (only when `repo` is set), Live (only when `link` is set). No
 * default "Open" button that fakes both.
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

function GithubIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ExternalIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7M21 5v6h-6M10 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-3" />
    </svg>
  );
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await findProject(slug);
  if (!p) notFound();

  const hasChapters = (p.chapters?.length ?? 0) > 0;
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

        {/* Cover + contribution sidebar — side by side on PC, stacked on mobile.
            The cover is downsized (max-w-md) so it doesn't dominate the page. */}
        <div className="mb-10 grid grid-cols-1 lg:grid-cols-[minmax(0,28rem)_1fr] gap-6">
          {/* Cover */}
          {p.coverImage && (
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
              <Image
                src={p.coverImage}
                alt={p.title}
                fill
                sizes="(min-width: 1024px) 28rem, 100vw"
                className="object-cover"
              />
            </div>
          )}

          {/* Contribution sidebar — short, scannable list of what the
              owner personally contributed to this project. Renders
              only when at least one bullet exists. */}
          {p.contributions && p.contributions.length > 0 && (
            <aside className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-5 lg:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="px-2.5 py-0.5 rounded-full border border-zinc-900 dark:border-white text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-900 dark:text-white">
                  My contribution
                </div>
                <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
              </div>
              <ul className="space-y-2.5">
                {p.contributions.map((c, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-white shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
              {/* Optional reach stats — owner asked for "20k+ daily msgs" etc. */}
              {p.contributionStats && p.contributionStats.length > 0 && (
                <div className="mt-5 pt-5 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-2 gap-4">
                  {p.contributionStats.map((s, i) => (
                    <div key={i}>
                      <div className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white tabular-nums">
                        {s.value}
                      </div>
                      <div className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </aside>
          )}
        </div>

        {/* Typed buttons under cover. GitHub only when repo exists, Live only
            when link exists. No default "Open" button. */}
        {(p.link || p.repo) && (
          <div className="flex flex-wrap items-center gap-3 mb-12">
            {p.link && (
              <a
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-colors"
              >
                <ExternalIcon className="w-3.5 h-3.5" />
                Live
              </a>
            )}
            {p.repo && (
              <a
                href={p.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
              >
                <GithubIcon className="w-4 h-4" />
                GitHub
              </a>
            )}
          </div>
        )}

        {/* ── Linear narrative: one timeline, story + contributions ── */}
        {hasChapters ? (
          <section className="mb-14 max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-sm uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 font-medium">
                The story, end to end
              </h2>
              <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <ol className="relative space-y-12 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-px before:bg-zinc-200 dark:before:bg-zinc-800">
              {p.chapters!.map((c, i) => (
                <li key={i} className="relative pl-12">
                  {/* timeline node */}
                  <span className="absolute left-0 top-1 flex items-center justify-center w-8 h-8 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  {/* era label + contribution badge */}
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                      {c.era}
                    </span>
                    {c.contribution && (
                      <span className="px-2.5 py-0.5 rounded-full border border-zinc-900 dark:border-white text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-900 dark:text-white">
                        My contribution
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl md:text-[28px] font-bold tracking-tight text-zinc-900 dark:text-white leading-tight mb-3">
                    {c.heading}
                  </h3>

                  <p className="text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
                    {c.body}
                  </p>

                  {/* highlighted chapter links */}
                  {c.links && c.links.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {c.links.map((l) => (
                        <a
                          key={l.href}
                          href={l.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-colors"
                        >
                          {l.label}
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M9 7h8v8" />
                          </svg>
                        </a>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </section>
        ) : (
          <>
            {/* ── Fallback: masonry sections ── */}
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

            {/* ── Fallback: story timeline ── */}
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
          </>
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
