'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CATEGORY_LABEL,
  STATUS_LABEL,
  STATUS_STYLE,
  type ProjectItem,
  type ProjectTier,
} from '@/lib/project-types';

/* ───────────────────────────── search/filter helpers ───────────────────────────── */

function matches(query: string, project: ProjectItem): boolean {
  if (!query.trim()) return true;
  const needle = query.toLowerCase();
  if (project.title.toLowerCase().includes(needle)) return true;
  if (project.tagline.toLowerCase().includes(needle)) return true;
  if (project.description.toLowerCase().includes(needle)) return true;
  if (project.tech.some((t) => t.toLowerCase().includes(needle))) return true;
  return false;
}

/* ───────────────────────────── shared shell ───────────────────────────── */

function SectionHeader({
  eyebrow,
  title,
  blurb,
}: {
  eyebrow: string;
  title: string;
  blurb: string;
}) {
  return (
    <header className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-[1px] bg-zinc-300 dark:bg-zinc-700" />
        <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 font-medium">
          {eyebrow}
        </span>
      </div>
      <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-zinc-900 dark:text-white leading-[1.0] mb-3">
        {title}
      </h2>
      <p className="text-zinc-600 dark:text-zinc-400 text-base max-w-2xl leading-relaxed">
        {blurb}
      </p>
    </header>
  );
}

function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative w-full md:max-w-md">
      <svg
        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500 pointer-events-none"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 pl-10 pr-10 rounded-full bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center"
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
          </svg>
        </button>
      )}
    </div>
  );
}

/* ───────────────────────────── link buttons ───────────────────────────── */

function GithubIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
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

function ExternalIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7M21 5v6h-6M10 5H7a2 2 0 002 2v10a2 2 0 002 2h10a2 2 0 002-2v-3" />
    </svg>
  );
}

function ArrowRightIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

function PillaLink({
  href,
  icon,
  label,
  variant = 'soft',
  external = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  variant?: 'solid' | 'soft' | 'ghost';
  external?: boolean;
}) {
  const base =
    'inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium transition-all duration-150 active:scale-[0.98]';
  const variants = {
    solid:
      'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-100 shadow-sm',
    soft:
      'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800/60',
    ghost:
      'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white',
  };
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={`${base} ${variants[variant]}`}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}

function ProjectActions({ p, layout }: { p: ProjectItem; layout: 'major' | 'vibe' }) {
  const hasRepo = !!p.repo;
  const hasLive = !!p.link;
  return (
    <div className="mt-3 flex items-center gap-2 flex-wrap">
      <PillaLink
        href={`/project/${p.slug}`}
        icon={<ArrowRightIcon className="w-3 h-3" />}
        label={layout === 'major' ? 'Case study' : 'Open'}
        variant={layout === 'major' ? 'soft' : 'ghost'}
      />
      {hasLive && (
        <PillaLink
          href={p.link as string}
          icon={<ExternalIcon className="w-3 h-3" />}
          label="Live"
          variant={layout === 'major' ? 'soft' : 'solid'}
          external
        />
      )}
      {hasRepo && (
        <PillaLink
          href={p.repo as string}
          icon={<GithubIcon className="w-3 h-3" />}
          label="Source"
          variant={layout === 'major' ? 'solid' : 'soft'}
          external
        />
      )}
    </div>
  );
}

/* ───────────────────────────── MAJOR card ───────────────────────────── */

