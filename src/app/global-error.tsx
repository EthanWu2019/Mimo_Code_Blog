'use client';

/**
 * global-error.tsx — the root error boundary. Renders when the root
 * layout itself crashes, so it cannot rely on ANY layout (no navbar,
 * no providers, no cursor). It must re-create the minimum brand
 * experience: dark/light background matching the site and the
 * CursorGlow dot so the cursor never regresses to the system arrow.
 *
 * Next.js renders this with its own <html>/<body>; we can't inject
 * <head> content, so the theme defaults to dark (the site's default)
 * and the dot is initialized by CursorGlow itself on mount.
 */

import CursorGlow from '@/components/CursorGlow';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body
        style={{
          background: '#0a0a0b',
          color: '#e4e4e7',
          margin: 0,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <CursorGlow />
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 24px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: 11,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: '#71717a',
              marginBottom: 16,
            }}
          >
            Something broke
          </p>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              margin: 0,
              color: '#fafafa',
            }}
          >
            This page couldn&apos;t load.
          </h1>
          <p
            style={{
              fontSize: 14,
              color: '#a1a1aa',
              marginTop: 12,
              maxWidth: 420,
              lineHeight: 1.6,
            }}
          >
            A server error occurred. It&apos;s probably temporary — try once more,
            or head back home.
          </p>
          {error.digest && (
            <p style={{ fontSize: 11, color: '#52525b', marginTop: 16, fontFamily: 'monospace' }}>
              error digest: {error.digest}
            </p>
          )}
          <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
            <button
              onClick={reset}
              style={{
                background: '#fafafa',
                color: '#18181b',
                border: 'none',
                borderRadius: 999,
                padding: '10px 22px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                background: 'transparent',
                color: '#a1a1aa',
                border: '1px solid #3f3f46',
                borderRadius: 999,
                padding: '10px 22px',
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Back home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
