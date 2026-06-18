'use client';

import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; size: number;
}

function getVisualBrightness(x: number, y: number): number {
  const el = document.elementFromPoint(x, y);
  if (!el) return 0;
  const isDarkMode = document.documentElement.classList.contains('dark');
  let node: Element | null = el;
  while (node) {
    const cs = window.getComputedStyle(node);
    const bg = cs.backgroundColor;
    const hasGlass = cs.backdropFilter !== 'none' && cs.backdropFilter !== '';
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
      const m = bg.match(/[\d.]+/g);
      if (m && m.length >= 4) {
        const r = parseFloat(m[0]), g = parseFloat(m[1]), b = parseFloat(m[2]), a = parseFloat(m[3]);
        if (hasGlass && a < 0.15) return isDarkMode ? 20 : 220;
        const bgR = isDarkMode ? 10 : 250, bgG = isDarkMode ? 10 : 250, bgB = isDarkMode ? 12 : 250;
        return 0.299 * (r * a + bgR * (1 - a)) + 0.587 * (g * a + bgG * (1 - a)) + 0.114 * (b * a + bgB * (1 - a));
      }
      if (m && m.length >= 3) return 0.299 * parseFloat(m[0]) + 0.587 * parseFloat(m[1]) + 0.114 * parseFloat(m[2]);
    }
    node = node.parentElement;
  }
  return isDarkMode ? 10 : 240;
}

