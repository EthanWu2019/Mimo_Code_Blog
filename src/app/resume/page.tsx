import { auth } from "@/lib/auth";
import Link from "next/link";
import PdfIframeForwarder from "./PdfIframeForwarder";

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
    <div className="min-h-[100dvh] pt-24 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Page header — narrow, full width. Two-column body below */}
        <header className="mb-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-[1px] bg-zinc-300 dark:bg-zinc-700" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 font-medium">
              Resume · Compiled live from LaTeX
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-zinc-900 dark:text-white leading-[0.95] mb-6">
            Resume
          </h1>
        </header>

        {/* Two-column body: left = descriptive copy, right = PDF preview.
            On narrow viewports (<lg) we stack: copy above, PDF below. */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-10">
          {/* Left: description / meta / contact. Sticks to top of viewport
              when there is room so it doesn't fly off-screen on a long
              PDF scroll. */}
          <aside className="lg:sticky lg:top-24 lg:self-start space-y-8 text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <p className="text-base">
              Single-page LaTeX résumé. Compiled on every request via{" "}
              <span className="text-zinc-900 dark:text-white font-medium">LaTeXOnline</span>{" "}
              (the open-source HTTP wrapper around pdflatex) so the version
              you download is always the latest edit — no stale PDFs lying
              around.
            </p>

            <div className="space-y-3 text-sm">
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

            <div className="flex flex-wrap items-center gap-3 pt-2">
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
                className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-900 dark:text-white"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
                </svg>
                Download PDF
              </a>
            </div>

            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              If the preview doesn&apos;t reflect a recent edit, hit Reload
              — the cache TTL is 60 seconds.
            </p>
          </aside>

          {/* Right: PDF preview. Toolbar at top is now scoped to the PDF
              column; the global page header is no longer fighting with
              it. The PDF iframe is the same as before — with the
              client-component mouse forwarding so the global cursor
              dot keeps tracking across the preview region. */}
          <section>
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-white/[0.02]">
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                  <span>Live preview</span>
                </div>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  {isAdmin ? "Edit source on the left" : "PDF"}
                </span>
              </div>
              <PdfIframeForwarder
                isAdmin={isAdmin}
                src="/api/resume/pdf"
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
