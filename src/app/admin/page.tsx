'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  role: string;
  createdAt: string;
  _count: { posts: number; comments: number };
}

interface AdminPost {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  viewCount: number;
  createdAt: string;
  author: { name: string | null; email: string };
  tags: { id: string; name: string }[];
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<'posts' | 'users'>('posts');
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', excerpt: '', coverImage: '', tags: '' });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      if ((session.user as any).role !== 'admin') {
        router.push('/');
        return;
      }
      fetchData();
    }
  }, [status, session, router]);

  const fetchData = async () => {
    try {
      const [postsRes, usersRes] = await Promise.all([
        fetch('/api/posts'),
        fetch('/api/admin/users'),
      ]);
      const postsData = await postsRes.json();
      const usersData = await usersRes.json();
      setPosts(postsData);
      setUsers(usersData);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
          authorId: (session?.user as any)?.id,
        }),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Post created!' });
        setShowForm(false);
        setFormData({ title: '', content: '', excerpt: '', coverImage: '', tags: '' });
        fetchData();
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.error || 'Failed' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (slug: string) => {
    if (!confirm('Delete this post?')) return;
    await fetch(`/api/posts/${slug}`, { method: 'DELETE' });
    fetchData();
  };

  const handleRoleChange = async (userId: string, role: string) => {
    await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role }),
    });
    fetchData();
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Delete this user and all their content?')) return;
    await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    fetchData();
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-300 dark:border-white/20 border-t-zinc-600 dark:border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Admin Dashboard</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-zinc-700 dark:hover:bg-white/90 transition-colors"
        >
          {showForm ? 'Cancel' : 'New Post'}
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20'}`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="mb-8 p-6 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.08] rounded-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Title" required className="w-full px-3 py-2 bg-white dark:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.08] rounded-lg text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/20" />
            <textarea value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} placeholder="Excerpt" rows={2} className="w-full px-3 py-2 bg-white dark:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.08] rounded-lg text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/20 resize-none" />
            <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} placeholder="Content" rows={10} required className="w-full px-3 py-2 bg-white dark:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.08] rounded-lg text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/20 resize-none" />
            <div className="grid grid-cols-2 gap-4">
              <input type="text" value={formData.coverImage} onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })} placeholder="Cover image URL" className="px-3 py-2 bg-white dark:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.08] rounded-lg text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/20" />
              <input type="text" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="Tags (comma separated)" className="px-3 py-2 bg-white dark:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.08] rounded-lg text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/20" />
            </div>
            <button type="submit" disabled={submitting} className="px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-zinc-700 dark:hover:bg-white/90 disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create Post'}
            </button>
          </form>
        </div>
      )}

      <div className="flex gap-1 border-b border-zinc-200 dark:border-white/[0.08] mb-6">
        <button onClick={() => setTab('posts')} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === 'posts' ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white' : 'border-transparent text-zinc-400 dark:text-white/30 hover:text-zinc-600 dark:hover:text-white/60'}`}>
          Posts ({posts.length})
        </button>
        <button onClick={() => setTab('users')} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === 'users' ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white' : 'border-transparent text-zinc-400 dark:text-white/30 hover:text-zinc-600 dark:hover:text-white/60'}`}>
          Users ({users.length})
        </button>
      </div>

      {tab === 'posts' && (
        <div className="space-y-1">
          {posts.map((post) => (
            <div key={post.id} className="flex items-center justify-between py-3 px-3 -mx-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-white/[0.02] group">
              <div>
                <Link href={`/posts/${post.slug}`} className="text-sm font-medium text-zinc-900 dark:text-white hover:underline">{post.title}</Link>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${post.published ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'}`}>{post.published ? 'Published' : 'Draft'}</span>
                  <span className="text-xs text-zinc-400 dark:text-white/20">by {post.author.name || post.author.email}</span>
                  <span className="text-xs text-zinc-400 dark:text-white/20">{post.viewCount} views</span>
                </div>
              </div>
              <button onClick={() => handleDeletePost(post.slug)} className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-opacity">Delete</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div className="space-y-1">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between py-3 px-3 -mx-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-white/[0.02] group">
              <div className="flex items-center gap-3">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-white/10 flex items-center justify-center text-xs font-medium text-zinc-500 dark:text-white/50">{user.name?.[0] || '?'}</div>
                )}
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">{user.name || 'Anonymous'}</p>
                  <p className="text-xs text-zinc-400 dark:text-white/30">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400 dark:text-white/20">{user._count.posts} posts, {user._count.comments} comments</span>
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className="px-2 py-1 text-xs bg-white dark:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.08] rounded text-zinc-700 dark:text-white/70 focus:outline-none"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <button onClick={() => handleDeleteUser(user.id)} className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-opacity">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