function MajorCard({ p }: { p: ProjectItem }) {
  return (
    <article className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 overflow-hidden hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-200 flex flex-col">
      <div className="relative aspect-[16/9] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        {p.coverImage ? (
          // Using <img> instead of next/image: the cover URLs come from
          // arbitrary external sources (owner may add URLs to whatever
          // image hosting they like), and we don't want a build-time
          // config dance for each new project.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.coverImage}
            alt={p.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-400 dark:text-zinc-600 text-xs uppercase tracking-wider">
            No cover yet
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span
            className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-full border backdrop-blur-sm bg-white/80 dark:bg-black/50 ${STATUS_STYLE[p.status]}`}
          >
            {STATUS_LABEL[p.status]}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-full border backdrop-blur-sm bg-white/80 dark:bg-black/50 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200">
            {CATEGORY_LABEL[p.category]}
          </span>
        </div>
        <div className="absolute bottom-3 right-3 text-[10px] tabular-nums text-white/90 dark:text-white/70 font-medium bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded">
          {p.year}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <Link href={`/project/${p.slug}`} className="block group/title">
          <h3
            className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white leading-tight mb-2 group-hover/title:text-zinc-600 dark:group-hover/title:text-zinc-300 transition-colors"
            dangerouslySetInnerHTML={{ __html: p.title }}
          />
        </Link>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
          {p.tagline}
        </p>

        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-5 line-clamp-3">
          {p.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {p.tech.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 text-[11px] text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 rounded-md"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <ProjectActions p={p} layout="major" />
        </div>
      </div>
    </article>
  );
}

function MajorSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-pulse"
        >
          <div className="aspect-[16/9] bg-zinc-200 dark:bg-zinc-900" />
          <div className="p-6 space-y-3">
            <div className="h-6 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-4 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-4 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ───────────────────────────── VIBE row ───────────────────────────── */

function VibeRow({ p }: { p: ProjectItem }) {
  return (
    <article className="group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-200 flex flex-col p-3">
      {/* Top row: cover + meta. Not a full-row <Link> so the action
          buttons below can each have their own <a> with target=_blank. */}
      <div className="flex gap-4">
        <Link
          href={`/project/${p.slug}`}
          aria-label={`Open ${p.title} case study`}
          className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-900 group/cover"
        >
          {p.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.coverImage}
              alt={p.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover/cover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-600 text-[10px] uppercase tracking-wider">
              No cover
            </div>
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 mb-1">
            <Link href={`/project/${p.slug}`} className="block min-w-0">
              <h4
                className="text-base font-semibold tracking-tight text-zinc-900 dark:text-white truncate group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors"
                dangerouslySetInnerHTML={{ __html: p.title }}
              />
            </Link>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 tabular-nums flex-shrink-0">
              {p.year}
            </span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-3">
            {p.tagline}
          </p>
          <div className="flex flex-wrap gap-1">
            {p.tech.slice(0, 3).map((t) => (
              <span
                key={t}
                className="px-1.5 py-0.5 text-[10px] text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 rounded-md"
              >
                {t}
              </span>
            ))}
            {p.tech.length > 3 && (
              <span className="px-1.5 py-0.5 text-[10px] text-zinc-500 dark:text-zinc-500 rounded-md">
                +{p.tech.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
      {/* Bottom action bar: GitHub + Live + Detail. Glassy chip row
          separated by a soft hairline divider. */}
      <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/70">
        <ProjectActions p={p} layout="vibe" />
      </div>
    </article>
  );
}

function VibeSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 animate-pulse"
        >
          <div className="w-28 h-28 rounded-lg bg-zinc-200 dark:bg-zinc-900" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-3 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ───────────────────────────── main page ───────────────────────────── */

export default function ProjectPage() {
  const [major, setMajor] = useState<ProjectItem[]>([]);
  const [vibe, setVibe] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [majorQuery, setMajorQuery] = useState('');
  const [vibeQuery, setVibeQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [a, b] = await Promise.all([
          fetch('/api/projects?tier=major', { cache: 'no-store' }).then((r) => r.json()),
          fetch('/api/projects?tier=vibe', { cache: 'no-store' }).then((r) => r.json()),
        ]);
        if (cancelled) return;
        setMajor(Array.isArray(a.projects) ? a.projects : []);
        setVibe(Array.isArray(b.projects) ? b.projects : []);
        setLoading(false);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Failed to load');
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredMajor = useMemo(
    () => major.filter((p) => matches(majorQuery, p)),
    [major, majorQuery]
  );
  const filteredVibe = useMemo(
    () => vibe.filter((p) => matches(vibeQuery, p)),
    [vibe, vibeQuery]
  );

  return (
    <div className="min-h-[100dvh] pt-24 pb-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Hero — unchanged across versions, brief context for visitors */}
        <section className="mb-20">
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
            engineering, machine-learning experiments, and tools I built so I could build
            other things faster. Major work lives below; smaller vibe-coded experiments
            are in the next section.
          </p>
        </section>

        {/* ───────────── MAJOR section ───────────── */}
        <section className="mb-24">
          <SectionHeader
            eyebrow="Section 01 · Major work"
            title="Major Projects"
            blurb="Ships I want recruiters to read first — full-stack product engineering, ML systems, and anything built to live in production."
          />

          <div className="mb-6">
            <SearchInput
              value={majorQuery}
              onChange={setMajorQuery}
              placeholder="Search major projects by name, tech, or description…"
            />
          </div>

          {loading ? (
            <MajorSkeleton />
          ) : !loading && error ? (
            <div className="rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 p-6">
              <p className="text-red-700 dark:text-red-300 text-sm">
                Could not load projects: {error}.
              </p>
            </div>
          ) : filteredMajor.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-12 text-center">
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                {major.length === 0
                  ? 'No major projects yet.'
                  : `No major projects match “${majorQuery}”.`}
              </p>
              {majorQuery && major.length > 0 && (
                <button
                  onClick={() => setMajorQuery('')}
                  className="mt-3 text-xs text-zinc-700 dark:text-zinc-300 underline underline-offset-2"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredMajor.map((p) => (
                <MajorCard key={p.id} p={p} />
              ))}
            </div>
          )}
        </section>

        {/* ───────────── VIBE section ───────────── */}
        <section className="mb-16">
          <SectionHeader
            eyebrow="Section 02 · Small experiments"
            title="Vibe Coding"
            blurb="Quick experiments, weekend projects, and tools I built to scratch an itch. Each one is short, fun, and a real thing."
          />

          <div className="mb-6">
            <SearchInput
              value={vibeQuery}
              onChange={setVibeQuery}
              placeholder="Search vibe projects by name, tech, or description…"
            />
          </div>

          {loading ? (
            <VibeSkeleton />
          ) : !loading && error ? (
            <div className="rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 p-6">
              <p className="text-red-700 dark:text-red-300 text-sm">
                Could not load projects: {error}.
              </p>
            </div>
          ) : filteredVibe.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-12 text-center">
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                {vibe.length === 0
                  ? 'No vibe projects yet.'
                  : `No vibe projects match “${vibeQuery}”.`}
              </p>
              {vibeQuery && vibe.length > 0 && (
                <button
                  onClick={() => setVibeQuery('')}
                  className="mt-3 text-xs text-zinc-700 dark:text-zinc-300 underline underline-offset-2"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVibe.map((p) => (
                <VibeRow key={p.id} p={p} />
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <section className="pt-12 border-t border-zinc-200 dark:border-zinc-800">
          <div className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
            <p className="mb-3">
              <span className="text-zinc-900 dark:text-white font-medium">
                Hiring manager &amp; recruiter friendly:
              </span>{' '}
              every project links to a case study with the problem, stack, tradeoffs, and
              outcome. If you only have 60 seconds, skim the highlighted bullet points on each
              card.
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
