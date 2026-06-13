'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';

interface Post {
  id: string; title: string; slug: string; excerpt: string | null; viewCount: number; createdAt: string;
  author: { id: string; name: string | null; avatar: string | null }; tags: { id: string; name: string }[]; _count: { comments: number };
}

const tagColors: Record<string, string> = {
  react: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  nextjs: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-300',
  typescript: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  javascript: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  css: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  design: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  performance: 'bg-green-500/10 text-green-600 dark:text-green-400',
  architecture: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  tutorial: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  career: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  devops: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  database: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  ai: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400',
  testing: 'bg-lime-500/10 text-lime-600 dark:text-lime-400',
  security: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const orb1 = useRef<HTMLDivElement>(null);
  const orb2 = useRef<HTMLDivElement>(null);
  const orb3 = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/posts').then(r => r.json()).then(d => { setPosts(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!headingRef.current) return;
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(orb1.current, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.5 }, 0)
      .fromTo(orb2.current, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.5 }, 0.2)
      .fromTo(orb3.current, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.5 }, 0.4)
      .fromTo(headingRef.current, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, 0.3)
      .fromTo(subRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 0.5)
      .fromTo(ctaRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 0.7);

    const handleMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 25;
      const y = (e.clientY / window.innerHeight - 0.5) * 25;
      gsap.to(orb1.current, { x: x * 1.2, y: y * 1.2, duration: 1.2, ease: 'power2.out' });
      gsap.to(orb2.current, { x: -x * 0.8, y: -y * 0.8, duration: 1.2, ease: 'power2.out' });
      gsap.to(orb3.current, { x: x * 0.5, y: -y * 0.5, duration: 1.2, ease: 'power2.out' });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  useEffect(() => {
    if (loading || !gridRef.current) return;
    const items = gridRef.current.querySelectorAll('[data-post]');
    gsap.fromTo(items, { y: 25, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.04, ease: 'power2.out' });
  }, [loading, selectedTag]);

  const allTags = Array.from(new Set(posts.flatMap(p => p.tags.map(t => t.name))));
  const filteredPosts = selectedTag ? posts.filter(p => p.tags.some(t => t.name === selectedTag)) : posts;

  return (
    <div>
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        <div ref={orb1} className="absolute top-[15%] left-[20%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-violet-400/20 to-fuchsia-400/10 dark:from-violet-500/15 dark:to-fuchsia-500/8 blur-[100px]" />
        <div ref={orb2} className="absolute bottom-[10%] right-[15%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-cyan-400/15 to-blue-400/10 dark:from-cyan-500/10 dark:to-blue-500/5 blur-[80px]" />
        <div ref={orb3} className="absolute top-[40%] right-[30%] w-[300px] h-[300px] rounded-full bg-gradient-to-br from-amber-300/10 to-rose-300/8 dark:from-amber-400/8 dark:to-rose-400/5 blur-[60px]" />

        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs text-zinc-500 dark:text-white/40 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Open for collaboration
          </div>
          <h1 ref={headingRef} className="text-5xl sm:text-7xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6 leading-[1.1]">
            Hi, I&apos;m <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 dark:from-violet-400 dark:via-fuchsia-400 dark:to-cyan-400 bg-clip-text text-transparent">Ethan</span>
          </h1>
          <p ref={subRef} className="text-lg sm:text-xl text-zinc-500 dark:text-white/40 max-w-xl mx-auto mb-10 leading-relaxed">
            I build things for the web and write about what I learn along the way.
          </p>
          <div ref={ctaRef} className="flex gap-3 justify-center">
            <a href="#posts" className="group px-6 py-3 glass rounded-xl text-zinc-700 dark:text-white/70 text-sm font-medium hover:bg-white/60 dark:hover:bg-white/[0.08] transition-all duration-300 flex items-center gap-2">
              Read the blog
              <svg className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
            </a>
            <Link href="/register" className="px-6 py-3 glass-subtle rounded-xl text-zinc-600 dark:text-white/50 text-sm font-medium hover:bg-white/50 dark:hover:bg-white/[0.06] transition-all duration-300">
              Join the community
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-[10px] text-zinc-400 dark:text-white/20">Scroll</span>
          <svg className="w-4 h-4 text-zinc-400 dark:text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </section>

      <main id="posts" className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex flex-wrap gap-2 mb-10">
          <button onClick={() => setSelectedTag(null)} className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${!selectedTag ? 'bg-zinc-900 dark:bg-white text-white dark:text-black' : 'glass text-zinc-500 dark:text-white/40 hover:text-zinc-700 dark:hover:text-white/60'}`}>All</button>
          {allTags.map(tag => (
            <button key={tag} onClick={() => setSelectedTag(tag === selectedTag ? null : tag)} className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${selectedTag === tag ? 'bg-zinc-900 dark:bg-white text-white dark:text-black' : 'glass text-zinc-500 dark:text-white/40 hover:text-zinc-700 dark:hover:text-white/60'}`}>{tag}</button>
          ))}
        </div>

        <div ref={gridRef} className="space-y-3">
          {filteredPosts.map((post, index) => (
            <Link key={post.id} href={`/posts/${post.slug}`} data-post className="group block">
              <article className="glass rounded-2xl p-5 hover:bg-white/60 dark:hover:bg-white/[0.06] transition-all duration-300 hover:shadow-lg dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
                <div className="flex items-start gap-4">
                  <span className="text-zinc-300 dark:text-white/10 text-sm font-mono mt-0.5 flex-shrink-0 w-6">{String(index + 1).padStart(2, '0')}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {post.tags.slice(0, 3).map(tag => (
                        <span key={tag.id} className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md ${tagColors[tag.name] || 'bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-white/30'}`}>{tag.name}</span>
                      ))}
                    </div>
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-white/70 mb-1 transition-colors">{post.title}</h2>
                    {post.excerpt && <p className="text-sm text-zinc-500 dark:text-white/30 line-clamp-1">{post.excerpt}</p>}
                    <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400 dark:text-white/15">
                      <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <span>{post.viewCount} views</span>
                      <span>{post._count.comments} comments</span>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {filteredPosts.length === 0 && <div className="text-center py-16"><p className="text-zinc-400 dark:text-white/30">No posts found.</p></div>}
      </main>

      <footer className="border-t border-zinc-200/30 dark:border-white/[0.04]">
        <div className="max-w-4xl mx-auto px-6 py-8 flex items-center justify-between text-xs text-zinc-400 dark:text-white/20">
          <span>&copy; 2026 Ethan Wu</span>
          <span>Built with Next.js</span>
        </div>
      </footer>
    </div>
  );
}
