'use client';

import { useRef } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from './ThemeProvider';
import Navbar from './Navbar';
import gsap from 'gsap';
import { TransitionRouter } from 'next-transition-router';

export default function Providers({ children }: { children: React.ReactNode }) {
  const firstLayer = useRef<HTMLDivElement | null>(null);
  const secondLayer = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLSpanElement | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);

  return (
    <SessionProvider>
      <ThemeProvider>
        <TransitionRouter
          auto={true}
          leave={(next) => {
            const tl = gsap.timeline({ onComplete: next });

            // Layer 1 slides up with slight scale
            tl.fromTo(firstLayer.current,
              { y: '100%', scaleY: 1.1 },
              { y: '0%', scaleY: 1, duration: 0.45, ease: 'power3.inOut' }
            )
            // Layer 2 follows, slightly faster
            .fromTo(secondLayer.current,
              { y: '100%', scaleY: 1.05 },
              { y: '0%', scaleY: 1, duration: 0.4, ease: 'power3.inOut' },
              '-=0.25'
            )
            // Logo fades in on the overlay
            .fromTo(logoRef.current,
              { opacity: 0, y: 10, scale: 0.95 },
              { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'power2.out' },
              '-=0.15'
            )
            // Decorative line expands
            .fromTo(lineRef.current,
              { scaleX: 0 },
              { scaleX: 1, duration: 0.35, ease: 'power2.inOut' },
              '-=0.2'
            );

            return () => { tl.kill(); };
          }}
          enter={(next) => {
            const tl = gsap.timeline();

            // Logo fades out
            tl.to(logoRef.current,
              { opacity: 0, y: -10, scale: 0.95, duration: 0.2, ease: 'power2.in' }
            )
            // Line shrinks away
            .to(lineRef.current,
              { scaleX: 0, duration: 0.2, ease: 'power2.in' },
              '-=0.15'
            )
            // Layer 2 slides up and away
            .to(secondLayer.current,
              { y: '-100%', scaleY: 1.05, duration: 0.45, ease: 'power3.inOut' },
              '-=0.1'
            )
            // Layer 1 follows
            .to(firstLayer.current,
              { y: '-100%', scaleY: 1.1, duration: 0.45, ease: 'power3.inOut' },
              '-=0.3'
            )
            .call(() => {
              requestAnimationFrame(() => next());
            }, undefined, '-=0.1');

            return () => { tl.kill(); };
          }}
        >
          <Navbar />
          <main>{children}</main>

          {/* === Transition overlay layers === */}

          {/* Layer 1: background color */}
          <div
            ref={firstLayer}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{
              background: 'var(--background)',
              transform: 'translateY(100%)',
              willChange: 'transform',
            }}
          >
            {/* Layer 2: foreground accent */}
            <div
              ref={secondLayer}
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{
                background: 'var(--foreground)',
                transform: 'translateY(100%)',
                willChange: 'transform',
              }}
            >
              {/* Logo text */}
              <span
                ref={logoRef}
                className="text-2xl font-semibold tracking-tight"
                style={{ color: 'var(--background)', opacity: 0 }}
              >
                Ethan&apos;s Blog
              </span>

              {/* Decorative line */}
              <div
                ref={lineRef}
                className="mt-4 h-px w-16"
                style={{
                  background: 'var(--background)',
                  opacity: 0.3,
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
