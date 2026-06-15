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

  return (
    <SessionProvider>
      <ThemeProvider>
        <TransitionRouter
          auto={true}
          leave={(next) => {
            const tl = gsap
              .timeline({ onComplete: next })
              .fromTo(
                firstLayer.current,
                { y: '100%' },
                { y: 0, duration: 0.4, ease: 'circ.inOut' }
              )
              .fromTo(
                secondLayer.current,
                { y: '100%' },
                { y: 0, duration: 0.4, ease: 'circ.inOut' },
                '<40%'
              );
            return () => { tl.kill(); };
          }}
          enter={(next) => {
            const tl = gsap
              .timeline()
              .fromTo(
                secondLayer.current,
                { y: 0 },
                { y: '-100%', duration: 0.4, ease: 'circ.inOut' }
              )
              .fromTo(
                firstLayer.current,
                { y: 0 },
                { y: '-100%', duration: 0.4, ease: 'circ.inOut' },
                '<40%'
              )
              .call(() => {
                requestAnimationFrame(() => next());
              }, undefined, '<50%');
            return () => { tl.kill(); };
          }}
        >
          <Navbar />
          <main>{children}</main>

          {/* Transition overlay layers */}
          <div
            ref={firstLayer}
            className="fixed inset-0 z-[100] translate-y-full"
            style={{ background: 'var(--background)' }}
          />
          <div
            ref={secondLayer}
            className="fixed inset-0 z-[100] translate-y-full"
            style={{ background: 'var(--foreground)' }}
          />
        </TransitionRouter>
      </ThemeProvider>
    </SessionProvider>
  );
}
