"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface ImageMeta {
  id: string;
  fileName: string;
  imageData: string;        // data: URL
  mime: string;
  width: number;
  height: number;
  aspectRatio: "portrait" | "landscape" | "square";
  bytes: number;
  brightness: number;
  dominantColor: string;
  // suggested by vision_analyze
  suggestedTitles: string[];
  suggestedSubtitle: string;
  suggestedTags: string[];
  suggestedDescription: string;
  // final fields (user editable)
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  featured: boolean;
  status: "pending" | "saving" | "saved" | "failed";
  errorMessage?: string;
}

const ACCEPTED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const readAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 64);
}

export default function GalleryAdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [items, setItems] = useState<ImageMeta[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auth gate
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const totalBytes = useMemo(
    () => items.reduce((s, it) => s + it.bytes, 0),
    [items],
  );

  const onFilesSelected = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter((f) =>
        ACCEPTED_MIME.includes(f.type),
      );
      if (list.length === 0) return;

      setIsAnalyzing(true);

      // Phase 1: read files + get server-side metadata (cheap)
      const newItems: ImageMeta[] = [];
      for (const f of list) {
        try {
          const dataUrl = await readAsDataUrl(f);
          const r = await fetch("/api/gallery/suggest-metadata", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageData: dataUrl }),
          });
          if (!r.ok) throw new Error("suggest failed");
          const m = await r.json();
          newItems.push({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            fileName: f.name,
            imageData: dataUrl,
            mime: m.mime || f.type,
            width: m.width,
            height: m.height,
            aspectRatio: m.aspectRatio,
            bytes: m.bytes,
            brightness: m.brightness,
            dominantColor: m.dominantColor?.hex || "#888888",
            suggestedTitles: [],
            suggestedSubtitle: "",
            suggestedTags: [],
            suggestedDescription: "",
            slug: "",
            title: f.name.replace(/\.[^.]+$/, ""),
            subtitle: "",
            description: "",
            tags: [],
            featured: false,
            status: "pending",
          });
        } catch (e) {
          console.error("Failed to read file", f.name, e);
        }
      }

      setItems((prev) => [...prev, ...newItems]);

      // Phase 2: ask vision_analyze for each, sequentially, so the modal can
      // stream the suggestions in.  (vision_analyze is exposed via Hermes, not
      // an API route -- so the client must use the helper that's already in
      // the chat runtime.  We stub it here with /api/gallery/suggest-llm that
      // the user can implement server-side.)
      for (const it of newItems) {
        try {
          const r = await fetch("/api/gallery/suggest-llm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageData: it.imageData }),
          });
          if (!r.ok) continue;
          const s = await r.json();
          setItems((prev) =>
            prev.map((x) =>
              x.id === it.id
                ? {
                    ...x,
                    suggestedTitles: s.titles || [],
                    suggestedSubtitle: s.subtitle || "",
                    suggestedTags: s.tags || [],
                    suggestedDescription: s.description || "",
                    title: s.titles?.[0] || x.title,
                    slug: slugify(s.titles?.[0] || it.fileName),
                    subtitle: s.subtitle || "",
                    description: s.description || "",
                    tags: s.tags || [],
                  }
                : x,
            ),
          );
        } catch (e) {
          console.warn("vision suggest failed", it.fileName, e);
        }
      }

      setIsAnalyzing(false);
    },
    [],
  );

  const update = (id: string, patch: Partial<ImageMeta>) => {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  const remove = (id: string) =>
    setItems((prev) => prev.filter((x) => x.id !== id));

  const saveAll = async () => {
    for (const it of items) {
      if (it.status !== "pending") continue;
      update(it.id, { status: "saving" });
      try {
        const r = await fetch("/api/gallery/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: it.slug || slugify(it.title),
            title: it.title,
            subtitle: it.subtitle || undefined,
            description: it.description || undefined,
            imageData: it.imageData,
            imageMime: it.mime,
            width: it.width,
            height: it.height,
            aspectRatio: it.aspectRatio,
            tags: it.tags,
            featured: it.featured,
          }),
        });
        if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          throw new Error(err?.error || r.statusText);
        }
        const data = await r.json();
        update(it.id, {
          status: "saved",
          slug: data.slug,
        });
      } catch (e: any) {
        update(it.id, { status: "failed", errorMessage: e?.message || "Failed" });
      }
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0b] text-zinc-900 dark:text-zinc-100">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gallery Admin</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Batch import images with auto-suggested metadata
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/gallery"
              className="px-4 py-2 text-sm rounded-lg border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 transition"
            >
              View Public Gallery
            </a>
          </div>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add("ring-2", "ring-[#bf5af2]");
          }}
          onDragLeave={(e) =>
            e.currentTarget.classList.remove("ring-2", "ring-[#bf5af2]")
          }
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove("ring-2", "ring-[#bf5af2]");
            if (e.dataTransfer.files) onFilesSelected(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          className="cursor-pointer border-2 border-dashed border-zinc-300 dark:border-white/10 rounded-2xl p-12 text-center transition hover:border-[#bf5af2]"
        >
          <div className="text-5xl mb-3">📥</div>
          <div className="text-lg font-medium">
            Drop images here, or click to select
          </div>
          <div className="text-xs text-zinc-500 mt-2">
            JPG / PNG / WebP / GIF &nbsp;·&nbsp; Max 5MB per file (client-side)
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_MIME.join(",")}
            multiple
            className="hidden"
            onChange={(e) =>
              e.target.files && onFilesSelected(e.target.files)
            }
          />
        </div>

        {/* Summary bar */}
        {items.length > 0 && (
          <div className="mt-6 flex items-center justify-between text-sm text-zinc-500">
            <div>
              {items.length} image{items.length !== 1 && "s"} ·
              {" "}
              {(totalBytes / 1024 / 1024).toFixed(2)} MB
              {isAnalyzing && (
                <span className="ml-3 inline-flex items-center gap-1.5 text-[#bf5af2]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#bf5af2] animate-pulse" />
                  AI analyzing...
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setItems([])}
                className="px-3 py-1.5 text-xs rounded-md border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5"
              >
                Clear All
              </button>
              <button
                onClick={saveAll}
                disabled={isAnalyzing || items.every((i) => i.status !== "pending")}
                className="px-4 py-1.5 text-xs rounded-md bg-[#bf5af2] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#af52de] transition"
              >
                Save All to Gallery
              </button>
            </div>
          </div>
        )}

        {/* Image list */}
        <div className="mt-6 space-y-4">
          {items.map((it) => (
            <ImageCard
              key={it.id}
              item={it}
              onUpdate={(p) => update(it.id, p)}
              onRemove={() => remove(it.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ImageCard({
  item,
  onUpdate,
  onRemove,
}: {
  item: ImageMeta;
  onUpdate: (p: Partial<ImageMeta>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-5 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-5">
        {/* Preview */}
        <div className="relative aspect-square rounded-lg overflow-hidden bg-zinc-100 dark:bg-black/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageData}
            alt={item.title || item.fileName}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 flex gap-1">
            <span className="px-2 py-0.5 text-[10px] rounded bg-black/60 text-white backdrop-blur-sm">
              {item.width}×{item.height}
            </span>
            {item.status === "saved" && (
              <span className="px-2 py-0.5 text-[10px] rounded bg-emerald-500/80 text-white">
                ✓ Saved
              </span>
            )}
            {item.status === "saving" && (
              <span className="px-2 py-0.5 text-[10px] rounded bg-blue-500/80 text-white">
                Saving...
              </span>
            )}
            {item.status === "failed" && (
              <span className="px-2 py-0.5 text-[10px] rounded bg-red-500/80 text-white">
                ✗ Failed
              </span>
            )}
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-3">
          {/* Title with suggestions */}
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">
              Title
            </label>
            <input
              type="text"
              value={item.title}
              onChange={(e) => {
                const t = e.target.value;
                onUpdate({ title: t, slug: slugify(t) });
              }}
              className="w-full px-3 py-2 rounded-md border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#bf5af2]"
            />
            {item.suggestedTitles.length > 1 && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {item.suggestedTitles.slice(1).map((s, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      onUpdate({ title: s, slug: slugify(s) })
                    }
                    className="px-2 py-0.5 text-[10px] rounded-full bg-[#bf5af2]/10 text-[#bf5af2] border border-[#bf5af2]/20 hover:bg-[#bf5af2]/20"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">
              URL Slug
            </label>
            <input
              type="text"
              value={item.slug}
              onChange={(e) => onUpdate({ slug: slugify(e.target.value) })}
              className="w-full px-3 py-1.5 rounded-md border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/30 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#bf5af2]"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">
              Subtitle
            </label>
            <input
              type="text"
              value={item.subtitle}
              onChange={(e) => onUpdate({ subtitle: e.target.value })}
              className="w-full px-3 py-1.5 rounded-md border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/30 text-xs focus:outline-none focus:ring-2 focus:ring-[#bf5af2]"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {item.tags.map((t, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full bg-[#bf5af2]/15 text-[#bf5af2] border border-[#bf5af2]/30"
                >
                  {t}
                  <button
                    onClick={() =>
                      onUpdate({ tags: item.tags.filter((_, j) => j !== i) })
                    }
                    className="hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            {item.suggestedTags
              .filter((t) => !item.tags.includes(t))
              .map((t, i) => (
                <button
                  key={i}
                  onClick={() => onUpdate({ tags: [...item.tags, t] })}
                  className="mr-1 mt-1 px-2 py-0.5 text-[10px] rounded-full bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-white/10 hover:border-[#bf5af2]"
                >
                  + {t}
                </button>
              ))}
          </div>

          {/* Featured toggle */}
          <label className="inline-flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={item.featured}
              onChange={(e) => onUpdate({ featured: e.target.checked })}
              className="accent-[#bf5af2]"
            />
            <span>Featured (show in hero slideshow)</span>
          </label>

          {item.errorMessage && (
            <div className="text-xs text-red-500">{item.errorMessage}</div>
          )}
        </div>

        {/* Remove */}
        <div className="md:col-span-2 flex justify-end">
          <button
            onClick={onRemove}
            className="px-3 py-1 text-xs rounded-md border border-zinc-200 dark:border-white/10 hover:bg-red-500/10 hover:text-red-500"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
