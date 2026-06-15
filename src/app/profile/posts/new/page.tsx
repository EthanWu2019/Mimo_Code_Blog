'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import katex from 'katex';

/* ------------------------------------------------------------------ */
/*  Simple Markdown + LaTeX parser (no external markdown library)      */
/* ------------------------------------------------------------------ */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parseMarkdown(raw: string): string {
  // Step 1 — protect code blocks
  const codeBlocks: string[] = [];
  let md = raw.replace(/```([\s\S]*?)```/g, (_m, code: string) => {
    const idx = codeBlocks.length;
    codeBlocks.push(`<pre class="bg-zinc-100 dark:bg-white/[0.06] border border-zinc-200/50 dark:border-white/[0.08] rounded-lg p-4 overflow-x-auto text-sm font-mono text-zinc-800 dark:text-white/80"><code>${escapeHtml(code.trim())}</code></pre>`);
    return `%%CODEBLOCK_${idx}%%`;
  });

  // Step 2 — protect inline code
  const inlineCodes: string[] = [];
  md = md.replace(/`([^`\n]+?)`/g, (_m, code: string) => {
    const idx = inlineCodes.length;
    inlineCodes.push(`<code class="bg-zinc-100 dark:bg-white/[0.06] px-1.5 py-0.5 rounded text-sm font-mono text-pink-600 dark:text-pink-400">${escapeHtml(code)}</code>`);
    return `%%INLINE_${idx}%%`;
  });

  // Step 3 — protect display math ($$...$$)
  const displayMaths: string[] = [];
  md = md.replace(/\$\$([\s\S]+?)\$\$/g, (_m, math: string) => {
    const idx = displayMaths.length;
    try {
      const html = katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
      displayMaths.push(`<div class="my-4 overflow-x-auto py-2">${html}</div>`);
    } catch {
      displayMaths.push(`<div class="my-4 text-red-500">${escapeHtml(math)}</div>`);
    }
    return `%%DISPLAYMATH_${idx}%%`;
  });

  // Step 4 — protect inline math ($...$)
  const inlineMaths: string[] = [];
  md = md.replace(/\$([^\$\n]+?)\$/g, (_m, math: string) => {
    const idx = inlineMaths.length;
    try {
      const html = katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
      inlineMaths.push(html);
    } catch {
      inlineMaths.push(`<span class="text-red-500">${escapeHtml(math)}</span>`);
    }
    return `%%INLINEMATH_${idx}%%`;
  });

  // Step 5 — block-level rendering
  const lines = md.split('\n');
  let html = '';
  let inList = false;
  let listType = '';
  let inParagraph = false;

  const flushParagraph = () => {
    if (inParagraph) {
      html += '</p>';
      inParagraph = false;
    }
  };
  const flushList = () => {
    if (inList) {
      html += listType === 'ul' ? '</ul>' : '</ol>';
      inList = false;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // blank line
    if (trimmed === '') {
      flushParagraph();
      flushList();
      continue;
    }

    // headings
    const h3 = trimmed.match(/^### (.+)$/);
    const h2 = trimmed.match(/^## (.+)$/);
    const h1 = trimmed.match(/^# (.+)$/);
    if (h1) {
      flushParagraph();
      flushList();
      html += `<h1 class="text-3xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">${inlineFormat(h1[1])}</h1>`;
      continue;
    }
    if (h2) {
      flushParagraph();
      flushList();
      html += `<h2 class="text-2xl font-bold text-zinc-900 dark:text-white mt-6 mb-3">${inlineFormat(h2[1])}</h2>`;
      continue;
    }
    if (h3) {
      flushParagraph();
      flushList();
      html += `<h3 class="text-xl font-bold text-zinc-900 dark:text-white mt-5 mb-2">${inlineFormat(h3[1])}</h3>`;
      continue;
    }

    // unordered list
    const ulMatch = trimmed.match(/^[-*+] (.+)$/);
    if (ulMatch) {
      flushParagraph();
      if (!inList || listType !== 'ul') {
        flushList();
        html += '<ul class="list-disc pl-6 my-3 space-y-1 text-zinc-700 dark:text-white/70">';
        inList = true;
        listType = 'ul';
      }
      html += `<li>${inlineFormat(ulMatch[1])}</li>`;
      continue;
    }

    // ordered list
    const olMatch = trimmed.match(/^\d+\. (.+)$/);
    if (olMatch) {
      flushParagraph();
      if (!inList || listType !== 'ol') {
        flushList();
        html += '<ol class="list-decimal pl-6 my-3 space-y-1 text-zinc-700 dark:text-white/70">';
        inList = true;
        listType = 'ol';
      }
      html += `<li>${inlineFormat(olMatch[1])}</li>`;
      continue;
    }

    // regular paragraph line
    flushList();
    if (!inParagraph) {
      html += '<p class="text-zinc-700 dark:text-white/70 leading-relaxed mb-3">';
      inParagraph = true;
    } else {
      html += ' ';
    }
    html += inlineFormat(trimmed);
  }

  flushParagraph();
  flushList();

  // Restore protected blocks
  for (let i = 0; i < codeBlocks.length; i++) {
    html = html.replace(`%%CODEBLOCK_${i}%%`, codeBlocks[i]);
  }
  for (let i = 0; i < inlineCodes.length; i++) {
    html = html.replace(`%%INLINE_${i}%%`, inlineCodes[i]);
  }
  for (let i = 0; i < displayMaths.length; i++) {
    html = html.replace(`%%DISPLAYMATH_${i}%%`, displayMaths[i]);
  }
  for (let i = 0; i < inlineMaths.length; i++) {
    html = html.replace(`%%INLINEMATH_${i}%%`, inlineMaths[i]);
  }

  return html;
}

/** Inline-level formatting: bold + already-placed placeholders */
function inlineFormat(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-zinc-900 dark:text-white">$1</strong>');
}

/* ------------------------------------------------------------------ */
/*  Editor Page                                                        */
/* ------------------------------------------------------------------ */

export default function NewPostPage() {
  const { status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  // Live-preview HTML
  const previewHtml = useCallback(() => parseMarkdown(content), [content]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = tagInput.trim();
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!content.trim()) {
      setError('Content is required');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, excerpt, content, tags, published }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create post');
      }
      const post = await res.json();
      setSuccess(`Post created! Slug: ${post.slug}`);
      setTimeout(() => router.push('/profile'), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Tab key support in textarea
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      setContent(newContent);
      // move cursor after tab
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-300 dark:border-white/20 border-t-zinc-600 dark:border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* KaTeX CSS */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css"
        crossOrigin="anonymous"
      />

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            New Post
          </h1>
          <div className="flex items-center gap-3">
            {/* Publish / Draft toggle */}
            <button
              onClick={() => setPublished(!published)}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                published
                  ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-yellow-500/10 dark:bg-yellow-500/15 border-yellow-300 dark:border-yellow-500/30 text-yellow-700 dark:text-yellow-400'
              }`}
            >
              {published ? '✦ Published' : '◆ Draft'}
            </button>

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-zinc-900/90 dark:bg-white/90 backdrop-blur-sm text-white dark:text-black text-sm font-medium rounded-lg disabled:opacity-50 transition-all hover:shadow-lg"
            >
              {saving ? 'Saving…' : 'Save Post'}
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <p className="text-sm text-red-500 mb-4">{error}</p>
        )}
        {success && (
          <p className="text-sm text-emerald-500 mb-4">{success}</p>
        )}

        {/* Title */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-zinc-500 dark:text-white/40 mb-1.5">
            大标题
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title…"
            className="w-full px-4 py-3 text-xl font-bold bg-white/50 dark:bg-white/[0.03] backdrop-blur-xl border border-zinc-200/50 dark:border-white/[0.06] rounded-2xl text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/15"
          />
        </div>

        {/* Subtitle / Excerpt */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-zinc-500 dark:text-white/40 mb-1.5">
            副标题
          </label>
          <input
            type="text"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="A brief description…"
            className="w-full px-4 py-2.5 text-base bg-white/50 dark:bg-white/[0.03] backdrop-blur-xl border border-zinc-200/50 dark:border-white/[0.06] rounded-2xl text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/15"
          />
        </div>

        {/* Tags */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-zinc-500 dark:text-white/40 mb-1.5">
            Tags
          </label>
          <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-white/50 dark:bg-white/[0.03] backdrop-blur-xl border border-zinc-200/50 dark:border-white/[0.06] rounded-2xl min-h-[48px]">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-zinc-200/70 dark:bg-white/[0.08] text-zinc-700 dark:text-white/80 rounded-full"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-0.5 text-zinc-500 dark:text-white/40 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder={tags.length === 0 ? 'Type a tag and press Enter…' : 'Add another…'}
              className="flex-1 min-w-[120px] bg-transparent text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/20 focus:outline-none"
            />
          </div>
        </div>

        {/* Split-pane editor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Markdown/LaTeX textarea */}
          <div className="bg-white/50 dark:bg-white/[0.03] backdrop-blur-xl border border-zinc-200/50 dark:border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-zinc-200/50 dark:border-white/[0.06]">
              <span className="text-xs font-semibold text-zinc-500 dark:text-white/40 uppercase tracking-wide">
                Markdown / LaTeX
              </span>
            </div>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleTextareaKeyDown}
              placeholder={`Write your post here…\n\n# Heading\n\n**bold** and \`inline code\`\n\n- List item\n\n$$E = mc^2$$`}
              className="w-full h-[60vh] px-4 py-4 bg-transparent text-sm text-zinc-800 dark:text-white/80 font-mono placeholder-zinc-400 dark:placeholder-white/20 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Right: Live preview */}
          <div className="bg-white/50 dark:bg-white/[0.03] backdrop-blur-xl border border-zinc-200/50 dark:border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-zinc-200/50 dark:border-white/[0.06]">
              <span className="text-xs font-semibold text-zinc-500 dark:text-white/40 uppercase tracking-wide">
                Preview
              </span>
            </div>
            <div
              ref={previewRef}
              className="h-[60vh] px-5 py-4 overflow-y-auto prose-sm"
              dangerouslySetInnerHTML={{ __html: previewHtml() }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
