import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Inline NEXTAUTH_URL into the client bundle so next-auth React SDK
  // (which reads NEXTAUTH_URL ?? VERCEL_URL at build time) uses our
  // production hostname rather than the Vercel preview domain. The
  // value is the same public URL we set in Vercel environment
  // variables for the server runtime.
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "https://ethanwu.work",
  },
  // Preserve capital letters in URLs; do not auto-lowercase the path.
  // Without this, /Blog -> /blog and /Join-community -> /join-community, which
  // breaks case-sensitive canonical links and any external links that use the
  // case from the markup.
  async redirects() {
    return [
      // Old Vercel preview domain -> canonical production domain. Keeps SEO
      // equity when external links reference the vercel.app URL.
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "mimo-code-blog.vercel.app",
          },
        ],
        destination: "https://ethanwu.work/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
