'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';

interface Post {
  id: string; title: string; slug: string; excerpt: string | null; viewCount: number; createdAt: string;
  author: { id: string; name: string | null; avatar: string | null }; tags: { id: string; name: string }[]; _count: { comments: number };
}

const tagColors: Record<string, string> = {
  react: 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
  nextjs: 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-300',
  typescript: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  javascript: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  css: 'bg-pink-500/10 text-pink-700 dark:text-pink-400',
  design: 'bg-violet-500/10 text-violet-700 dark:text-violet-400',
  performance: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  architecture: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
  tutorial: 'bg-teal-500/10 text-teal-700 dark:text-teal-400',
  career: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400',
  devops: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
  database: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  ai: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
  testing: 'bg-lime-500/10 text-lime-700 dark:text-lime-400',
  security: 'bg-red-500/10 text-red-700 dark:text-red-400',
};

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    fetch('/api/posts')
      .then(r => r.json())
      .then(d => { setPosts(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const allTags = Array.from(new Set(posts.flatMap(p => p.tags.map(t => t.name))));
  const filteredPosts = selectedTag ? posts.filter(p => p.tags.some(t => t.name === selectedTag)) : posts;

  return (
    <div>
      {/* Blog Hero - Centered editorial layout */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-[15%] w-px h-24 bg-gradient-to-b from-transparent via-zinc-200 dark:via-zinc-800 to-transparent" />
          <div className="absolute top-32 right-[20%] w-px h-16 bg-gradient-to-b from-transparent via-zinc-200 dark:via-zinc-800 to-transparent" />
          <div className="absolute bottom-20 left-[25%] w-16 h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent" />
          <div className="absolute bottom-16 right-[30%] w-24 h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent" />
          <div className="absolute top-1/4 right-[12%] w-2 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="absolute bottom-1/3 left-[10%] w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <div className="max-w-7xl mx-auto px-6 w-full pt-24 pb-20 text-center relative z-10">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div className="w-8 h-[1px] bg-zinc-300 dark:bg-zinc-700" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 font-medium">
              Engineering &amp; Writing
            </span>
            <div className="w-8 h-[1px] bg-zinc-300 dark:bg-zinc-700" />
          </motion.div>

          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="text-6xl md:text-7xl lg:text-[96px] font-bold tracking-tighter text-zinc-900 dark:text-white leading-[0.9] mb-6"
          >
            Blog
          </motion.h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
            className="text-base text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed"
          >
            Thoughts on engineering, design, and the craft of building software.
          </motion.p>

          {/* Decorative geometric element */}
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
            className="mt-10 flex justify-center"
          >
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border border-zinc-200 dark:border-zinc-800 rotate-45" />
              <div className="absolute inset-2 border border-zinc-200 dark:border-zinc-800 rotate-45" />
              <div className="absolute inset-[18px] bg-zinc-200 dark:bg-zinc-800 rotate-45" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Posts section */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
              !selectedTag
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-black'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                selectedTag === tag
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-black'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Post list */}
        <div className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={reduce ? false : { opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href={`/posts/${post.slug}`} className="group block">
                <article className="py-7 px-4 -mx-4 rounded-xl hover:bg-zinc-50/70 dark:hover:bg-white/[0.02] transition-all duration-200">
                  <div className="flex items-start gap-5">
                    <span className="text-zinc-200 dark:text-zinc-800 text-lg font-light mt-1 flex-shrink-0 w-8 tabular-nums text-right">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-1.5 mb-2.5">
                        {post.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag.id}
                            className={`px-2 py-0.5 text-[10px] font-medium rounded ${
                              tagColors[tag.name] || 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                            }`}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1.5 transition-colors leading-snug">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                      )}
                      <div className="flex items-center gap-3 mt-3 text-xs text-zinc-400 dark:text-zinc-500">
                        <span className="font-medium text-zinc-500 dark:text-zinc-400">{post.author.name || 'Anonymous'}</span>
                        <span className="text-zinc-200 dark:text-zinc-700">·</span>
                        <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span className="text-zinc-200 dark:text-zinc-700">·</span>
                        <span>{post.viewCount} views</span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Empty state */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-zinc-400 dark:text-zinc-500">No posts found.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200/60 dark:border-zinc-800/60">
        <div className="max-w-4xl mx-auto px-6 py-8 flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500">
          <span>&copy; 2026 Ethan Wu</span>
          <span>Built with Next.js</span>
        </div>
      </footer>
    </div>
  );
}
