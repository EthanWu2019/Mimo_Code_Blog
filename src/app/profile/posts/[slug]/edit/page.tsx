'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import katex from 'katex';

// Simple markdown parser
function parseMarkdown(md: string): string {
  let html = md
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-zinc-100 dark:bg-white/[0.06] rounded-lg p-4 my-3 overflow-x-auto"><code class="text-sm text-zinc-800 dark:text-white/70 font-mono">$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-zinc-100 dark:bg-white/[0.06] rounded text-sm text-pink-600 dark:text-pink-400 font-mono">$1</code>')
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-zinc-900 dark:text-white mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">$1</h1>')
    // Bold & italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-zinc-900 dark:text-white">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote class="pl-4 border-l-2 border-zinc-300 dark:border-white/20 text-zinc-600 dark:text-white/50 italic my-2">$1</blockquote>')
    // Unordered lists
    .replace(/^[-*] (.+)$/gm, '<li class="ml-4 list-disc text-zinc-700 dark:text-white/60">$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal text-zinc-700 dark:text-white/60">$1</li>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-lg max-w-full my-3" />')
    // Horizontal rules
    .replace(/^---$/gm, '<hr class="my-6 border-zinc-200 dark:border-white/10" />')
    // Line breaks (double newline = paragraph)
    .replace(/\n\n/g, '</p><p class="text-zinc-700 dark:text-white/60 leading-relaxed mb-3">')
    // Single newlines
    .replace(/\n/g, '<br />');

  return `<p class="text-zinc-700 dark:text-white/60 leading-relaxed mb-3">${html}</p>`;
}

// Render LaTeX in HTML string
function renderLatex(html: string): string {
  // Block LaTeX: $$...$$
  html = html.replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => {
    try {
      return `<div class="my-4 text-center overflow-x-auto">${katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false })}</div>`;
    } catch {
      return `<code class="text-red-500">${tex}</code>`;
    }
  });
  // Inline LaTeX: $...$
  html = html.replace(/\$([^\$\n]+?)\$/g, (_, tex) => {
    try {
      return katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false });
    } catch {
      return `<code class="text-red-500">${tex}</code>`;
    }
  });
  return html;
}

export default function EditPostPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status === 'authenticated') {
      fetch(`/api/posts/${slug}`)
        .then(async (res) => {
          if (!res.ok) throw new Error('Failed to load post');
          return res.json();
        })
        .then((post) => {
          setTitle(post.title || '');
          setExcerpt(post.excerpt || '');
          setContent(post.content || '');
          setTags(post.tags?.map((t: any) => t.name).join(', ') || '');
          setPublished(post.published ?? true);
          setLoading(false);
        })
        .catch(() => {
          setMessage({ type: 'error', text: 'Failed to load post' });
          setLoading(false);
        });
    }
  }, [status, slug, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/posts/${slug}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          excerpt,
          content,
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
          published,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessage({ type: 'success', text: 'Post updated!' });
        if (data.slug && data.slug !== slug) {
          router.push(`/profile/posts/${data.slug}/edit`);
        }
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.error || 'Failed to update' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setSaving(false);
    }
  };

  const previewHtml = renderLatex(parseMarkdown(content));

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-300 dark:border-white/20 border-t-zinc-600 dark:border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/katex@0.17.0/dist/katex.min.css"
        crossOrigin="anonymous"
      />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Edit Post</h1>
          <button
            onClick={() => router.push('/profile')}
            className="px-3 py-1.5 text-sm text-zinc-500 dark:text-white/40 hover:text-zinc-700 dark:hover:text-white/70 transition-colors"
          >
            ← Back to Profile
          </button>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
            : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            required
            className="w-full px-4 py-3 bg-white/50 dark:bg-white/[0.03] backdrop-blur-xl border border-zinc-200/50 dark:border-white/[0.06] rounded-xl text-zinc-900 dark:text-white text-lg font-semibold placeholder-zinc-400 dark:placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/15"
          />

          {/* Excerpt */}
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Brief excerpt (optional)"
            rows={2}
            className="w-full px-4 py-3 bg-white/50 dark:bg-white/[0.03] backdrop-blur-xl border border-zinc-200/50 dark:border-white/[0.06] rounded-xl text-zinc-900 dark:text-white text-sm placeholder-zinc-400 dark:placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/15 resize-none"
          />

          {/* Tags & Published */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Tags (comma separated)"
              className="sm:col-span-2 px-4 py-2.5 bg-white/50 dark:bg-white/[0.03] backdrop-blur-xl border border-zinc-200/50 dark:border-white/[0.06] rounded-xl text-zinc-900 dark:text-white text-sm placeholder-zinc-400 dark:placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/15"
            />
            <label className="flex items-center gap-3 px-4 py-2.5 bg-white/50 dark:bg-white/[0.03] backdrop-blur-xl border border-zinc-200/50 dark:border-white/[0.06] rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-300 dark:border-white/20 text-zinc-900 dark:text-white focus:ring-zinc-300 dark:focus:ring-white/15"
              />
              <span className="text-sm text-zinc-700 dark:text-white/60">Published</span>
            </label>
          </div>

          {/* Editor + Preview split pane */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[500px]">
            {/* Editor pane */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 bg-white/50 dark:bg-white/[0.03] backdrop-blur-xl border border-zinc-200/50 dark:border-white/[0.06] rounded-t-xl border-b-0">
                <span className="text-xs font-medium text-zinc-500 dark:text-white/30 uppercase tracking-wider">Markdown & LaTeX</span>
                <span className="text-[10px] text-zinc-400 dark:text-white/20">Use $...$ for inline, $$...$$ for block math</span>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post content in Markdown...&#10;&#10;Supports LaTeX: $E = mc^2$ or $$\int_0^\infty e^{-x} dx = 1$$"
                required
                className="flex-1 w-full px-4 py-3 bg-white/50 dark:bg-white/[0.03] backdrop-blur-xl border border-zinc-200/50 dark:border-white/[0.06] rounded-b-xl text-zinc-900 dark:text-white text-sm font-mono placeholder-zinc-400 dark:placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/15 resize-none leading-relaxed"
              />
            </div>

            {/* Preview pane */}
            <div className="flex flex-col">
              <div className="px-4 py-2 bg-white/50 dark:bg-white/[0.03] backdrop-blur-xl border border-zinc-200/50 dark:border-white/[0.06] rounded-t-xl border-b-0">
                <span className="text-xs font-medium text-zinc-500 dark:text-white/30 uppercase tracking-wider">Preview</span>
              </div>
              <div
                className="flex-1 w-full px-4 py-3 bg-white/50 dark:bg-white/[0.03] backdrop-blur-xl border border-zinc-200/50 dark:border-white/[0.06] rounded-b-xl overflow-y-auto prose-sm"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 justify-end">
            <button
              type="button"
              onClick={() => router.push('/profile')}
              className="px-5 py-2.5 text-sm text-zinc-500 dark:text-white/40 hover:text-zinc-700 dark:hover:text-white/70 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-zinc-900/90 dark:bg-white/90 backdrop-blur-sm text-white dark:text-black text-sm font-medium rounded-xl hover:bg-zinc-700 dark:hover:bg-white disabled:opacity-50 transition-all"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
