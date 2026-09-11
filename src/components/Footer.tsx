/**
 * SiteFooter
 *
 * Global footer that appears on every public page except the 404
 * experience (which renders outside this layout subtree — see
 * app/not-found.tsx). The editorial voice is the same as the rest of
 * the site: a hairline divider on top, three compact columns of
 * content, then a status line at the very bottom.
 *
 * Personal info the owner wanted surfaced here:
 *   GitHub:    https://github.com/EthanWu2019
 *   LinkedIn:  https://www.linkedin.com/in/chengze-wu-3398a0224/
 *   Email:     ethanwucz2019@gmail.com  (mailto)
 *   Phone:     intentionally omitted (owner decision)
 *
 * Implementation notes
 *  - Server component. No client JS, no framer-motion. The status dot
 *    uses Tailwind's `animate-pulse` utility.
 *  - All four icons are inline SVG with a 20x20 viewBox.
 *  - The bottom line uses `tabular-nums` so the year column never
 *    reflows in a different width.
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
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.66-.27.66-.6v-2.16c-3.2.7-3.87-1.65-3.87-1.65-.52-1.34-1.27-1.62-1.27-1.62-1.04-.71.08-.7.08-.7.7 0-1.2.65-1.83.15-1.79-2.8 0-.66-.24-1.2-.15-1.53.12-.16.33-.51.55-.64-.91-.59-1.49-.65-2.27-.66-.5 0-1.21.18-1.85.66-.19.55-1.04 1.66-1.85.66-.66 1.84-.66 3.66 0 4.18 2.18 5.36 1.55.13-.97.55-1.55 1.18-.99.18-1.59.18-2.85 0-1.66-.59-3.04-1.55-3.7 1.96-1.1 1.84-1.97 1.97-3.66.04-.27.18-1.1.18-2.21 0-.88-.07-1.62-.17-2.31 1.45-1.06 2.1-2.71 1.45-3.65 0-2.66-.66-3.66-1.65-1.65-.04-.12-.15-.16-.29-.06-.18-.06-.42-.06h-.55c-.18 0-.32.06-.42.06-.14.01-.26.04-.29.16a.83.83 0 0 0-.06.55c0 .1-.02.18-.06.27-.05.13-.04.27-.04.4v4.14c0 .27.04.51.16.7.27.45.93 1.05 1.45 1.93 2.62 2.27 1.13.65 2.6 1.07 3.93.65.97.86 2.65 1.34 4.06 1.21.5-.05.91-.13 1.27-.23v2.16c0 .33.08.71.66.6C18.71 21.39 12 21.5 12 21.5c-6.16 0-11.41-4.81-12.92-11.13.86.51.32 1.45 1.46 2.65.99.18 1.05.66 1.18 1.4.16.69 1.13 1.85 1.27 2.1 1.5 1.39-.36 2.65-1.05 2.65-2.06 0-.92-.43-1.66-1.05-1.85-.74-.71-1.45-.74-1.45-1.49 0-.9.7-1.65 1.65-1.83.79-.15 1.55-.45 1.6-1.45.06-.2.13-.79.2-1.31v-1.85c0-.65.39-1.32 1.78-1.85.96-.34 2.06-.5 2.84-.5 1.45 0 2.62.34 3.49 1.04.49.4.9 1.18 1.21 1.86.13.34.32.55.85.99 1.42 1.4 1.65.43.21.91 1.42 1.86 1.55.18 1.06.6 1.45.97z"
        />
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
    href: "mailto:ethanwucz2019@gmail.com",
    label: "Email Ethan",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    ),
  },
  {
    href: "/blog.rss",
    label: "Blog RSS",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.36 20 6.18 20A2.18 2.18 0 0 1 4 17.82a2.18 2.18 0 0 1 2.18-2.18zm0-4.36a6.54 6.54 0 0 1 6.54 6.54C12.72 19.46 11.36 20.82 9.27 20.82A6.55 6.55 0 0 1 2.73 14.27 6.55 6.55 0 0 1 9.27 7.73zM6.18 4a14 14 0 0 1 14 14C20 18 19.36 20.5 18 20.5 17.09 20.5 16.18 19.59 16.18 18.5A11.27 11.27 0 0 0 4.91 7.18 11.27 11.27 0 0 0 4.91 4 6.18 4 6.18 4z" />
      </svg>
    ),
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200/60 dark:border-zinc-800/60 mt-12 sm:mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10">
          {/* Column 1 — About */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500 font-medium">
              About
            </p>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Software engineer in St. Louis. Building for the web,
              writing about the craft. Also answers to{" "}
              <span className="text-zinc-900 dark:text-white">Chengze</span>{" "}
              (吴承泽), which is the name on the passport.
            </p>
          </div>

          {/* Column 2 — Navigate */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500 font-medium">
              Navigate
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-y-1.5 gap-x-4 text-sm text-zinc-600 dark:text-zinc-300">
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
          </div>

          {/* Column 3 — Connect */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500 font-medium">
              Connect
            </p>
            <ul className="mt-3 flex flex-wrap items-center gap-3 text-zinc-500 dark:text-zinc-400">
              {SOCIAL.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    aria-label={s.label}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-zinc-200/70 dark:border-zinc-800/70 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
                  >
                    <span className="w-5 h-5 block">{s.svg}</span>
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="mailto:ethanwucz2019@gmail.com"
              className="mt-3 inline-block text-sm text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white underline underline-offset-4 decoration-zinc-300 dark:decoration-zinc-700 hover:decoration-zinc-500 transition-colors"
            >
              ethanwucz2019@gmail.com
            </a>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-zinc-200/60 dark:border-zinc-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500 tabular-nums">
          <span>&copy; 2026 Ethan Wu</span>
          <span className="inline-flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Built with Next.js · Vercel</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
