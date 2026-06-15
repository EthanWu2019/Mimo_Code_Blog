'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import gsap from 'gsap';
import LiquidGlassIndicator from '@/components/LiquidGlassIndicator';

interface CommentType { id: string; content: string; createdAt: string; pinned: boolean; likeCount: number; liked: boolean; author: { id: string; name: string | null; avatar: string | null; role: string }; replies?: CommentType[]; }
interface Post { id: string; title: string; slug: string; content: string; excerpt: string | null; viewCount: number; createdAt: string; author: { id: string; name: string | null; avatar: string | null }; tags: { id: string; name: string }[]; comments: CommentType[]; }
interface RelatedPost { id: string; title: string; slug: string; excerpt: string | null; tags: { id: string; name: string }[]; }

function CommentItem({ comment, postId, depth = 0, postAuthorId }: { comment: CommentType; postId: string; depth?: number; postAuthorId: string }) {
  const { data: session } = useSession();
  const [replying, setReplying] = useState(false); const [replyContent, setReplyContent] = useState(''); const [submitting, setSubmitting] = useState(false);
  const [replies, setReplies] = useState<CommentType[]>(comment.replies || []); const [likeCount, setLikeCount] = useState(comment.likeCount); const [liked, setLiked] = useState(comment.liked); const [pinned, setPinned] = useState(comment.pinned);
  const ref = useRef<HTMLDivElement>(null); const userId = (session?.user as any)?.id; const userRole = (session?.user as any)?.role; const canPin = userRole === 'admin' || userId === postAuthorId;

  useEffect(() => { if (ref.current) gsap.fromTo(ref.current, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }); }, []);

  const handleReply = async (e: React.FormEvent) => { e.preventDefault(); if (!replyContent.trim()) return; setSubmitting(true); try { const res = await fetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: replyContent, postId, parentId: comment.id }) }); if (res.ok) { const nr = await res.json(); setReplies(p => [...p, nr]); setReplyContent(''); setReplying(false); } } finally { setSubmitting(false); } };
  const handleLike = async () => { if (!userId) return; const r = await fetch(`/api/comments/${comment.id}/like`, { method: 'POST' }); if (r.ok) { const d = await r.json(); setLiked(d.liked); setLikeCount(d.likeCount); } };
  const handlePin = async () => { const r = await fetch(`/api/comments/${comment.id}/pin`, { method: 'POST' }); if (r.ok) { const d = await r.json(); setPinned(d.pinned); } };

  return (
    <div ref={ref} className={depth > 0 ? 'ml-5 pl-4 border-l-2 border-zinc-100 dark:border-white/[0.06]' : ''}>
      <div className={`py-3 px-3 rounded-xl ${pinned ? 'bg-amber-50/60 dark:bg-amber-500/[0.06] border border-amber-200/40 dark:border-amber-500/10 mb-2' : 'mb-1'}`}>
        <div className="flex items-center gap-2 mb-1.5">
          {comment.author.avatar ? <img src={comment.author.avatar} alt="" className="w-6 h-6 rounded-full object-cover" /> : <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-white/10 flex items-center justify-center text-[9px] font-medium text-zinc-500 dark:text-white/50">{comment.author.name?.[0] || '?'}</div>}
          <span className="text-[13px] font-semibold text-zinc-800 dark:text-white/80">{comment.author.name || 'Anonymous'}</span>
          {comment.author.role === 'admin' && <span className="px-1 py-px text-[8px] font-bold uppercase glass rounded leading-none text-zinc-700 dark:text-white/70">Admin</span>}
          {pinned && <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-0.5"><svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2l2.5 5 5.5.8-4 3.9.9 5.3L10 14.5 5.1 17l.9-5.3-4-3.9 5.5-.8z" /></svg>Pinned</span>}
          <span className="text-[11px] text-zinc-400 dark:text-white/20 ml-auto">{new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
        <p className="text-[13px] text-zinc-600 dark:text-white/50 leading-relaxed mb-2">{comment.content}</p>
        <div className="flex items-center gap-3">
          <button onClick={handleLike} className={`flex items-center gap-1 text-[11px] transition-all duration-200 ${liked ? 'text-red-500' : 'text-zinc-400 dark:text-white/20 hover:text-red-400'}`}><svg className="w-3 h-3" fill={liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>{likeCount > 0 && likeCount}</button>
          {session?.user && depth < 3 && <button onClick={() => setReplying(!replying)} className="text-[11px] text-zinc-400 dark:text-white/20 hover:text-zinc-600 dark:hover:text-white/40 transition-colors">Reply</button>}
          {canPin && <button onClick={handlePin} className="text-[11px] text-zinc-400 dark:text-white/20 hover:text-amber-500 transition-colors">{pinned ? 'Unpin' : 'Pin'}</button>}
        </div>
      </div>
      {replying && (<form onSubmit={handleReply} className="my-2 ml-3"><textarea value={replyContent} onChange={e => setReplyContent(e.target.value)} placeholder="Reply..." className="w-full p-2.5 glass rounded-lg text-zinc-900 dark:text-white text-[13px] focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-white/15 resize-none" rows={2} /><div className="flex gap-2 mt-1.5"><button type="submit" disabled={submitting} className="px-3 py-1 bg-zinc-900/80 dark:bg-white/80 backdrop-blur-sm text-white dark:text-black text-[11px] font-medium rounded-md disabled:opacity-50">{submitting ? '...' : 'Reply'}</button><button type="button" onClick={() => { setReplying(false); setReplyContent(''); }} className="px-3 py-1 text-[11px] text-zinc-400 dark:text-white/30">Cancel</button></div></form>)}
      {replies.map(r => <CommentItem key={r.id} comment={r} postId={postId} depth={depth + 1} postAuthorId={postAuthorId} />)}
    </div>
  );
}

export default function PostPage() {
  const params = useParams(); const slug = params.slug as string; const { data: session } = useSession();
  const [post, setPost] = useState<Post | null>(null); const [related, setRelated] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true); const [comment, setComment] = useState(''); const [submitting, setSubmitting] = useState(false);
  const [headings, setHeadings] = useState<{ id: string; text: string }[]>([]);
  const [activeH, setActiveH] = useState('');
  const activeHRef = useRef('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const articleRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const [indicator, setIndicator] = useState({ top: 0, height: 0, left: 0, width: 0, ready: false });

  useEffect(() => {
    Promise.all([fetch(`/api/posts/${slug}`).then(r => r.json()), fetch(`/api/posts/${slug}/related`).then(r => r.json())])
      .then(([pd, rd]) => { setPost(pd); setRelated(rd); setLoading(false); if (articleRef.current) gsap.fromTo(articleRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' });
        const h: { id: string; text: string }[] = []; pd.content.split('\n').forEach((line: string, i: number) => { const t = line.trim(); const m = t.match(/^(#{1,3})\s+(.+)/); if (m) h.push({ id: `h-${i}`, text: m[2] }); }); setHeadings(h.slice(0, 15));
      }).catch(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (headings.length === 0) return;
    const obs = new IntersectionObserver(entries => {
      let latest = '';
      entries.forEach(e => {
        if (e.isIntersecting) latest = e.target.id;
      });
      if (!latest) return;
      // Immediate ref update for accurate tracking
      activeHRef.current = latest;
      // Debounce state update to prevent animation stutter when jumping
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => setActiveH(latest), 60);
    }, { rootMargin: '-80px 0px -75% 0px' });
    headings.forEach(h => { const el = document.getElementById(h.id); if (el) obs.observe(el); });
    return () => { obs.disconnect(); if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [headings]);

  const updateIndicator = useCallback(() => {
    if (!navRef.current || !activeH) return;
    const link = navRef.current.querySelector(`a[href="#${activeH}"]`);
    if (!link) return;

    // Use Range API to measure actual text dimensions (excluding padding)
    const range = document.createRange();
    range.selectNodeContents(link);
    const textRect = range.getBoundingClientRect();
    const navRect = navRef.current.getBoundingClientRect();

    if (textRect.width > 0 && textRect.height > 0) {
      setIndicator({
        top: textRect.top - navRect.top,
        height: textRect.height,
        left: textRect.left - navRect.left,
        width: textRect.width,
        ready: true,
      });
    }
  }, [activeH]);

  useEffect(() => { updateIndicator(); }, [updateIndicator]);
  useEffect(() => {
    const onResize = () => updateIndicator();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [updateIndicator]);

  const handleCommentSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (!comment.trim() || !post) return; setSubmitting(true); try { const r = await fetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: comment, postId: post.id }) }); if (r.ok) { const c = await r.json(); setPost(p => p ? { ...p, comments: [c, ...p.comments] } : p); setComment(''); } } finally { setSubmitting(false); } };

  if (loading) return <div className="min-h-[80vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-zinc-300 dark:border-white/20 border-t-zinc-600 dark:border-t-white rounded-full animate-spin" /></div>;
  if (!post) return <div className="min-h-[80vh] flex items-center justify-center"><div className="text-center"><h1 className="text-6xl font-bold text-zinc-100 dark:text-white/10 mb-4">404</h1><Link href="/" className="glass px-4 py-2 text-sm rounded-lg text-zinc-600 dark:text-white/60">Back</Link></div></div>;

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-10">
      <div className="flex gap-6 justify-center">
        {headings.length > 0 && (
          <aside className="hidden lg:block w-44 flex-shrink-0 relative">
            <div className="sticky top-20">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-white/20 mb-4">Contents</p>
              <nav ref={navRef} className="relative">
                {/* TOC links */}
                <div className="relative z-10 space-y-0.5">
                  {headings.map(h => (
                    <a
                      key={h.id}
                      href={`#${h.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' });
                        // Immediate update on click (skip debounce for instant feedback)
                        if (debounceRef.current) clearTimeout(debounceRef.current);
                        setActiveH(h.id);
                        activeHRef.current = h.id;
                      }}
                      className={`block text-[11px] py-1.5 px-2.5 rounded-lg transition-colors duration-200 leading-snug ${
                        activeH === h.id
                          ? 'text-zinc-900 dark:text-white font-semibold'
                          : 'text-zinc-400 dark:text-white/25 hover:text-zinc-600 dark:hover:text-white/50'
                      }`}
                    >
                      {h.text.length > 28 ? h.text.slice(0, 28) + '...' : h.text}
                    </a>
                  ))}
                </div>

                {/* Canvas-based liquid glass indicator */}
                {indicator.ready && (
                  <LiquidGlassIndicator
                    top={indicator.top - 4}
                    height={indicator.height + 8}
                    width={indicator.width + 14}
                    left={indicator.left - 7}
                  />
                )}
              </nav>
            </div>
          </aside>
        )}

        <article ref={articleRef} className="flex-1 min-w-0 max-w-4xl">
          <header className="mb-12 pb-8 border-b border-zinc-200/30 dark:border-white/[0.06]">
            <div className="flex flex-wrap gap-2 mb-4">{post.tags.map(t => <span key={t.id} className="px-2.5 py-0.5 text-[11px] font-medium text-zinc-500 dark:text-white/40 glass rounded-full">{t.name}</span>)}</div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white mb-4 leading-tight">{post.title}</h1>
            <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-white/40">
              {post.author.avatar && <img src={post.author.avatar} alt="" className="w-7 h-7 rounded-full" />}
              <span className="font-medium text-zinc-700 dark:text-white/60">{post.author.name || 'Anonymous'}</span>
              <span className="text-zinc-300 dark:text-white/15">&middot;</span>
              <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </header>

          <div className="mb-16">{post.content.split('\n').map((line, i) => {
            const trimmed = line.trim();
            if (!trimmed) return null;
            const mdMatch = trimmed.match(/^(#{1,3})\s+(.+)/);
            if (mdMatch) {
              const level = mdMatch[1].length;
              const text = mdMatch[2];
              const id = `h-${i}`;
              if (level === 1) return <h1 key={i} id={id} className="text-3xl font-bold text-zinc-900 dark:text-white mt-14 mb-6 scroll-mt-20">{text}</h1>;
              if (level === 2) return <h2 key={i} id={id} className="text-xl font-semibold text-zinc-900 dark:text-white mt-12 mb-4 scroll-mt-20">{text}</h2>;
              return <h3 key={i} id={id} className="text-lg font-semibold text-zinc-800 dark:text-white/90 mt-8 mb-3 scroll-mt-20">{text}</h3>;
            }
            // Bold text **text**
            const withBold = trimmed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            // Inline code `code`
            const withCode = withBold.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-zinc-100 dark:bg-white/10 rounded text-sm font-mono">$1</code>');
            return <p key={i} className="text-zinc-600 dark:text-white/55 leading-[1.85] mb-5 text-[15px]" dangerouslySetInnerHTML={{ __html: withCode }} />;
          })}</div>

          <section className="border-t border-zinc-200/30 dark:border-white/[0.06] pt-10">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Comments ({post.comments.length})</h2>
            {session?.user ? (<form onSubmit={handleCommentSubmit} className="mb-8"><textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your thoughts..." className="w-full p-4 glass rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/20 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-white/15 resize-none" rows={3} /><div className="flex justify-end mt-3"><button type="submit" disabled={submitting || !comment.trim()} className="px-5 py-2.5 bg-zinc-900/80 dark:bg-white/80 backdrop-blur-sm text-white dark:text-black text-sm font-medium rounded-xl disabled:opacity-50 transition-all">{submitting ? '...' : 'Post'}</button></div></form>)
            : (<div className="mb-8 p-5 glass rounded-xl text-center"><p className="text-sm text-zinc-500 dark:text-white/40"><Link href="/login" className="text-zinc-900 dark:text-white font-medium hover:underline">Sign in</Link> to comment</p></div>)}
            <div>{post.comments.map(c => <CommentItem key={c.id} comment={c} postId={post.id} postAuthorId={post.author.id} />)}</div>
          </section>
        </article>

        {related.length > 0 && (
          <aside className="hidden lg:block w-52 flex-shrink-0">
            <div className="sticky top-20">
              <div className="rounded-2xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-300 dark:text-white/15 mb-5">Related</p>
                <div className="space-y-5">
                  {related.map(r => (
                    <Link key={r.id} href={`/posts/${r.slug}`} className="block group">
                      <p className="text-[13px] font-medium text-zinc-500 dark:text-white/40 group-hover:text-zinc-800 dark:group-hover:text-white/70 transition-colors leading-snug mb-1.5">{r.title}</p>
                      {r.excerpt && <p className="text-[11px] text-zinc-400 dark:text-white/20 line-clamp-2 leading-relaxed">{r.excerpt}</p>}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
