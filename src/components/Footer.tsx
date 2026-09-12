/**
 * SiteFooter
 *
 * Global footer that appears on every public page except the 404
 * experience (which renders outside this layout subtree — see
 * app/not-found.tsx).
 *
 * Layout: three labelled blocks (About / Navigate / Connect) rendered
 * as distinct, separated groups rather than a single 3-column grid.
 * Each block sits in its own rounded bordered card with consistent
 * padding, so the eye reads them as "three things in a row" rather
 * than "three things crammed into the same grid row".
 *
 * The mobile layout stacks the three blocks vertically with explicit
 * gaps between them; on sm+ they sit on one row.
 *
 * Personal info the owner wanted surfaced here:
 *   GitHub:    https://github.com/EthanWu2019
 *   LinkedIn:  https://www.linkedin.com/in/chengze-wu-3398a0224/
 *   Cafe:      https://ethanwu.cafe/  (life-side blog)
 *   Email:     ethanwucz2019@gmail.com  (mailto)
 *   Phone:     intentionally omitted (owner decision)
 */

const NAV_LINKS: { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Writing" },
  { href: "/project", label: "Projects" },
  { href: "/resume", label: "Resume" },
  { href: "/gallery", label: "Gallery" },
  { href: "/photography", label: "Photography" },
];

const SOCIAL: { href: string; label: string; svg: React.ReactNode }[] = [
  {
    href: "https://github.com/EthanWu2019",
    label: "Ethan Wu on GitHub",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 .5C5.65.5.4 5.75.4 12.1c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-1.97c-3.2.69-3.87-1.55-3.87-1.55-.52-1.34-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11.06 11.06 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.05.78 2.12v3.14c0 .31.21.67.8.55C20.31 21.48 23.6 17.18 23.6 12.1 23.6 5.75 18.35.5 12 .5Z" />
      </svg>
    ),
  },
  {
    href: "https://www.linkedin.com/in/chengze-wu-3398a0224/",
    label: "Chengze Wu on LinkedIn",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M20.45 20.45h-3.55v-5.56c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.95v5.65h-3.55V9h3.41v1.56h.05c.48-.9 1.65-1.85 3.4-1.85 3.62 0 4.29 2.38 4.29 5.49v6.25zM5.34 7.43c-1.14 0-2.06-.94-2.06-2.06 0-1.13.92-2.07 2.06-2.07 1.14 0 2.07.94 2.07 2.07 0 1.12-.93 2.06-2.07 2.06zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.8 0 0 .78 0 1.74v20.52C0 23.22.8 24 1.77 24h20.46c.97 0 1.77-.78 1.77-1.74V1.74C24 .78 23.2 0 22.23 0z" />
      </svg>
    ),
  },
  {
    // ethanwu.cafe — the owner's slower, life-side blog. Same icon-chip
    // treatment as GitHub/LinkedIn above; opens in a new tab via the
    // target=_blank on the SOCIAL anchor in the render block.
    href: "https://ethanwu.cafe/",
    label: "我的咖啡厅 — Ethan Wu's life blog",
    svg: (
      // outline coffee cup with two rising steam wisps
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M5 9h11v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9z" />
        <path d="M16 11h2a2 2 0 0 1 0 4h-2" />
        <path d="M8 5c-.5 1 .5 1.5 0 2.5" />
        <path d="M11 5c-.5 1 .5 1.5 0 2.5" />
      </svg>
    ),
  },
];

// Small helper used in every block to keep the heading style consistent.
// Each block has its own label; the block content sits below it with a
// consistent mt-3 gap, so the labels visually align across columns.
function BlockLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500 font-medium">
      {children}
    </p>
  );
}

export default function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200/60 dark:border-zinc-800/60 mt-12 sm:mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/*
          Three blocks rendered as a flex column on mobile, a 3-column
          grid on sm+. Each block is its own bordered rounded card so
          they read as distinct groups. We use a top hairline inside
          each card (border-t on the content area) so when multiple
          blocks stack, the eye gets a subtle horizontal break before
          each label.
        */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {/* Block 1 — About */}
          <section className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-zinc-50/40 dark:bg-white/[0.02] p-5 sm:p-6">
            <BlockLabel>About</BlockLabel>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              <span className="text-zinc-900 dark:text-white">Chengze Wu</span>
              {" "}— also goes by Ethan. CS undergrad + grad student at WashU.
            </p>
            <a
              href="mailto:ethanwucz2019@gmail.com"
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white underline underline-offset-4 decoration-zinc-300 dark:decoration-zinc-700 hover:decoration-zinc-500 transition-colors"
            >
              ethanwucz2019@gmail.com
            </a>
          </section>

          {/* Block 2 — Navigate */}
          <section className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-zinc-50/40 dark:bg-white/[0.02] p-5 sm:p-6">
            <BlockLabel>Navigate</BlockLabel>
            <ul className="mt-3 grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-zinc-600 dark:text-zinc-300">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>

          {/* Block 3 — Connect */}
          <section className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-zinc-50/40 dark:bg-white/[0.02] p-5 sm:p-6">
            <BlockLabel>Connect</BlockLabel>
            <ul className="mt-3 flex flex-wrap items-center gap-3 text-zinc-500 dark:text-zinc-400">
              {SOCIAL.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    aria-label={s.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-zinc-200/70 dark:border-zinc-800/70 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
                  >
                    <span className="w-5 h-5 block">{s.svg}</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              The fastest way to reach me is email. The icons above open in a new tab.
            </p>
          </section>
        </div>

        {/* Bottom strip — single thin row, deliberately separated from
            the three blocks above by a hairline + extra top padding so it
            reads as a footer-of-the-footer, not part of the third block. */}
        <div className="mt-10 pt-6 border-t border-zinc-200/60 dark:border-zinc-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
          <span>&copy; 2026 Chengze Wu</span>
          <span>ethanwu.work — full-stack work &amp; selected writing</span>
        </div>
      </div>
    </footer>
  );
}
