import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
