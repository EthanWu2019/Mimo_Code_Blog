'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import gsap from 'gsap';

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
  const [headings, setHeadings] = useState<{ id: string; text: string }[]>([]); const [activeH, setActiveH] = useState('');
  const articleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([fetch(`/api/posts/${slug}`).then(r => r.json()), fetch(`/api/posts/${slug}/related`).then(r => r.json())])
      .then(([pd, rd]) => { setPost(pd); setRelated(rd); setLoading(false); if (articleRef.current) gsap.fromTo(articleRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' });
        const h: { id: string; text: string }[] = []; pd.content.split('\n\n').forEach((p: string, i: number) => { const t = p.trim(); if (t.length > 0 && t.length < 150 && !t.endsWith('.') && !t.endsWith('!') && !t.endsWith('?')) h.push({ id: `h-${i}`, text: t }); }); setHeadings(h.slice(0, 10));
      }).catch(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (headings.length === 0) return;
    const obs = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) setActiveH(e.target.id); }); }, { rootMargin: '-80px 0px -75% 0px' });
    headings.forEach(h => { const el = document.getElementById(h.id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [headings]);

  const handleCommentSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (!comment.trim() || !post) return; setSubmitting(true); try { const r = await fetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: comment, postId: post.id }) }); if (r.ok) { const c = await r.json(); setPost(p => p ? { ...p, comments: [c, ...p.comments] } : p); setComment(''); } } finally { setSubmitting(false); } };

  if (loading) return <div className="min-h-[80vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-zinc-300 dark:border-white/20 border-t-zinc-600 dark:border-t-white rounded-full animate-spin" /></div>;
  if (!post) return <div className="min-h-[80vh] flex items-center justify-center"><div className="text-center"><h1 className="text-6xl font-bold text-zinc-100 dark:text-white/10 mb-4">404</h1><Link href="/" className="glass px-4 py-2 text-sm rounded-lg text-zinc-600 dark:text-white/60">Back</Link></div></div>;

  return (
    <div className="max-w-[1500px] mx-auto px-6 py-10">
      <div className="flex gap-12 justify-center">
        {headings.length > 0 && (
          <aside className="hidden lg:block w-48 flex-shrink-0">
            <div className="sticky top-20">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-white/20 mb-4">Contents</p>
              <nav className="space-y-0.5">
                {headings.map(h => (
                  <a key={h.id} href={`#${h.id}`} className={`block text-[11px] py-1.5 px-2.5 rounded-lg transition-all duration-200 leading-snug ${activeH === h.id ? 'text-zinc-900 dark:text-white font-semibold glass' : 'text-zinc-400 dark:text-white/25 hover:text-zinc-600 dark:hover:text-white/50 hover:bg-black/[0.02] dark:hover:bg-white/[0.03]'}`}>
                    {h.text.length > 30 ? h.text.slice(0, 30) + '...' : h.text}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}

        <article ref={articleRef} className="flex-1 min-w-0 max-w-2xl">
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

          <div className="mb-16">{post.content.split('\n\n').map((p, i) => { const isH = headings.find(h => h.id === `h-${i}`); if (isH) return <h2 key={i} id={`h-${i}`} className="text-xl font-semibold text-zinc-900 dark:text-white mt-12 mb-4 scroll-mt-20">{p}</h2>; return <p key={i} className="text-zinc-600 dark:text-white/55 leading-[1.85] mb-5 text-[15px]">{p}</p>; })}</div>

          <section className="border-t border-zinc-200/30 dark:border-white/[0.06] pt-10">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Comments ({post.comments.length})</h2>
            {session?.user ? (<form onSubmit={handleCommentSubmit} className="mb-8"><textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your thoughts..." className="w-full p-4 glass rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/20 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-white/15 resize-none" rows={3} /><div className="flex justify-end mt-3"><button type="submit" disabled={submitting || !comment.trim()} className="px-5 py-2.5 bg-zinc-900/80 dark:bg-white/80 backdrop-blur-sm text-white dark:text-black text-sm font-medium rounded-xl disabled:opacity-50 transition-all">{submitting ? '...' : 'Post'}</button></div></form>)
            : (<div className="mb-8 p-5 glass rounded-xl text-center"><p className="text-sm text-zinc-500 dark:text-white/40"><Link href="/login" className="text-zinc-900 dark:text-white font-medium hover:underline">Sign in</Link> to comment</p></div>)}
            <div>{post.comments.map(c => <CommentItem key={c.id} comment={c} postId={post.id} postAuthorId={post.author.id} />)}</div>
          </section>
        </article>

        {related.length > 0 && (
          <aside className="hidden xl:block w-80 flex-shrink-0">
            <div className="sticky top-20">
              <div className="glass rounded-2xl p-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-white/20 mb-6">Related</p>
                <div className="space-y-6">
                  {related.map(r => (
                    <Link key={r.id} href={`/posts/${r.slug}`} className="block group">
                      <p className="text-sm font-bold text-zinc-800 dark:text-white/70 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors leading-snug mb-2">{r.title}</p>
                      {r.excerpt && <p className="text-[11px] text-zinc-400 dark:text-white/25 line-clamp-2 mb-2.5 ml-1">{r.excerpt}</p>}
                      <div className="flex gap-1.5 ml-1">{r.tags.slice(0, 2).map(t => <span key={t.id} className="text-[9px] font-medium uppercase text-zinc-400 dark:text-white/20 bg-black/[0.03] dark:bg-white/[0.04] px-1.5 py-0.5 rounded">{t.name}</span>)}</div>
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