function isClickable(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'A' || tag === 'BUTTON' || tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return true;
  if (el.getAttribute('role') === 'button' || el.getAttribute('onclick')) return true;
  if (window.getComputedStyle(el).cursor === 'pointer') return true;
  return false;
}

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const posRef = useRef({ x: -100, y: -100 });
  const scaleRef = useRef({ value: 0.5 });
  const rafRef = useRef<number>(0);
  const isDownRef = useRef(false);
  const colorRef = useRef<'dark' | 'light'>('dark');
  const clickableRef = useRef(false);
  const debounceRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const particleRafRef = useRef<number>(0);
  const heartbeatRef = useRef<gsap.core.Timeline | null>(null);

  const scheduleUpdate = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      const { x, y } = posRef.current;
      const s = scaleRef.current.value;
      if (glowRef.current) glowRef.current.style.transform = `translate(${x - 25}px, ${y - 25}px)`;
      if (dotRef.current) dotRef.current.style.transform = `translate(${x - 10}px, ${y - 10}px) scale(${s})`;
      if (canvasRef.current) canvasRef.current.style.transform = `translate(${x - 30}px, ${y - 30}px)`;
      rafRef.current = 0;
    });
  }, []);

  // Particle animation loop
  const startParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const spawnParticle = () => {
      const { x, y } = posRef.current;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.3 + Math.random() * 0.8;
      particlesRef.current.push({
        x: 30, y: 30, // center of canvas (relative)
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 30 + Math.random() * 20,
        size: 1 + Math.random() * 1.5,
      });
    };

    let frameCount = 0;
    const draw = () => {
      if (!clickableRef.current && particlesRef.current.length === 0) {
        particleRafRef.current = 0;
        ctx.clearRect(0, 0, 60, 60);
        return;
      }

      frameCount++;
      if (clickableRef.current && frameCount % 3 === 0) {
        spawnParticle();
      }

      ctx.clearRect(0, 0, 60, 60);
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        const progress = p.life / p.maxLife;
        const alpha = progress < 0.3 ? progress / 0.3 : 1 - (progress - 0.3) / 0.7;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - progress * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = colorRef.current === 'light'
          ? `rgba(255, 255, 255, ${alpha * 0.6})`
          : `rgba(139, 92, 246, ${alpha * 0.7})`;
        ctx.fill();
        if (p.life >= p.maxLife) particles.splice(i, 1);
      }

      particleRafRef.current = requestAnimationFrame(draw);
    };

    if (!particleRafRef.current) {
      particleRafRef.current = requestAnimationFrame(draw);
    }
  }, []);

  const stopParticles = useCallback(() => {
    // Let existing particles fade out naturally, just stop spawning
  }, []);

  useEffect(() => {
    const applyColor = () => {
      if (!dotRef.current) return;
      if (clickableRef.current) {
        dotRef.current.style.backgroundColor = colorRef.current === 'light'
          ? 'rgba(255,255,255,0.95)' : 'rgba(139, 92, 246, 0.9)';
        dotRef.current.style.boxShadow = colorRef.current === 'light'
          ? '0 0 10px 3px rgba(255,255,255,0.4)' : '0 0 10px 3px rgba(139, 92, 246, 0.5)';
      } else {
        const light = colorRef.current === 'light';
        dotRef.current.style.backgroundColor = light ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.6)';
        dotRef.current.style.boxShadow = light
          ? '0 0 8px 2px rgba(255,255,255,0.3)' : '0 0 4px rgba(0,0,0,0.15)';
      }
      if (glowRef.current) glowRef.current.style.opacity = colorRef.current === 'light' && !clickableRef.current ? '1' : '0';
    };

    // Heartbeat pulse
    const startHeartbeat = () => {
      if (heartbeatRef.current) heartbeatRef.current.kill();
      const tl = gsap.timeline({ repeat: -1 });
      tl.to(scaleRef.current, { value: 0.7, duration: 0.15, ease: 'power2.out', onUpdate: scheduleUpdate })
        .to(scaleRef.current, { value: 0.5, duration: 0.15, ease: 'power2.in', onUpdate: scheduleUpdate })
        .to(scaleRef.current, { value: 0.65, duration: 0.12, ease: 'power2.out', onUpdate: scheduleUpdate })
        .to(scaleRef.current, { value: 0.5, duration: 0.18, ease: 'power2.in', onUpdate: scheduleUpdate })
        .to({}, { duration: 0.4 }); // pause between beats
      heartbeatRef.current = tl;
    };

    const stopHeartbeat = () => {
      if (heartbeatRef.current) {
        heartbeatRef.current.kill();
        heartbeatRef.current = null;
      }
      gsap.to(scaleRef.current, { value: 0.5, duration: 0.3, ease: 'power2.out', overwrite: true, onUpdate: scheduleUpdate });
    };

    // Initial
    colorRef.current = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
    applyColor();

    // Brief hide on light→dark transition
    const onThemeToggle = () => {
      if (!document.documentElement.classList.contains('dark')) {
        if (dotRef.current) dotRef.current.style.opacity = '0';
        setTimeout(() => { if (dotRef.current) dotRef.current.style.opacity = '1'; }, 80);
      }
    };
    document.addEventListener('hermes:theme-toggle', onThemeToggle);

    // Re-sample on theme change
    const observer = new MutationObserver(() => {
      setTimeout(() => {
        const { x, y } = posRef.current;
        if (x > 0 && y > 0) {
          const lum = getVisualBrightness(x, y);
          colorRef.current = lum > 128 ? 'dark' : 'light';
          applyColor();
        }
      }, 100);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Clickable hover detection
    const handleOver = (e: MouseEvent) => {
      const target = e.target as Element;
      const clickable = isClickable(target) || isClickable(target.closest('a, button, [role="button"]'));
      if (clickable !== clickableRef.current) {
        clickableRef.current = clickable;
        applyColor();
        if (clickable) {
          startHeartbeat();
          startParticles();
        } else {
          stopHeartbeat();
          stopParticles();
        }
      }
    };
    document.addEventListener('mouseover', handleOver, { passive: true });

    // Background color sampling
    const handleMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      scheduleUpdate();
      const now = Date.now();
      if (now - debounceRef.current > 300) {
        debounceRef.current = now;
        if (!clickableRef.current) {
          const lum = getVisualBrightness(e.clientX, e.clientY);
          const shouldBe = lum > 128 ? 'dark' : 'light';
          if (shouldBe !== colorRef.current) {
            colorRef.current = shouldBe;
            applyColor();
          }
        }
      }
    };

    const handleDown = () => {
      isDownRef.current = true;
      if (!clickableRef.current) {
        gsap.to(scaleRef.current, { value: 1, duration: 0.15, ease: 'power2.out', overwrite: true, onUpdate: scheduleUpdate });
      }
    };
    const handleUp = () => {
      if (!isDownRef.current) return;
      isDownRef.current = false;
      if (!clickableRef.current) {
        gsap.to(scaleRef.current, { value: 0.5, duration: 0.6, ease: 'elastic.out(1.2, 0.3)', overwrite: true, onUpdate: scheduleUpdate });
      }
    };

    document.addEventListener('mousemove', handleMove, { passive: true });
    document.addEventListener('mousedown', handleDown);
    document.addEventListener('mouseup', handleUp);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('mouseup', handleUp);
      document.removeEventListener('hermes:theme-toggle', onThemeToggle);
      document.removeEventListener('mouseover', handleOver);
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (particleRafRef.current) cancelAnimationFrame(particleRafRef.current);
      if (heartbeatRef.current) heartbeatRef.current.kill();
    };
  }, [scheduleUpdate, startParticles, stopParticles]);

  return (
    <>
      <div ref={glowRef} aria-hidden style={{
        position: 'fixed', top: 0, left: 0, width: 50, height: 50,
        borderRadius: '50%', pointerEvents: 'none', zIndex: 200,
        willChange: 'transform', mixBlendMode: 'screen',
        background: 'radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 40%, transparent 70%)',
        opacity: 0, transition: 'opacity 0.3s ease', transform: 'translate(-100px, -100px)',
      }} />
      {/* Particle canvas */}
      <canvas ref={canvasRef} width={60} height={60} aria-hidden style={{
        position: 'fixed', top: 0, left: 0, width: 60, height: 60,
        pointerEvents: 'none', zIndex: 200,
        willChange: 'transform', transform: 'translate(-100px, -100px)',
      }} />
      <div ref={dotRef} aria-hidden className="cursor-dot" style={{
        position: 'fixed', top: 0, left: 0, width: 20, height: 20,
        borderRadius: '50%', pointerEvents: 'none', zIndex: 201,
        willChange: 'transform', backgroundColor: 'rgba(0,0,0,0.6)',
        transform: 'translate(-100px, -100px) scale(0.5)', transformOrigin: 'center center',
        boxShadow: '0 0 4px rgba(0,0,0,0.15)',
        transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
      }} />
    </>
  );
}
