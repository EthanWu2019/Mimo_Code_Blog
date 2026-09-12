'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import ImageCropper from '@/components/ImageCropper';

type Author = { id: string; name: string | null; image: string | null };
type Post = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  viewCount: number;
  createdAt: string;
};
type Comment = {
  id: string;
  content: string;
  createdAt: string;
  post: { title: string; slug: string };
};

export default function ProfilePage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Tab list depends on whether the viewer is the site owner. Owners
  // see Posts (their blog) + Comments + Settings. Everyone else sees
  // Messages (their guestbook posts) + Comments (their replies on
  // posts) + Settings.
  const [tab, setTab] = useState<'main' | 'comments' | 'settings'>('main');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [pwOld, setPwOld] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [deletingPostSlug, setDeletingPostSlug] = useState<string | null>(null);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      fetch('/api/user/profile')
        .then(async (res) => {
          if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed');
          return res.json();
        })
        .then((data) => {
          setProfile(data);
          setName(data.name || '');
          setLoading(false);
          if (containerRef.current)
            gsap.fromTo(
              containerRef.current,
              { y: 20, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
            );
        })
        .catch((e) => {
          setError(e.message);
          setLoading(false);
        });
    }
  }, [status, router]);

  const handleSaveName = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile((p: any) => ({ ...p, name: data.name }));
        setSaveMsg('Saved!');
        await updateSession();
      } else setSaveMsg('Failed to save');
    } catch {
      setSaveMsg('Failed to save');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 2000);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwNew !== pwConfirm) {
      setPwMsg('Passwords do not match');
      return;
    }
    if (pwNew.length < 6) {
      setPwMsg('Password must be at least 6 characters');
      return;
    }
    setPwLoading(true);
    setPwMsg('');
    try {
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwOld, newPassword: pwNew }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwMsg('Password changed!');
        setPwOld('');
        setPwNew('');
        setPwConfirm('');
      } else setPwMsg(data.error || 'Failed');
    } catch {
      setPwMsg('Failed');
    } finally {
      setPwLoading(false);
      setTimeout(() => setPwMsg(''), 3000);
    }
  };

  const handleAvatarUpload = async (url: string) => {
    setAvatarError('');
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, avatar: url }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setAvatarError(data.error || 'Failed to save avatar');
        return;
      }
      setProfile((p: any) => ({ ...p, image: url }));
      await updateSession();
      setShowCropper(false);
    } catch {
      setAvatarError('Network error. Avatar upload failed.');
    }
  };

  const handleDeletePost = async (slug: string) => {
    if (!confirm('Delete this post?')) return;
    setDeletingPostSlug(slug);
    try {
      const res = await fetch(`/api/posts/${slug}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setProfile((p: any) => ({
        ...p,
        posts: p.posts.filter((x: Post) => x.slug !== slug),
      }));
    } catch (e: any) {
      setError(e.message ?? 'Failed to delete');
    } finally {
      setDeletingPostSlug(null);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    setDeletingMessageId(id);
    try {
      const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setProfile((p: any) => ({
        ...p,
        messages: p.messages.filter((m: { id: string }) => m.id !== id),
      }));
    } catch (e: any) {
      setError(e.message ?? 'Failed to delete');
    } finally {
      setDeletingMessageId(null);
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (!confirm('Delete this comment?')) return;
    setDeletingCommentId(id);
    try {
      // The blog post comment endpoint (delete) accepts DELETE with
      // comment id in the body. We hit /api/posts/[slug]/comments
      // for the slug, then call DELETE on the comment with the id.
      // We need the slug first; the comment payload includes it.
      const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setProfile((p: any) => ({
        ...p,
        comments: p.comments.filter((x: any) => x.id !== id),
      }));
    } catch (e: any) {
      setError(e.message ?? 'Failed to delete');
    } finally {
      setDeletingCommentId(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-300 dark:border-white/20 border-t-zinc-600 dark:border-t-white rounded-full animate-spin" />
      </div>
    );
  }
  if (error)
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  if (!profile) return null;

  const isOwner = !!profile.isAdmin; // owner = ADMIN_EMAILS
  const userPosts: Post[] = profile.posts || [];
  const userMessages = profile.messages || [];
  const userComments: Comment[] = profile.comments || [];

  const mainTabLabel = isOwner ? 'Posts' : 'Messages';
  const mainTabCount = isOwner ? userPosts.length : userMessages.length;

  return (
    <div ref={containerRef} className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex items-center gap-5 mb-10">
        <div
          className="relative group cursor-pointer shrink-0"
          onClick={() => {
            setShowCropper(true);
            setAvatarError('');
          }}
        >
          {profile.image ? (
            <img
              src={profile.image}
              alt=""
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-white/10 flex items-center justify-center text-xl sm:text-2xl font-bold text-zinc-400 dark:text-white/40">
              {profile.name?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
        {avatarError && (
          <div className="absolute top-full left-0 mt-2 px-3 py-1.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg whitespace-nowrap z-10">
            <p className="text-xs text-red-600 dark:text-red-400">{avatarError}</p>
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {profile.name || 'Anonymous'}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-white/40">{profile.email}</p>
          <p className="text-xs text-zinc-400 dark:text-white/20 mt-0.5">
            Joined{' '}
            {new Date(profile.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-zinc-200/50 dark:border-white/[0.06] mb-8">
        <div className="flex gap-1 flex-1">
          {(
            [
              { key: 'main', label: `${mainTabLabel} (${mainTabCount})` },
              { key: 'comments', label: `Comments (${userComments.length})` },
              { key: 'settings', label: 'Settings' },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 sm:px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white'
                  : 'border-transparent text-zinc-400 dark:text-white/30 hover:text-zinc-600 dark:hover:text-white/60'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {tab === 'main' && isOwner && (
          <Link
            href="/profile/posts/new"
            className="px-3 py-1.5 text-xs font-medium bg-zinc-900/90 dark:bg-white/90 backdrop-blur-sm text-white dark:text-black rounded-lg hover:bg-zinc-700 dark:hover:bg-white transition-all"
          >
            + New Post
          </Link>
        )}
        {tab === 'main' && !isOwner && (
          <Link
            href="/messages"
            className="px-3 py-1.5 text-xs font-medium bg-zinc-900/90 dark:bg-white/90 backdrop-blur-sm text-white dark:text-black rounded-lg hover:bg-zinc-700 dark:hover:bg-white transition-all"
          >
            + New Message
          </Link>
        )}
      </div>

      {tab === 'main' && isOwner && (
        <div className="space-y-1">
          {userPosts.length === 0 ? (
            <p className="py-8 text-center text-zinc-400 dark:text-white/30">No posts yet.</p>
          ) : (
            userPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between py-3 px-3 -mx-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/[0.03] backdrop-blur-sm group transition-all"
              >
                <div>
                  <Link
                    href={`/posts/${post.slug}`}
                    className="text-sm font-medium text-zinc-900 dark:text-white hover:underline"
                  >
                    {post.title}
                  </Link>
                  <div className="flex items-center gap-3 mt-1">
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        post.published
                          ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
                      }`}
                    >
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-xs text-zinc-400 dark:text-white/20">
                      {post.viewCount} views
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/profile/posts/${post.slug}/edit`}
                    className="px-2 py-1 text-xs text-zinc-500 dark:text-white/40 hover:text-zinc-700 dark:hover:text-white/70 hover:bg-zinc-100 dark:hover:bg-white/[0.06] rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeletePost(post.slug)}
                    disabled={deletingPostSlug === post.slug}
                    className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 disabled:opacity-50 transition-opacity"
                  >
                    {deletingPostSlug === post.slug ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'main' && !isOwner && (
        <div className="space-y-1">
          {userMessages.length === 0 ? (
            <p className="py-8 text-center text-zinc-400 dark:text-white/30">
              No messages yet.{' '}
              <Link href="/messages" className="underline">
                Write one
              </Link>
              .
            </p>
          ) : (
            userMessages.map((m: any) => (
              <div
                key={m.id}
                className="py-3 px-3 -mx-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/[0.03] group transition-all"
              >
                <p className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
                  {m.content}
                </p>
                <div className="mt-1.5 flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
                    {new Date(m.createdAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                  <button
                    onClick={() => handleDeleteMessage(m.id)}
                    disabled={deletingMessageId === m.id}
                    className="text-[11px] text-zinc-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    {deletingMessageId === m.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'comments' && (
        <div className="space-y-4">
          {userComments.length === 0 ? (
            <p className="py-8 text-center text-zinc-400 dark:text-white/30">
              No comments yet.
            </p>
          ) : (
            userComments.map((c) => (
              <div
                key={c.id}
                className="py-3 border-b border-zinc-100/50 dark:border-white/[0.06] group flex items-start justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/posts/${c.post.slug}`}
                    className="text-xs text-zinc-400 dark:text-zinc-30 hover:text-zinc-600 dark:hover:text-white/50"
                  >
                    on {c.post.title}
                  </Link>
                  <p className="text-sm text-zinc-700 dark:text-white/60 mt-1">{c.content}</p>
                </div>
                <button
                  onClick={() => handleDeleteComment(c.id)}
                  disabled={deletingCommentId === c.id}
                  className="shrink-0 text-[11px] text-zinc-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                >
                  {deletingCommentId === c.id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'settings' && (
        <div className="space-y-8">
          <div className="bg-white/50 dark:bg-white/[0.03] backdrop-blur-xl border border-zinc-200/50 dark:border-white/[0.06] rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
              Display Name
            </h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 px-3 py-2 bg-white/60 dark:bg-white/[0.06] backdrop-blur-sm border border-zinc-200/50 dark:border-white/[0.08] rounded-lg text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/15"
              />
              <button
                onClick={handleSaveName}
                disabled={saving}
                className="px-4 py-2 bg-zinc-900/90 dark:bg-white/90 backdrop-blur-sm text-white dark:text-black text-sm font-medium rounded-lg disabled:opacity-50 transition-all"
              >
                {saving ? '...' : 'Save'}
              </button>
            </div>
            {saveMsg && (
              <p
                className={`text-xs mt-2 ${
                  saveMsg.includes('Saved') ? 'text-emerald-500' : 'text-red-500'
                }`}
              >
                {saveMsg}
              </p>
            )}
          </div>

          <div className="bg-white/50 dark:bg-white/[0.03] backdrop-blur-xl border border-zinc-200/50 dark:border-white/[0.06] rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
              Change Password
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <input
                type="password"
                value={pwOld}
                onChange={(e) => setPwOld(e.target.value)}
                placeholder="Current password"
                required
                className="w-full px-3 py-2 bg-white/60 dark:bg-white/[0.06] backdrop-blur-sm border border-zinc-200/50 dark:border-white/[0.08] rounded-lg text-zinc-900 dark:text-white text-sm placeholder-zinc-400 dark:placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/15"
              />
              <input
                type="password"
                value={pwNew}
                onChange={(e) => setPwNew(e.target.value)}
                placeholder="New password (min 6 chars)"
                required
                minLength={6}
                className="w-full px-3 py-2 bg-white/60 dark:bg-white/[0.06] backdrop-blur-sm border border-zinc-200/50 dark:border-white/[0.08] rounded-lg text-zinc-900 dark:text-white text-sm placeholder-zinc-400 dark:placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/15"
              />
              <input
                type="password"
                value={pwConfirm}
                onChange={(e) => setPwConfirm(e.target.value)}
                placeholder="Confirm new password"
                required
                className="w-full px-3 py-2 bg-white/60 dark:bg-white/[0.06] backdrop-blur-sm border border-zinc-200/50 dark:border-white/[0.08] rounded-lg text-zinc-900 dark:text-white text-sm placeholder-zinc-400 dark:placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/15"
              />
              <button
                type="submit"
                disabled={pwLoading}
                className="px-4 py-2 bg-zinc-900/90 dark:bg-white/90 backdrop-blur-sm text-white dark:text-black text-sm font-medium rounded-lg disabled:opacity-50 transition-all"
              >
                {pwLoading ? '...' : 'Update Password'}
              </button>
            </form>
            {pwMsg && (
              <p
                className={`text-xs mt-2 ${
                  pwMsg.includes('changed') ? 'text-emerald-500' : 'text-red-500'
                }`}
              >
                {pwMsg}
              </p>
            )}
          </div>

          <div className="bg-white/50 dark:bg-white/[0.03] backdrop-blur-xl border border-zinc-200/50 dark:border-white/[0.06] rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
              Account
            </h3>
            <p className="text-xs text-zinc-500 dark:text-white/30 mb-4">
              Signed in as{' '}
              <span className="font-medium text-zinc-700 dark:text-white/60">
                {profile.email}
              </span>
            </p>
            <button
              type="button"
              onClick={() => setShowSignOutConfirm(true)}
              className="px-4 py-2 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
      {showCropper && (
        <ImageCropper onCrop={handleAvatarUpload} onCancel={() => setShowCropper(false)} />
      )}

      {showSignOutConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="signout-title"
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
        >
          <div
            className="absolute inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSignOutConfirm(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-sm bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200/60 dark:border-white/[0.08] rounded-2xl shadow-2xl shadow-zinc-900/10 dark:shadow-black/40 p-6">
            <h2
              id="signout-title"
              className="text-base font-semibold text-zinc-900 dark:text-white"
            >
              Sign out of Ethan Wu?
            </h2>
            <p className="text-sm text-zinc-500 dark:text-white/40 mt-2">
              You&apos;ll need to sign in again with Google, GitHub, or your email and password to
              access your account.
            </p>
            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setShowSignOutConfirm(false)}
                autoFocus
                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-white/70 hover:bg-zinc-100 dark:hover:bg-white/[0.06] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
