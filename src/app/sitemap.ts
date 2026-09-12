import type { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

const BASE = 'https://ethanwu.work';

/**
 * sitemap.xml — generated at build time. Static public routes are
 * listed directly; published blog posts come from Prisma.
 *
 * If the DB is unreachable at build time the function still returns
 * the static routes — blog posts would just be missing from the
 * sitemap for that build, which is an acceptable degradation.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/project`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/resume`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/gallery`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE}/photography`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/messages`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.4 },
    { url: `${BASE}/podcast`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ];

  let postRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    });
    postRoutes = posts.map((p) => ({
      url: `${BASE}/posts/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.5,
    }));
  } catch (e) {
    console.warn('[sitemap] failed to read posts from DB', e);
  }

  return [...staticRoutes, ...postRoutes];
}
