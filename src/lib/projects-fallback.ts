/**
 * Fallback project data — used whenever the Prisma/Neon read fails.
 *
 * Why this exists:
 *   - The /project page reads from /api/projects. The API tries Neon
 *     first; if the table doesn't exist yet, env var is missing, or the
 *     DB is offline, the API falls back to this file.
 *   - That means the page always has content — no empty-state for
 *     recruiters on first visit.
 *   - It also means you can add a new project right here as a TypeScript
 *     object, push it, and the new project is live without any DB
 *     migration. Useful for very fast iteration.
 *   - When you migrate to Neon and the table is populated, this file
 *     becomes silent — the API uses DB rows instead.
 *
 * Adding a project here is a TypeScript object literal. Required fields:
 *   id, slug (unique), title, tagline, description, tier ("major"|"vibe"),
 *   category, tech (string[]), coverImage (URL — required for the card
 *   grid, see spec).
 */
import type { ProjectItem } from '@/lib/project-types';

export const FALLBACK_PROJECTS: ProjectItem[] = [
  // ────────────────────── MAJOR ──────────────────────
  {
    id: 'fallback-mono-1',
    slug: 'ethan-blog-platform',
    title: 'Ethan&apos;s Blog Platform',
    tagline: 'A Next.js + Prisma blog with view-transitions theming',
    description:
      'Full-stack personal blog built on Next.js 16, Prisma, Neon Postgres, and a custom document.startViewTransition theme animation. Includes auth, comments, gallery, restricted collections, and a project showcase page.',
    category: 'web',
    tier: 'major',
    status: 'shipped',
    tech: ['Next.js', 'React', 'Prisma', 'PostgreSQL', 'Tailwind', 'TypeScript'],
    highlights: [
      'Custom view-transitions theme animation with click-origin radial reveal',
      'Server-side auth with NextAuth v5 + bcryptjs',
      'Prisma + Neon integration with safe migrations',
    ],
    link: 'https://mimo-code-blog.vercel.app',
    repo: 'https://github.com/EthanWu2019/Mimo_Code_Blog',
    coverImage:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600&q=80&auto=format&fit=crop',
    featured: true,
    sortOrder: 0,
    year: 2026,
  },
  {
    id: 'fallback-mono-2',
    slug: 'ai-video-pipeline',
    title: 'AI Video Generation Pipeline',
    tagline: 'ComfyUI workflows → character-consistent video prompts',
    description:
      'End-to-end pipeline for generating character-consistent AI video: prompt engineering, workflow automation with ComfyUI, post-processing with SeedVR2 and RIFE-MLX, gallery management with watermarking.',
    category: 'ml',
    tier: 'major',
    status: 'in-progress',
    tech: ['Python', 'ComfyUI', 'Stable Diffusion', 'PyTorch', 'ffmpeg'],
    highlights: [
      'Character reference sheets drive video consistency',
      'Custom watermarking pipeline (image-perturb) for redistribution protection',
      'MLX-accelerated frame interpolation on Apple Silicon',
    ],
    link: null,
    repo: null,
    coverImage:
      'https://images.unsplash.com/photo-1536240478700-869232e884ea?w=1600&q=80&auto=format&fit=crop',
    featured: false,
    sortOrder: 1,
    year: 2026,
  },
  {
    id: 'fallback-mono-3',
    slug: 'distributed-task-orchestrator',
    title: 'Distributed Task Orchestrator',
    tagline: 'BullMQ-based job scheduler with priority queues and rate limiting',
    description:
      'Production-grade orchestration for long-running ML jobs and webhooks. Includes retry policies, dead-letter queues, real-time dashboards, and multi-tenant rate limiting.',
    category: 'systems',
    tier: 'major',
    status: 'shipped',
    tech: ['TypeScript', 'BullMQ', 'Redis', 'PostgreSQL', 'Node.js'],
    highlights: [
      'Priority queues with weighted fair scheduling',
      'Idempotent workers with at-least-once delivery semantics',
      'Per-tenant rate limiting via leaky-bucket algorithm',
    ],
    link: null,
    repo: null,
    coverImage:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1600&q=80&auto=format&fit=crop',
    featured: false,
    sortOrder: 2,
    year: 2025,
  },

  // ────────────────────── VIBE ──────────────────────
  {
    id: 'fallback-vibe-1',
    slug: 'macos-dock-clock',
    title: 'macOS Dock Clock',
    tagline: 'iOS StandBy-style flip clock for the dock',
    description:
      'Vite + React dock-resident flip clock with iOS StandBy gradient themes and 16 fonts.',
    category: 'web',
    tier: 'vibe',
    status: 'shipped',
    tech: ['Vite', 'React', 'Framer Motion'],
    highlights: [],
    link: null,
    repo: null,
    coverImage:
      'https://images.unsplash.com/photo-1499332345490-a412a3411b52?w=800&q=80&auto=format&fit=crop',
    featured: false,
    sortOrder: 0,
    year: 2026,
  },
  {
    id: 'fallback-vibe-2',
    slug: 'terminal-typer',
    title: 'Terminal Typer',
    tagline: 'A keyboard-touch-typing trainer that runs in your terminal',
    description:
      'Single-file Python typer that loads any text file and times your WPM in TUI.',
    category: 'tooling',
    tier: 'vibe',
    status: 'shipped',
    tech: ['Python', 'curses'],
    highlights: [],
    link: null,
    repo: null,
    coverImage:
      'https://images.unsplash.com/photo-1629654297299-c8506221ba62?w=800&q=80&auto=format&fit=crop',
    featured: false,
    sortOrder: 1,
    year: 2025,
  },
  {
    id: 'fallback-vibe-3',
    slug: 'cf-tunnel-dashboard',
    title: 'Hermes Dashboard',
    tagline: 'A small Vite+React dashboard for Hermes / Cloudflare setup',
    description:
      'Single-page dashboard exposing Hermes service status, health metrics, and Cloudflare Tunnel config. Built as a hobby dashboard.',
    category: 'web',
    tier: 'vibe',
    status: 'shipped',
    tech: ['Vite', 'React', 'Cloudflare'],
    highlights: [],
    link: 'https://ethanshermes.com',
    repo: null,
    coverImage:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80&auto=format&fit=crop',
    featured: false,
    sortOrder: 2,
    year: 2025,
  },
];

export function getFallbackProjects(tier?: 'major' | 'vibe'): ProjectItem[] {
  if (!tier) return FALLBACK_PROJECTS;
  return FALLBACK_PROJECTS.filter((p) => p.tier === tier);
}
