import { auth } from "@/lib/auth";
import Link from "next/link";

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
    <div className="min-h-[100dvh] pt-24 pb-32 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Eyebrow + heading — match the editorial style on /project */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-[1px] bg-zinc-300 dark:bg-zinc-700" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 font-medium">
              Resume · Compiled live from LaTeX
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-zinc-900 dark:text-white leading-[0.95] mb-6">
            Resume
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl leading-relaxed">
            Single-page LaTeX résumé. Compiled on every request via{" "}
            <span className="text-zinc-900 dark:text-white font-medium">LaTeXOnline</span>{" "}
            (the open-source HTTP wrapper around pdflatex) so the version you
            download is always the latest edit — no stale PDFs lying around.
          </p>
        </section>

        {/* Inline preview of the PDF — clicking the iframe is the standard
            "view before you download" UX. We re-fetch the same URL on reload
            so admin edits are reflected immediately after a Save. */}
        <section className="mb-8">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-white/[0.02]">
              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                <span>Live preview</span>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link
                    href="/resume/edit"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                    </svg>
                    Edit
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
            </div>
            {/*
              The PDF viewer inside <iframe> draws its own surface that
              intercepts mousemove and stops our global cursor dot from
              painting. We layer a transparent overlay that has
              pointer-events: none — events still reach the iframe for
              scrolling/zooming, but the dot sits on the topmost layer
              and the cursor can keep tracking across the region.
            */}
            <div className="relative">
              <iframe
                key={isAdmin ? "admin" : "guest"}
                src="/api/resume/pdf"
                title="Ethan Wu — Resume"
                className="w-full"
                style={{
                  height: "calc(100dvh - 360px)",
                  minHeight: 720,
                  border: 0,
                  // Chrome's PDF viewer is a shadow-DOM surface that traps
                  // mousemove and stops the global cursor dot from tracking.
                  // Disabling pointer events here lets the cursor continue
                  // moving across the region. PDF interaction (scroll/zoom/
                  // text select) is disabled by design; viewers use the
                  // Download PDF button and read the file locally.
                  pointerEvents: "none",
                }}
              />
            </div>
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-3">
            If the preview doesn&apos;t reflect a recent edit, hit Reload — the
            cache TTL is 60 seconds.
          </p>
        </section>
      </div>
    </div>
  );
}
