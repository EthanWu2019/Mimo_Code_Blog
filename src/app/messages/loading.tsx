// Per-route loading state for /messages. Next.js renders this in a
// Suspense boundary while the route segment is loading, replacing the
// previous behavior where the title bar briefly flickered through the
// default "Ethan Wu" before the page hydrated.
//
// Visual style matches the in-page spinner block so the transition
// from "route loading" → "page loaded" is seamless: same size,
// same animation, same label.

export default function MessagesLoading() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4 sm:px-6 py-10 sm:py-14">
      <div className="max-w-2xl mx-auto w-full">
        {/* Skeleton header — mirrors the real page's small kicker + h1
            + subtitle so the layout doesn't pop on transition. */}
        <div className="mb-10">
          <div className="h-2 w-24 bg-zinc-200 dark:bg-zinc-800 rounded mb-3" />
          <div className="h-8 w-40 bg-zinc-200 dark:bg-zinc-800 rounded mb-3" />
          <div className="h-3 w-full max-w-prose bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>

        {/* Composer skeleton */}
        <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-zinc-50/40 dark:bg-white/[0.02] p-5 sm:p-6 mb-8">
          <div className="h-12 w-full bg-zinc-200 dark:bg-zinc-800 rounded mb-3" />
          <div className="flex justify-between items-center">
            <div className="h-2 w-12 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-8 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
          </div>
        </div>

        {/* List skeletons */}
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/40 dark:bg-white/[0.02] p-4 sm:p-5"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-3 mb-1.5">
                    <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    <div className="h-2 w-12 bg-zinc-200 dark:bg-zinc-800 rounded" />
                  </div>
                  <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded mb-1.5" />
                  <div className="h-3 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Spinner + label below the skeletons so the user always sees
            motion during the brief load window. */}
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-6 h-6 border-2 border-zinc-300 dark:border-white/20 border-t-zinc-600 dark:border-t-white rounded-full animate-spin" />
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
            Loading…
          </p>
        </div>
      </div>
    </div>
  );
}
