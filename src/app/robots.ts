import type { MetadataRoute } from 'next';

/**
 * robots.txt — generated at build time by Next.js from this file.
 * Served at /robots.txt (no public/robots.txt exists on purpose).
 *
 * Everything is public. The site has no crawler-hostile areas except
 * what middleware blocks at the bot-detection level (scrapers / AI
 * crawlers are 403'd there). Standard search bots are welcome.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/profile/',
          '/admin/',
          '/resume/edit',
        ],
      },
    ],
    sitemap: 'https://ethanwu.work/sitemap.xml',
  };
}
