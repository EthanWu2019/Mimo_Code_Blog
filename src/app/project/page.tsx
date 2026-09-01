'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type ProjectStatus = 'shipped' | 'in-progress' | 'archived';
type ProjectCategory = 'web' | 'ml' | 'mobile' | 'systems' | 'tooling' | 'experiment';

interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  tech: string[];
  highlights?: string[];
  link?: string | null;
  repo?: string | null;
  coverImage?: string | null;
  featured: boolean;
  sortOrder: number;
  year: number;
  createdAt?: string;
  updatedAt?: string;
}

const CATEGORY_LABEL: Record<ProjectCategory, string> = {
  web: 'Web',
  ml: 'ML / AI',
  mobile: 'Mobile',
  systems: 'Systems',
  tooling: 'Tooling',
  experiment: 'Experiment',
};

const STATUS_LABEL: Record<ProjectStatus, string> = {
  shipped: 'Shipped',
  'in-progress': 'In progress',
  archived: 'Archived',
};

const STATUS_STYLE: Record<ProjectStatus, string> = {
  shipped: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  'in-progress': 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
  archived: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
};

export default function ProjectPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | ProjectCategory>('all');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/projects', { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => {
        if (cancelled) return;
        setProjects(Array.isArray(d.projects) ? d.projects : []);
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Failed to load');
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered =
    activeFilter === 'all' ? projects : projects.filter((p) => p.category === activeFilter);

  const categories: Array<'all' | ProjectCategory> = [
    'all',
    'web',
    'ml',
    'mobile',
    'systems',
    'tooling',
    'experiment',
  ];

  return (
    <div className="min-h-[100dvh] pt-24 pb-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-[1px] bg-zinc-300 dark:bg-zinc-700" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 font-medium">
              Selected Work · For Hiring Managers
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-zinc-900 dark:text-white leading-[0.95] mb-6">
            Projects
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl leading-relaxed">
            A curated index of the systems and prototypes I&apos;ve built — full-stack product
            engineering, machine learning experiments, and tools I built so I could build other
            things faster. Click through for the tech stack, the why, and what shipped.
          </p>
        </section>

        {/* Filter bar */}
        <div className="mb-12">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((c) => {
              const active = c === activeFilter;
              const label = c === 'all' ? 'All' : CATEGORY_LABEL[c];
              return (
                <button
                  key={c}
                  onClick={() => setActiveFilter(c)}
                  className={`px-4 h-9 rounded-full text-sm transition-all duration-150 border ${
                    active
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white'
                      : 'bg-transparent text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 h-64 animate-pulse"
              >
                <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded mb-4" />
                <div className="h-8 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded mb-3" />
                <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded mb-2" />
                <div className="h-4 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 p-6">
            <p className="text-red-700 dark:text-red-300 text-sm">
              Could not load projects: {error}. The API may not be deployed yet — come back soon.
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-16 text-center">
            <p className="text-zinc-500 dark:text-zinc-400">
              {projects.length === 0
                ? 'No projects yet. Ethan is still adding the first batch — check back soon.'
                : 'No projects match this filter.'}
            </p>
          </div>
        )}

        {/* Project grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((p) => (
              <article
                key={p.id}
                className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 p-6 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-full border ${STATUS_STYLE[p.status]}`}
                    >
                      {STATUS_LABEL[p.status]}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      {CATEGORY_LABEL[p.category]}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 tabular-nums">
                    {p.year}
                  </span>
                </div>

                <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-2">
                  {p.title}
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
                  {p.tagline}
                </p>

                {p.description && (
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-5 leading-relaxed line-clamp-4">
                    {p.description}
                  </p>
                )}

                {p.highlights && p.highlights.length > 0 && (
                  <ul className="mb-5 space-y-1.5">
                    {p.highlights.slice(0, 3).map((h, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-zinc-600 dark:text-zinc-400 flex gap-2 leading-relaxed"
                      >
                        <span className="text-zinc-400 dark:text-zinc-600 select-none">→</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex flex-wrap gap-1.5 mb-5">
                  {p.tech.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 text-[11px] text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 rounded-md"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <Link
                    href={`/project/${p.slug}`}
                    className="text-xs font-medium text-zinc-900 dark:text-white hover:underline"
                  >
                    Read case study →
                  </Link>
                  {p.link && (
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    >
                      Live
                    </a>
                  )}
                  {p.repo && (
                    <a
                      href={p.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    >
                      Source
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Footer note */}
        <section className="mt-24 pt-12 border-t border-zinc-200 dark:border-zinc-800">
          <div className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
            <p className="mb-3">
              <span className="text-zinc-900 dark:text-white font-medium">
                Hiring manager &amp; recruiter friendly:
              </span>{' '}
              every project links to a case study with the problem, stack, tradeoffs, and outcome.
              If you only have 60 seconds, skim the highlighted bullet points on each card.
            </p>
            <p>
              Want to see something that isn&apos;t listed?{' '}
              <Link
                href="/blog"
                className="text-zinc-900 dark:text-white underline underline-offset-2"
              >
                Check the blog
              </Link>{' '}
              for write-ups on smaller experiments.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
