'use client';

import { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';

interface LiquidGlassIndicatorProps {
  top: number;
  height: number;
  width?: number;
  left?: number;
}

const PILL_RADIUS = 10; // Adaptive radius, not full pill

function isDark(): boolean {
  if (typeof document === 'undefined') return true;
  return document.documentElement.classList.contains('dark');
}

function getColors(dark: boolean) {
  if (dark) {
    return {
      bodyTop: 'rgba(255,255,255,0.08)',
      bodyBottom: 'rgba(255,255,255,0.04)',
      edge: 'rgba(255,255,255,0.15)',
      specular: 'rgba(255,255,255,0.3)',
      glow: 'rgba(255,255,255,0.06)',
      shimmer: 'rgba(255,255,255,0.05)',
      highlightTop: 'rgba(255,255,255,0.12)',
      highlightBottom: 'rgba(255,255,255,0.0)',
      tintA: 'rgba(120,140,255,0.04)',
      tintB: 'rgba(200,180,255,0.03)',
    };
  }
  return {
    bodyTop: 'rgba(255,255,255,0.5)',
    bodyBottom: 'rgba(255,255,255,0.3)',
    edge: 'rgba(255,255,255,0.8)',
    specular: 'rgba(255,255,255,0.9)',
    glow: 'rgba(0,0,0,0.05)',
    shimmer: 'rgba(255,255,255,0.15)',
    highlightTop: 'rgba(255,255,255,0.6)',
    highlightBottom: 'rgba(255,255,255,0.0)',
    tintA: 'rgba(180,190,255,0.08)',
    tintB: 'rgba(220,210,255,0.06)',
  };
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

export default function LiquidGlassIndicator({
  top,
  height,
  width,
  left = 0,
}: LiquidGlassIndicatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animState = useRef({ time: 0, currentTop: top, currentLeft: left ?? 0 });
  const tickerRef = useRef<((time: number) => void) | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const displayW = canvas.clientWidth;
    const displayH = canvas.clientHeight;

    if (canvas.width !== displayW * dpr || canvas.height !== displayH * dpr) {
      canvas.width = displayW * dpr;
      canvas.height = displayH * dpr;
      ctx.scale(dpr, dpr);
    }

    const w = displayW;
    const h = displayH;
    const r = Math.min(PILL_RADIUS, h / 2);
    const t = animState.current.time;
    const dark = isDark();
    const c = getColors(dark);

    ctx.clearRect(0, 0, w, h);

    // Outer glow
    ctx.save();
    ctx.shadowColor = c.glow;
    ctx.shadowBlur = 24;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    drawRoundedRect(ctx, 2, 2, w - 4, h - 4, r);
    ctx.fillStyle = 'rgba(0,0,0,0.001)';
    ctx.fill();
    ctx.restore();

    // Glass body with animated gradient
    const gradShift = Math.sin(t * 0.8) * 0.15;
    const bodyGrad = ctx.createLinearGradient(0, 0, 0, h);
    bodyGrad.addColorStop(0, c.bodyTop);
    bodyGrad.addColorStop(0.5 + gradShift, c.bodyBottom);
    bodyGrad.addColorStop(1, c.bodyTop);

    drawRoundedRect(ctx, 1, 1, w - 2, h - 2, r);
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // Color tint overlay (animated)
    const tintGrad = ctx.createLinearGradient(0, 0, w, h);
    const tintPhase = t * 0.5;
    tintGrad.addColorStop(0, c.tintA);
    tintGrad.addColorStop(0.5 + Math.sin(tintPhase) * 0.3, c.tintB);
    tintGrad.addColorStop(1, c.tintA);
    drawRoundedRect(ctx, 1, 1, w - 2, h - 2, r);
    ctx.fillStyle = tintGrad;
    ctx.fill();

    // Inner highlight (top half light simulation)
    const highlightGrad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    highlightGrad.addColorStop(0, c.highlightTop);
    highlightGrad.addColorStop(1, c.highlightBottom);
    drawRoundedRect(ctx, 1, 1, w - 2, h - 2, r);
    ctx.fillStyle = highlightGrad;
    ctx.fill();

    // Shimmer lines (diagonal, scrolling)
    ctx.save();
    drawRoundedRect(ctx, 1, 1, w - 2, h - 2, r);
    ctx.clip();
    const lineSpacing = 8;
    const scrollOffset = (t * 30) % (lineSpacing * 2);
    ctx.strokeStyle = c.shimmer;
    ctx.lineWidth = 0.5;
    for (let i = -h; i < w + h; i += lineSpacing) {
      ctx.beginPath();
      ctx.moveTo(i + scrollOffset, 0);
      ctx.lineTo(i + scrollOffset - h, h);
      ctx.stroke();
    }
    ctx.restore();

    // Edge rim
    drawRoundedRect(ctx, 1.5, 1.5, w - 3, h - 3, r);
    ctx.strokeStyle = c.edge;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Specular highlight (moving bright spot)
    const specX = w * 0.3 + Math.sin(t * 1.2) * w * 0.15;
    const specY = h * 0.25 + Math.cos(t * 0.9) * h * 0.1;
    const specRadX = w * 0.18;
    const specRadY = h * 0.2;
    const specGrad = ctx.createRadialGradient(
      specX, specY, 0,
      specX, specY, Math.max(specRadX, specRadY),
    );
    specGrad.addColorStop(0, c.specular);
    specGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.save();
    drawRoundedRect(ctx, 1, 1, w - 2, h - 2, r);
    ctx.clip();
    ctx.fillStyle = specGrad;
    ctx.beginPath();
    ctx.ellipse(specX, specY, specRadX, specRadY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }, []);

  useEffect(() => {
    const state = animState.current;
    const tickerFn = (_time: number) => {
      state.time += 0.016; // ~60fps increment
      draw();
    };
    tickerRef.current = tickerFn;
    gsap.ticker.add(tickerFn);
    return () => {
      if (tickerRef.current) {
        gsap.ticker.remove(tickerRef.current);
      }
    };
  }, [draw]);

  // Animate position when top changes — overwrite: true prevents stutter when jumping
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    gsap.to(animState.current, {
      currentTop: top,
      duration: 0.6,
      ease: 'back.out(1.2)',
      overwrite: true,
      onUpdate: () => {
        container.style.top = `${animState.current.currentTop}px`;
      },
    });
  }, [top]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    gsap.to(animState.current, {
      currentLeft: left,
      duration: 0.6,
      ease: 'back.out(1.2)',
      overwrite: true,
      onUpdate: () => {
        container.style.left = `${animState.current.currentLeft}px`;
      },
    });
  }, [left]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top,
        left,
        width: width ?? '100%',
        height,
        pointerEvents: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}
