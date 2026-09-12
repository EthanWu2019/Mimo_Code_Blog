/**
 * SiteFooter
 *
 * Global footer rendered once on every public page (rendered by the
 * (site) route group layout). Two grouped blocks:
 *
 *   [ About                ] [ Navigate              ]
 *   [ name / bio / phone   ] [ Home / Writing / etc  ]
 *   [ email                ]
 *   [ github linkedin cafe ]
 *
 *   ─────────────────────────────────────────────────
 *   (c) 2026 Chengze Wu        ethanwu.work — tagline
 *
 * The previous footer had three separate blocks (About / Navigate /
 * Connect) which read as three smallish columns crammed onto one
 * row. The owner asked to merge Connect into About (phone, email,
 * and social icons all live there now) and to drop the third card.
 *
 * Personal info the owner wanted surfaced here:
 *   GitHub:    https://github.com/EthanWu2019
 *   LinkedIn:  https://www.linkedin.com/in/chengze-wu-3398a0224/
 *   Cafe:      https://ethanwu.cafe/  (life-side blog)
 *   Email:     ethanwucz2019@gmail.com
 *   Phone:     8623600912   (added per owner request)
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

function BlockLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500 font-medium">
      {children}
    </p>
  );
}

// Small icon for the contact lines (phone + email). Inlined here so the
// footer has zero client JS and no icon library dependency.
function PhoneGlyph() {
  return (
    <svg
      className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MailGlyph() {
  return (
    <svg
      className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

export default function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200/60 dark:border-zinc-800/60 mt-12 sm:mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/*
          Two blocks only: About (now containing name, bio, phone, email,
          and the social icons) and Navigate. The About block reads as
          one cohesive "contact" surface; the icons inside it sit alongside
          the email / phone lines, not as a separate column.
        */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {/* Block 1 — About (avatar + name + bio + phone + email + social icons) */}
          <section className="rounded-xl border border-zinc-200/70 dark:border-zinc-800/70 bg-zinc-50/40 dark:bg-white/[0.02] p-4 sm:p-5 sm:col-span-2">
            <div className="flex items-start gap-4 sm:gap-5">
              {/* Avatar — circular masked photo. The srcset serves
                  the 2x retina version on hi-DPI displays; the small
                  one is the default for 1x. */}
              <img
                src="/avatar-96.png"
                srcSet="/avatar-96.png 1x, /avatar-192.png 2x"
                width={64}
                height={64}
                alt="Chengze Wu"
                loading="lazy"
                className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover ring-1 ring-zinc-200/70 dark:ring-zinc-800/70"
              />
              <div className="min-w-0 flex-1">
                <BlockLabel>About</BlockLabel>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  <span className="text-zinc-900 dark:text-white">Chengze Wu</span>
                  {" "}— also goes by Ethan. CS undergrad + grad student at WashU.
                </p>
                {/* Phone + email — two contact lines, each with a small
                    leading glyph so they read as a pair, not a paragraph. */}
                <ul className="mt-3 space-y-1 text-sm">
              <li>
                <a
                  href="tel:+18623600912"
                  className="inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  <PhoneGlyph />
                  <span>862-360-0912</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:ethanwucz2019@gmail.com"
                  className="inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  <MailGlyph />
                  <span>ethanwucz2019@gmail.com</span>
                </a>
              </li>
            </ul>

            {/* Social icons — same chip styling as before, kept inside
                the About block since they are how the owner surfaces
                his external presence. */}
            <ul className="mt-3 flex flex-wrap items-center gap-2 text-zinc-500 dark:text-zinc-400">
              {SOCIAL.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    aria-label={s.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-zinc-200/70 dark:border-zinc-800/70 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
                  >
                    <span className="w-5 h-5 block">{s.svg}</span>
                  </a>
                </li>
              ))}
            </ul>
              </div>{/* end right column */}
            </div>{/* end avatar + content flex */}
          </section>

          {/* Block 2 — Navigate (in-site links only) */}
          <section className="rounded-xl border border-zinc-200/70 dark:border-zinc-800/70 bg-zinc-50/40 dark:bg-white/[0.02] p-4 sm:p-5">
            <BlockLabel>Navigate</BlockLabel>
            <ul className="mt-2 grid grid-cols-1 gap-y-1 text-sm text-zinc-600 dark:text-zinc-300">
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
        </div>

      </div>
    </footer>
  );
}
