'use client';

/**
 * error.tsx — route-segment error boundary. Renders inside the root
 * layout (navbar, providers, CursorGlow all still alive), so this is
 * a much lighter component: brand-styled message + try-again.
 *
 * Matches the site palette and keeps the custom cursor, unlike the
 * default Next.js error UI (white page, system cursor) that owners
 * have been seeing on broken dynamic routes.
 */

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500 mb-4">
        Something broke
      </p>
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-3">
        This page couldn&apos;t load.
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
        A server error occurred. It&apos;s probably temporary.
      </p>
      {error.digest && (
        <p className="mt-4 text-[11px] font-mono text-zinc-400 dark:text-zinc-600">
          digest: {error.digest}
        </p>
      )}
      <div className="mt-7 flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="px-5 py-2 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-colors"
        >
          Try again
        </button>
        <a
          href="/"
          className="px-5 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
        >
          Back home
        </a>
      </div>
    </div>
  );
}
