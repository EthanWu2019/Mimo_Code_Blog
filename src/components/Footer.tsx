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
      <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden>
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.09.33-.2.66-.2.97v1.86c-2.78-.6-3.36 1.16-3.36 1.16-.91 2.32-2.23 2.32-2.23 1.21-1.96.07-1.83-.13-1.83 1.07-1.46 1.62-1.78 1.07-1.07-.13-1.07.13-1.62.42-1.94.05-.36-.21-1.05-.21-1.65 0-1.43 1.05-1.95 1.05-1.95 0-2.34-1.84-3.21-3.85-3.38.27-.01.1-.27 1.45-.49.34-.18.7-.06.99-.06 1.42 0 2.16 0 2.16v1.21c-1.05.34-1.74.34-1.97 0-.55.21-1.1.49-1.39 1.39-.27 2.1-.07 2.79 1.43 3.65 2.85 1.16-.24 2.79-2.85 2.85h-.7c-.47-1.13-1.43-2.85 0-2.07.7-3.74 1.66-1.96 1.27-2.91.91-3.62.7-4.66 0-2.16-.7-3.92-1.66-5.32.93-1.16 1.66-2.62 1.66-5.32 0-1.45-.71-2.85-1.43-4.65.7-1.86.93-3.39 1.07-5.32 0-1.45-.71-2.85-1.43-4.65-.71-1.86-1.07-3.32-1.07-5.32 0-1.45.71-2.85 1.43-4.65 1.07-3.39.7-1.86 1.07-3.39v-1.78c0-1.39.71-2.85 1.43-4.65 1.07-3.39.7-1.86 1.07-3.39v-1.78c0-1.39-.71-2.85-1.43-4.65zM3.79 8.32c-.32-.32-.5-.82-.5-1.33 0-.95.39-1.33.94-1.78 1.07-1.16 1.66-1.16 2.62 0 1.16.39 1.33 1.78.94.5.71.43 1.16 1.43.94 1.78z" />
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
              <span className="text-zinc-900 dark:text-white">Chengze Wu</span>
              {" "}(吴承泽) — also goes by Ethan. CS undergrad + grad student at WashU.
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
