import { auth } from "@/lib/auth";
import Link from "next/link";
import PdfSection from "./PdfSection";

export const metadata = {
  title: "Resume",
  description: "Download Ethan Wu's resume — single-page LaTeX CV, compiled live.",
};

export default async function ResumePage() {
  // Server component — gets the session once at render. Renders the
  // static "look-and-feel" of the page; the PDF preview iframe + the
  // download button both hit /api/resume/pdf on the client (and on
  // browser right-click "Save as"). Admin sees an extra Edit entry.
  const session = await auth();
  const isAdmin = (session?.user as any)?.role === "admin";

  return (
    <div className="min-h-[100dvh] pt-16 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Single full-width two-column grid.
            Left column: eyebrow + h1 "Resume" on top, then description /
              meta / actions below. Right column: PDF preview, its top
              edge aligned with the h1 on the left on lg+ viewports. */}
        <div className="grid grid-cols-1 md:resume-grid-ipad lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] gap-8">
          {/* LEFT */}
          <div className="space-y-8 text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <header>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-[1px] bg-zinc-300 dark:bg-zinc-700" />
                <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 font-medium">
                  Resume · Compiled live from LaTeX
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-zinc-900 dark:text-white leading-[0.95]">
                Resume
              </h1>
            </header>

            <p className="text-base">
              Single-page LaTeX résumé. Compiled on every request via{" "}
              <span className="text-zinc-900 dark:text-white font-medium">LaTeXOnline</span>{" "}
              (the open-source HTTP wrapper around pdflatex) so the version
              you download is always the latest edit — no stale PDFs lying
              around.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 font-medium mb-1">
                  Name
                </div>
                <div className="text-zinc-900 dark:text-white">Ethan Wu</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 font-medium mb-1">
                  Based in
                </div>
                <div className="text-zinc-900 dark:text-white">
                  St. Louis, MO · WashU CS
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 font-medium mb-1">
                  Format
                </div>
                <div className="text-zinc-900 dark:text-white">
                  Single-page A4 · LaTeX → PDF
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {isAdmin && (
                <Link
                  href="/resume/edit"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                  </svg>
                  Edit source
                </Link>
              )}
              <a
                href="/api/resume/pdf?download=1"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
                </svg>
                Download PDF
              </a>
            </div>

            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              If the preview doesn&apos;t reflect a recent edit, hit Reload
              — the cache TTL is 60 seconds.
            </p>
          </div>

          {/* RIGHT — PDF. The wrapper card starts at the same grid row as
              the left column's h1 "Resume", so the top of the PDF
              preview aligns with the top of the page title. */}
          <section>
            <PdfSection isAdmin={isAdmin} src="/api/resume/pdf" />
          </section>
        </div>
      </div>
    </div>
  );
}
