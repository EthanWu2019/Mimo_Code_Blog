'use client';

import { useState, useRef, useCallback } from 'react';

interface ImageCropperProps {
  onCrop: (url: string) => void;
  onCancel: () => void;
  aspectRatio?: number;
}

export default function ImageCropper({ onCrop, onCancel }: ImageCropperProps) {
  const [image, setImage] = useState<string | null>(null);
  const [imgW, setImgW] = useState(0);
  const [imgH, setImgH] = useState(0);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const CROP_R = 120; // crop circle radius in px
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const MAX_SIZE = 2 * 1024 * 1024; // 2MB

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Unsupported format. Please use JPG, PNG, GIF, or WebP.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_SIZE) {
      setError(`Image too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 2MB.`);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      const img = new Image();
      img.onload = () => {
        setImgW(img.naturalWidth);
        setImgH(img.naturalHeight);
        setImage(url);
        setScale(1);
        setPos({ x: 0, y: 0 });
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX - pos.x, y: e.clientY - pos.y });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    setPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [dragging, dragStart]);

  const handleMouseUp = () => setDragging(false);

  const handleCrop = async () => {
    if (!image || !containerRef.current || !imgW || !imgH) return;
    setUploading(true);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.src = image;
    });

    const cw = containerRef.current.offsetWidth;
    const ch = containerRef.current.offsetHeight;
    const cx = cw / 2;
    const cy = ch / 2;

    // How the image is displayed (same logic as CSS: object-contain + scale + translate)
    const containScale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
    const dispW = img.naturalWidth * containScale;
    const dispH = img.naturalHeight * containScale;
    const imgX = (cw - dispW) / 2 + pos.x;
    const imgY = (ch - dispH) / 2 + pos.y;
    const finalW = dispW * scale;
    const finalH = dispH * scale;
    const drawX = cx + (imgX + dispW / 2 - cx) - finalW / 2;
    const drawY = cy + (imgY + dispH / 2 - cy) - finalH / 2;

    // Map crop circle from screen coords to original image coords
    const toOrigX = (sx: number) => ((sx - drawX) / finalW) * img.naturalWidth;
    const toOrigY = (sy: number) => ((sy - drawY) / finalH) * img.naturalHeight;

    let sx = toOrigX(cx - CROP_R);
    let sy = toOrigY(cy - CROP_R);
    let sw = toOrigX(cx + CROP_R) - sx;
    let sh = toOrigY(cy + CROP_R) - sy;

    // Clamp to image bounds
    if (sx < 0) { sw += sx; sx = 0; }
    if (sy < 0) { sh += sy; sy = 0; }
    if (sx + sw > img.naturalWidth) sw = img.naturalWidth - sx;
    if (sy + sh > img.naturalHeight) sh = img.naturalHeight - sy;

    const outSize = 512;
    canvas.width = outSize;
    canvas.height = outSize;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outSize, outSize);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setError('Failed to process image. Try a different one.');
        setUploading(false);
        return;
      }
      const fd = new FormData();
      fd.append('file', blob, 'avatar.webp');
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || `Upload failed (${res.status})`);
          setUploading(false);
          return;
        }
        if (data.url) onCrop(data.url);
      } catch (e) {
        setError('Network error. Please check your connection and try again.');
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
            <p className="text-xs text-zinc-400 dark:text-white/20 mt-1">JPG, PNG, WebP, max 2MB</p>
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
                className="absolute top-1/2 left-1/2 pointer-events-none object-contain"
                style={{
                  maxWidth: 'none',
                  width: `${imgW * Math.min(containerRef.current ? containerRef.current.offsetWidth / imgW : 1, containerRef.current ? containerRef.current.offsetHeight / imgH : 1) * scale}px`,
                  height: `${imgH * Math.min(containerRef.current ? containerRef.current.offsetWidth / imgW : 1, containerRef.current ? containerRef.current.offsetHeight / imgH : 1) * scale}px`,
                  transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
                }}
              />
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-black/40" />
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-lg"
                  style={{ width: CROP_R * 2, height: CROP_R * 2, background: 'transparent', boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)' }}
                />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs text-zinc-500 dark:text-white/30">Zoom</span>
              <input
                type="range"
                min={0.5}
                max={5}
                step={0.01}
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="flex-1 accent-zinc-900 dark:accent-white"
              />
            </div>
          </div>
        )}

        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleFile} className="hidden" />

        {error && (
          <div className="mt-3 px-3 py-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg">
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

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
