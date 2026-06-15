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
            const wrapper = wrapperRef.current;
            const layer = layerRef.current;
            const logo = logoRef.current;
            const line = lineRef.current;
            if (!wrapper || !layer) { next(); return; }

            // Show wrapper, reset positions
            gsap.set(wrapper, { display: 'block' });
            gsap.set(layer, { y: '100%' });
            gsap.set(logo, { opacity: 0, y: 10 });
            gsap.set(line, { scaleX: 0 });

            const tl = gsap.timeline({ onComplete: next });

            // Layer 1 (background) slides up
            tl.to(wrapper, {
              clipPath: 'inset(0 0 0 0)',
              duration: 0.45,
              ease: 'power3.inOut',
            })
            // Layer 2 (foreground) slides up
            .to(layer, {
              y: '0%',
              duration: 0.4,
              ease: 'power3.inOut',
            }, '-=0.25')
            // Logo appears
            .to(logo, {
              opacity: 1, y: 0,
              duration: 0.25,
              ease: 'power2.out',
            }, '-=0.15')
            // Line expands
            .to(line, {
              scaleX: 1,
              duration: 0.3,
              ease: 'power2.inOut',
            }, '-=0.15');

            return () => { tl.kill(); };
          }}
          enter={(next) => {
            const wrapper = wrapperRef.current;
            const layer = layerRef.current;
            const logo = logoRef.current;
            const line = lineRef.current;
            if (!wrapper || !layer) { next(); return; }

            const tl = gsap.timeline({
              onComplete: () => {
                gsap.set(wrapper, { display: 'none' });
                next();
              },
            });

            // Logo fades out
            tl.to(logo, {
              opacity: 0, y: -10,
              duration: 0.2,
              ease: 'power2.in',
            })
            // Line shrinks
            .to(line, {
              scaleX: 0,
              duration: 0.15,
              ease: 'power2.in',
            }, '-=0.1')
            // Layer 2 slides up and away
            .to(layer, {
              y: '-100%',
              duration: 0.4,
              ease: 'power3.inOut',
            }, '-=0.05')
            // Layer 1 follows
            .to(wrapper, {
              clipPath: 'inset(0 0 100% 0)',
              duration: 0.4,
              ease: 'power3.inOut',
            }, '-=0.25');

            return () => { tl.kill(); };
          }}
        >
          <Navbar />
          <main>{children}</main>

          {/* Transition overlay — hidden by default */}
          <div
            ref={wrapperRef}
            className="fixed inset-0 z-[100] pointer-events-none"
            style={{ display: 'none', clipPath: 'inset(0 0 100% 0)', background: 'var(--background)' }}
          >
            <div
              ref={layerRef}
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ background: 'var(--foreground)', transform: 'translateY(100%)' }}
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
                style={{ background: 'var(--background)', opacity: 0.3, transform: 'scaleX(0)', transformOrigin: 'center' }}
              />
            </div>
          </div>
        </TransitionRouter>
      </ThemeProvider>
    </SessionProvider>
  );
}
