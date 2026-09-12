'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import gsap from 'gsap';

type Author = { id: string; name: string | null; image: string | null };
type Message = {
  id: string;
  content: string;
  createdAt: string;
  authorId: string;
  author: Author;
};

const ADMIN_EMAILS = new Set<string>([
  'ethanwucz2019@gmail.com',
  '3401895383@qq.com',
  'ethanwucz2026@gmail.com',
]);

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, Math.floor((now - then) / 1000));
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function MessagesBoard() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isAdmin =
    !!session?.user?.email && ADMIN_EMAILS.has(String(session.user.email).toLowerCase());
  const myId = (session?.user as any)?.id as string | undefined;

  const fetchPage = useCallback(async (cursor: string | null, append: boolean) => {
    const url = new URL('/api/messages', window.location.origin);
    if (cursor) url.searchParams.set('cursor', cursor);
    const r = await fetch(url.toString());
    if (!r.ok) throw new Error(`Failed to load messages (${r.status})`);
    const data = await r.json();
    setMessages((prev) => (append ? [...prev, ...data.messages] : data.messages));
    setNextCursor(data.nextCursor ?? null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await fetchPage(null, false);
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchPage]);

  // Entrance animation — fade up the container on mount, matching the
  // /profile page's gsap.fromTo so the page feels like the rest of
  // the site. Runs on first mount only.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    gsap.fromTo(
      el,
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
    );
  }, []);

  // Infinite scroll: load next page when sentinel enters viewport
  useEffect(() => {
    if (!nextCursor || loadingMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0]?.isIntersecting && nextCursor && !loadingMore) {
          setLoadingMore(true);
          try {
            await fetchPage(nextCursor, true);
          } catch (e: any) {
            setError(e.message);
          } finally {
            setLoadingMore(false);
          }
        }
      },
      { rootMargin: '120px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [nextCursor, loadingMore, fetchPage]);

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (posting || draft.trim().length === 0) return;
    setPosting(true);
    setError(null);
    try {
      const r = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: draft.trim() }),
      });
      if (r.status === 401) {
        setError('Please sign in to leave a message.');
        return;
      }
      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        setError(body.error ?? `Failed to post (HTTP ${r.status})`);
        return;
      }
      const { message } = await r.json();
      setMessages((prev) => [message, ...prev]);
      setDraft('');
    } catch (e: any) {
      setError(e.message ?? 'Failed to post');
    } finally {
      setPosting(false);
    }
  }

  async function handleDelete(id: string) {
    if (deletingId) return;
    if (!confirm('Delete this message?')) return;
    setDeletingId(id);
    try {
      const r = await fetch(`/api/messages/${id}`, { method: 'DELETE' });
      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        setError(body.error ?? `Failed to delete (HTTP ${r.status})`);
        return;
      }
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (e: any) {
      setError(e.message ?? 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div ref={containerRef} className="min-h-[calc(100vh-80px)] px-4 sm:px-6 py-10 sm:py-14">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500 font-medium mb-3">
            Sign the guestbook
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl leading-[1.1] tracking-[-0.02em] text-zinc-900 dark:text-white">
            Messages
          </h1>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-prose">
            Anyone signed in can leave a short note. Newest first. You can delete your own messages
            — you can’t edit them after posting. <span className="text-zinc-400 dark:text-zinc-500">No replies, no threads.</span>
          </p>
        </div>

        {/* Composer */}
        <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-zinc-50/40 dark:bg-white/[0.02] p-4 sm:p-5 mb-8">
          {status === 'loading' ? (
            <p className="text-sm text-zinc-400 dark:text-zinc-500">Loading…</p>
          ) : session?.user ? (
            <form onSubmit={handlePost}>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="Leave a message…"
                className="w-full resize-none bg-transparent border-0 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-0"
              />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                  {draft.length}/1000
                </span>
                <button
                  type="submit"
                  disabled={posting || draft.trim().length === 0}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-40 transition-colors"
                >
                  {posting ? 'Posting…' : 'Post'}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              <Link href="/login?callbackUrl=/messages" className="text-zinc-900 dark:text-white font-medium underline underline-offset-4 decoration-zinc-300 dark:decoration-zinc-700 hover:decoration-zinc-900 dark:hover:decoration-white transition-colors">
                Sign in
              </Link>{' '}
              to leave a message. You can still read what others have posted.
            </p>
          )}
          {error && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>

        {/* List — masonry / "whiteboard" layout. CSS multi-column flow
            packs cards into 1-3 columns depending on viewport width;
            each card's height varies with its content, so cards settle
            into a hand-pinned corkboard rather than a uniform feed. */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-6 h-6 border-2 border-zinc-300 dark:border-white/20 border-t-zinc-600 dark:border-t-white rounded-full animate-spin" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Loading…</p>
          </div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center py-12">
            No messages yet. Be the first.
          </p>
        ) : (
          <ul
            className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]"
            style={{ columnFill: 'balance' }}
          >
            {messages.map((m, i) => {
              const canDelete = !!myId && (m.authorId === myId || isAdmin);
              // No tilt — cards sit flat. The masonry column flow + the
              // variable card heights already give the board a hand-arranged
              // feel; tilt added transform without giving much extra.
              const tilt = '';
              return (
                <li
                  key={m.id}
                  className={`group mb-4 break-inside-avoid block w-full rounded-xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/60 dark:bg-white/[0.025] p-4 sm:p-5 transition-all duration-300 hover:scale-[1.015] hover:shadow-lg hover:shadow-zinc-900/[0.06] dark:hover:shadow-black/30 hover:border-zinc-300 dark:hover:border-zinc-700 ${tilt}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    {m.author.image ? (
                      <img
                        src={m.author.image}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-zinc-200/70 dark:ring-zinc-800/70"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-medium text-zinc-500 dark:text-zinc-300 shrink-0">
                        {(m.author.name?.[0] || '?').toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <div className="min-w-0">
                          <span className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                            {m.author.name || 'Anonymous'}
                          </span>
                          <span className="ml-2 text-[10px] uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
                            {timeAgo(m.createdAt)}
                          </span>
                        </div>
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDelete(m.id)}
                            disabled={deletingId === m.id}
                            className="text-[11px] text-zinc-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          >
                            {deletingId === m.id ? 'Deleting…' : 'Delete'}
                          </button>
                        )}
                      </div>
                      <p className="mt-1.5 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap break-words">
                        {m.content}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* Sentinel + load-more spinner */}
        <div ref={sentinelRef} className="h-12" />
        {loadingMore && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center py-2">Loading more…</p>
        )}
        {!loading && !nextCursor && messages.length > 0 && (
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-300 dark:text-zinc-700 text-center py-6">
            — end of board —
          </p>
        )}
      </div>
    </div>
  );
}
