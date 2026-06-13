'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface ImageCropperProps {
  onCrop: (url: string) => void;
  onCancel: () => void;
  aspectRatio?: number;
}

export default function ImageCropper({ onCrop, onCancel, aspectRatio = 1 }: ImageCropperProps) {
  const [image, setImage] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [uploading, setUploading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [dragging, dragStart]);

  const handleMouseUp = () => setDragging(false);

  const handleCrop = async () => {
    if (!image || !containerRef.current) return;
    setUploading(true);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.src = image;
    });

    const container = containerRef.current;
    const cropSize = 240;
    canvas.width = cropSize * 2;
    canvas.height = cropSize * 2;

    const displayW = container.offsetWidth;
    const displayH = container.offsetHeight;
    const imgDisplayW = img.width * scale * (displayW / img.width);
    const imgDisplayH = img.height * scale * (displayH / img.height);
    const offsetX = (displayW - imgDisplayW) / 2 + position.x;
    const offsetY = (displayH - imgDisplayH) / 2 + position.y;
    const centerX = displayW / 2;
    const centerY = displayH / 2;

    const sx = ((centerX - cropSize / 2 - offsetX) / imgDisplayW) * img.width;
    const sy = ((centerY - cropSize / 2 - offsetY) / imgDisplayH) * img.height;
    const sw = (cropSize / imgDisplayW) * img.width;
    const sh = (cropSize / imgDisplayH) * img.height;

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const fd = new FormData();
      fd.append('file', blob, 'avatar.webp');
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.url) onCrop(data.url);
      } catch (e) {
        console.error(e);
      }
      setUploading(false);
    }, 'image/webp', 0.9);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-[400px] shadow-2xl border border-zinc-200 dark:border-white/10">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Upload & Crop Image</h3>

        {!image ? (
          <div
            onClick={() => fileRef.current?.click()}
            className="h-[300px] border-2 border-dashed border-zinc-300 dark:border-white/15 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-zinc-400 dark:hover:border-white/30 transition-colors"
          >
            <svg className="w-10 h-10 text-zinc-400 dark:text-white/30 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16v-4m0 0V8m0 4h4m-4 0H8m12 4v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2m16-4V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8" /></svg>
            <p className="text-sm text-zinc-500 dark:text-white/40">Click to select image</p>
            <p className="text-xs text-zinc-400 dark:text-white/20 mt-1">JPG, PNG, WebP, max 5MB</p>
          </div>
        ) : (
          <div>
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="relative h-[300px] overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 cursor-grab active:cursor-grabbing select-none"
            >
              <img
                src={image}
                alt=""
                draggable={false}
                className="absolute top-1/2 left-1/2 pointer-events-none"
                style={{
                  transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${scale})`,
                  maxWidth: 'none',
                }}
              />
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-black/40" />
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-lg"
                  style={{ width: 240, height: 240, background: 'transparent', boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)' }}
                />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs text-zinc-500 dark:text-white/30">Zoom</span>
              <input
                type="range"
                min={0.3}
                max={3}
                step={0.01}
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="flex-1 accent-zinc-900 dark:accent-white"
              />
            </div>
          </div>
        )}

        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

        <div className="flex gap-2 mt-4">
          {image && (
            <button
              onClick={handleCrop}
              disabled={uploading}
              className="flex-1 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-zinc-700 dark:hover:bg-white/90 disabled:opacity-50 transition-colors"
            >
              {uploading ? 'Uploading...' : 'Crop & Upload'}
            </button>
          )}
          <button
            onClick={() => { setImage(null); onCancel(); }}
            className="px-4 py-2.5 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-white/50 text-sm rounded-lg hover:bg-zinc-50 dark:hover:bg-white/[0.04] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
