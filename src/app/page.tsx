'use client';

import { useEffect, useRef, useState } from 'react';
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

export default function Home() {
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
      {/* Hero - Left-aligned editorial style */}
      <section className="relative min-h-[100dvh] flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full py-24">
          <div className="max-w-2xl">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-xs font-medium text-blue-700 dark:text-blue-400 mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Open for collaboration
            </motion.div>

            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-zinc-900 dark:text-white mb-6 leading-[1.05]"
            >
              Hi, I&apos;m Ethan.
            </motion.h1>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mb-10 leading-relaxed"
            >
              I build things for the web and write about what I learn along the way.
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex gap-3"
            >
              <a
                href="#posts"
                className="group px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all duration-200 flex items-center gap-2"
              >
                Read the blog
                <svg className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </a>
              <Link
                href="/register"
                className="px-5 py-2.5 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all duration-200"
              >
                Join the community
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Posts section */}
      <main id="posts" className="max-w-4xl mx-auto px-6 py-16">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Latest posts</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Thoughts on engineering, design, and building products.</p>
        </motion.div>

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
        <div className="space-y-2">
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={reduce ? false : { opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href={`/posts/${post.slug}`} className="group block">
                <article className="py-4 px-4 -mx-4 rounded-xl hover:bg-zinc-50 dark:hover:bg-white/[0.03] transition-all duration-200">
                  <div className="flex items-start gap-4">
                    <span className="text-zinc-300 dark:text-zinc-700 text-sm font-mono mt-0.5 flex-shrink-0 w-6 tabular-nums">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-1.5 mb-1.5">
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
                      <h3 className="text-base font-semibold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1 transition-colors">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1">{post.excerpt}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                        <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span>·</span>
                        <span>{post.viewCount} views</span>
                        <span>·</span>
                        <span>{post._count.comments} comments</span>
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
