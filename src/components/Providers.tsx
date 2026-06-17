'use client';

import { useRef } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from './ThemeProvider';
import Navbar from './Navbar';
import gsap from 'gsap';
import { TransitionRouter } from 'next-transition-router';

export default function Providers({ children }: { children: React.ReactNode }) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  return (
    <SessionProvider>
      <ThemeProvider>
        <TransitionRouter
          auto={true}
          leave={(next) => {
            const ov = overlayRef.current;
            const ct = contentRef.current;
            if (!ov) { next(); return; }

            gsap.set(ov, { display: 'block', y: '100%' });
            gsap.set(ct, { opacity: 0 });

            const tl = gsap.timeline({ onComplete: next });

            // Overlay slides up smoothly
            tl.to(ov, {
              y: '0%',
              duration: 0.55,
              ease: 'power3.out',
            })
            // Logo fades in while overlay is settling
            .to(ct, {
              opacity: 1,
              duration: 0.3,
              ease: 'power2.out',
            }, '-=0.2');

            return () => { tl.kill(); };
          }}
          enter={(next) => {
            const ov = overlayRef.current;
            const ct = contentRef.current;
            if (!ov) { next(); return; }

            const tl = gsap.timeline({
              onComplete: () => {
                gsap.set(ov, { display: 'none' });
                next();
              },
            });

            // Logo fades out first
            tl.to(ct, {
              opacity: 0,
              duration: 0.2,
              ease: 'power2.in',
            })
            // Overlay slides up and away
            .to(ov, {
              y: '-100%',
              duration: 0.55,
              ease: 'power3.inOut',
            }, '-=0.05');

            return () => { tl.kill(); };
          }}
        >
          <Navbar />
          <main>{children}</main>

          {/* Single-layer transition overlay */}
          <div
            ref={overlayRef}
            className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center transition-overlay"
            style={{ display: 'none', transform: 'translateY(100%)' }}
          >
            <div ref={contentRef} className="flex flex-col items-center" style={{ opacity: 0 }}>
              <span className="text-xl font-medium tracking-tight select-none transition-overlay-text">
                Ethan&apos;s Blog
              </span>
              <div className="mt-3 h-px w-12 transition-overlay-line" />
            </div>
          </div>
        </TransitionRouter>
      </ThemeProvider>
    </SessionProvider>
  );
}
