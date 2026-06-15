'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';

export default function Home() {
  const reduce = useReducedMotion();

  return (
    <div>
      {/* Hero - Editorial asymmetric layout */}
      <section className="relative min-h-[100dvh] flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full pt-20 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left content */}
            <div className="lg:col-span-7">
              <motion.div
                initial={reduce ? false : { opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="flex items-center gap-3 mb-8"
              >
                <div className="w-8 h-[1px] bg-zinc-300 dark:bg-zinc-700" />
                <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 font-medium">
                  Software Engineer & Writer
                </span>
              </motion.div>

              <motion.h1
                initial={reduce ? false : { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
                className="text-7xl md:text-8xl lg:text-[120px] font-bold tracking-tighter text-zinc-900 dark:text-white leading-[0.85] mb-8"
              >
                Ethan
                <br />
                <span className="text-zinc-200 dark:text-zinc-800">Wu</span>
              </motion.h1>

              <motion.p
                initial={reduce ? false : { opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
                className="text-base text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed mb-10"
              >
                Building for the web, writing about the craft.
              </motion.p>

              <motion.div
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3, ease: 'easeOut' }}
                className="flex items-center gap-6"
              >
                <a
                  href="/blog"
                  className="group inline-flex items-center gap-3 text-sm font-medium text-zinc-900 dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors duration-150"
                >
                  <span className="w-10 h-10 rounded-full bg-zinc-900 dark:bg-white flex items-center justify-center group-hover:scale-105 transition-transform duration-150">
                    <svg className="w-4 h-4 text-white dark:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                  Read the blog
                </a>
                <span className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-800" />
                <Link
                  href="/register"
                  className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors duration-150"
                >
                  Join community
                </Link>
              </motion.div>
            </div>

            {/* Right decorative element */}
            <div className="hidden lg:flex lg:col-span-5 justify-end items-center">
              <motion.div
                initial={reduce ? false : { opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                className="relative"
              >
                {/* Decorative circles */}
                <div className="absolute -top-20 -right-10 w-40 h-40 rounded-full border border-zinc-100 dark:border-zinc-800/30" />
                <div className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full border border-zinc-100 dark:border-zinc-800/30" />
                
                {/* Main number */}
                <span className="text-[140px] font-bold leading-none text-zinc-100 dark:text-zinc-800/40 select-none">
                  01
                </span>
                
                {/* Floating label */}
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5, ease: 'easeOut' }}
                  className="absolute bottom-4 right-4"
                >
                  <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm px-2 py-1 rounded">
                    Portfolio
                  </span>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Bottom info bar */}
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="absolute bottom-8 left-0 right-0 px-6"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
                Based in St. Louis, MO
              </span>
              <div className="flex items-center gap-4">
                <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
                  Scroll to explore
                </span>
                <motion.div
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <svg className="w-3 h-3 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>


      <footer className="border-t border-zinc-200/60 dark:border-zinc-800/60">
        <div className="max-w-4xl mx-auto px-6 py-8 flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500">
          <span>&copy; 2026 Ethan Wu</span>
          <span>Built with Next.js</span>
        </div>
      </footer>
    </div>
  );
}
