"use client";

// =============================================================
// /resume/edit — admin-only LaTeX editor with live preview
//
// Single-page split layout:
//   - Left:  .tex source code (textarea, monospace)
//   - Right: latest compiled PDF preview (iframe, .pdf rendered)
// Flow:
//   1. On mount: GET /api/resume/source (text/plain), populate textarea
//   2. User edits → textarea only (no auto-save; Save button is the gate)
//   3. Press "Save & Preview":
//        - PUT /api/resume/source { tex }        → 200 / 401 / 4xx
//        - then GET /api/resume/pdf (via reloading the iframe) → PDF refreshes
//   4. If PUT 401 → we redirect to /login (token expired)
//   5. We do NOT do per-keystroke compile (would hammer LaTeXOnline);
//      compile is gated by Save.
//
// Role gate happens server-side (we re-check on every GET to /resume/edit
// via the page's server component in /resume/edit/page.server.tsx — TBD).
// For now, the page is client-only; the source PUT enforces auth on its own
// and the embedded iframe will simply show "you are not authorized" if non-admin
// tries to read source (it actually is allowed for GET but PUT is gated).
// =============================================================
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

const COMPILE_DELAY_MS = 200; // tiny debounce after successful save

export default function ResumeEditClient({
  initialSource,
  isAdmin,
}: {
  initialSource: string;
  isAdmin: boolean;
}) {
  const [tex, setTex] = useState(initialSource);
  const [saved, setSaved] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [pdfKey, setPdfKey] = useState(0); // bump to force iframe reload
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mark dirty when source differs from last-known saved snapshot.
  useEffect(() => {
    setSaved(tex === initialSource);
  }, [tex, initialSource]);

  const stats = useMemo(() => {
    const lines = tex.split("\n").length;
    const chars = tex.length;
    const approxBytes = new Blob([tex]).size;
    return { lines, chars, approxBytes };
  }, [tex]);

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const r = await fetch("/api/resume/source", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tex }),
      });
      if (r.status === 401) {
        // session expired; bounce to login
        window.location.href = "/login?callbackUrl=/resume/edit";
        return;
      }
      if (!r.ok) {
        const body = await r.json().catch(() => ({ error: "save failed" }));
        setError(body.error ?? `Save failed (HTTP ${r.status})`);
        return;
      }
      setSaved(true);
      setSavedAt(new Date());
      // Force iframe to re-fetch after a brief pause so LaTeXOnline
      // has the new source.
      timerRef.current && clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setPdfKey((k) => k + 1), COMPILE_DELAY_MS);
    } catch (e: any) {
      setError(e?.message ?? "save failed");
    } finally {
      setSaving(false);
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Edit access requires an admin account. Sign in with the email
            listed in <Link href="/" className="text-zinc-900 dark:text-white underline underline-offset-2">Ethan&apos;s profile</Link>{" "}
            or contact the site owner.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Heading + actions */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-[1px] bg-zinc-300 dark:bg-zinc-700" />
              <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 font-medium">
                Resume · admin
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-zinc-900 dark:text-white leading-[1.0] mb-1">
              Edit &amp; preview
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Save &amp; Preview compiles via LaTeXOnline and refreshes the
              preview pane. Source lives in <code className="font-mono text-zinc-700 dark:text-zinc-300">data/resume/source.tex</code>.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/resume"
              className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Back to view
            </Link>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || saved}
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-50 transition-colors"
            >
              {saving ? "Compiling…" : saved ? "Saved" : "Save & Preview"}
            </button>
          </div>
        </div>

        {/* Status row */}
        <div className="mb-4 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1.5">
            <span
              className={
                "w-1.5 h-1.5 rounded-full " +
                (saving
                  ? "bg-amber-500 animate-pulse"
                  : saved
                    ? "bg-emerald-500"
                    : "bg-amber-500")
              }
            />
            {saving ? "Compiling…" : saved ? "Up to date" : "Unsaved changes"}
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">·</span>
          <span>
            {stats.lines} lines · {stats.chars.toLocaleString()} chars
          </span>
          {savedAt && (
            <>
              <span className="text-zinc-300 dark:text-zinc-700">·</span>
              <span>saved at {savedAt.toLocaleTimeString()}</span>
            </>
          )}
          {error && (
            <>
              <span className="text-zinc-300 dark:text-zinc-700">·</span>
              <span className="text-red-600 dark:text-red-400">{error}</span>
            </>
          )}
        </div>

        {/* Split: source | preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 overflow-hidden flex flex-col">
            <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-white/[0.02] text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
              <span className="font-mono">main.tex</span>
              <span>LaTeX · pdflatex</span>
            </div>
            <textarea
              value={tex}
              onChange={(e) => setTex(e.target.value)}
              spellCheck={false}
              wrap="off"
              className="flex-1 w-full p-4 font-mono text-[13px] leading-relaxed bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none resize-none"
              style={{ minHeight: "calc(100dvh - 320px)" }}
            />
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 overflow-hidden flex flex-col">
            <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-white/[0.02] text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
              <span>Preview · PDF</span>
              <a
                href="/api/resume/pdf"
                download="Ethan_Wu_Resume.pdf"
                className="hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Download
              </a>
            </div>
            <iframe
              key={pdfKey}
              src="/api/resume/pdf"
              title="Live PDF preview"
              className="w-full flex-1"
              style={{ minHeight: "calc(100dvh - 320px)", border: 0 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
