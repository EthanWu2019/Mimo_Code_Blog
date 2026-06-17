'use client';

import { useRef } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from './ThemeProvider';
import Navbar from './Navbar';
import gsap from 'gsap';
import { TransitionRouter } from 'next-transition-router';

export default function Providers({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const layerRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLSpanElement | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);

  return (
    <SessionProvider>
      <ThemeProvider>
        <TransitionRouter
          auto={true}
          leave={(next) => {
            const w = wrapperRef.current;
            const l = layerRef.current;
            const logo = logoRef.current;
            const line = lineRef.current;
            if (!w || !l) { next(); return; }

            gsap.set(w, { display: 'block', clipPath: 'inset(100% 0 0 0)' });
            gsap.set(l, { y: '100%' });
            gsap.set(logo, { opacity: 0, y: 15, scale: 0.9 });
            gsap.set(line, { scaleX: 0 });

            const tl = gsap.timeline({ onComplete: next });

            tl.to(w, {
              clipPath: 'inset(0% 0 0 0)',
              duration: 0.5,
              ease: 'expo.inOut',
            })
            .to(l, {
              y: '0%',
              duration: 0.45,
              ease: 'expo.inOut',
            }, '-=0.3')
            .to(logo, {
              opacity: 1, y: 0, scale: 1,
              duration: 0.35,
              ease: 'back.out(1.5)',
            }, '-=0.2')
            .to(line, {
              scaleX: 1,
              duration: 0.4,
              ease: 'expo.out',
            }, '-=0.25');

            return () => { tl.kill(); };
          }}
          enter={(next) => {
            const w = wrapperRef.current;
            const l = layerRef.current;
            const logo = logoRef.current;
            const line = lineRef.current;
            if (!w || !l) { next(); return; }

            const tl = gsap.timeline({
              onComplete: () => {
                gsap.set(w, { display: 'none' });
                next();
              },
            });

            tl.to(logo, {
              opacity: 0, y: -12, scale: 0.92,
              duration: 0.2,
              ease: 'expo.in',
            })
            .to(line, {
              scaleX: 0,
              duration: 0.18,
              ease: 'expo.in',
            }, '-=0.12')
            .to(l, {
              y: '-100%',
              duration: 0.5,
              ease: 'expo.inOut',
            }, '-=0.08')
            .to(w, {
              clipPath: 'inset(0% 0 100% 0)',
              duration: 0.5,
              ease: 'expo.inOut',
            }, '-=0.35');

            return () => { tl.kill(); };
          }}
        >
          <Navbar />
          <main>{children}</main>

          {/* Transition overlay */}
          <div
            ref={wrapperRef}
            className="fixed inset-0 z-[100] pointer-events-none"
            style={{ display: 'none', clipPath: 'inset(100% 0 0 0)' }}
          >
            {/* Background layer — light: dark, dark: muted warm grey */}
            <div className="absolute inset-0 transition-overlay-bg" />
            {/* Foreground accent layer */}
            <div
              ref={layerRef}
              className="absolute inset-0 flex flex-col items-center justify-center transition-overlay-fg"
              style={{ transform: 'translateY(100%)' }}
            >
              <span
                ref={logoRef}
                className="text-2xl font-semibold tracking-tight select-none"
                style={{ color: 'var(--background)', opacity: 0 }}
              >
                Ethan&apos;s Blog
              </span>
              <div
                ref={lineRef}
                className="mt-4 h-px w-16"
                style={{
                  background: 'var(--background)',
                  opacity: 0.25,
                  transform: 'scaleX(0)',
                  transformOrigin: 'center',
                }}
              />
            </div>
          </div>
        </TransitionRouter>
      </ThemeProvider>
    </SessionProvider>
  );
}
