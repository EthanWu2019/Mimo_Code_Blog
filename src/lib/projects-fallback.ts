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

  // ────────────────────── OLDER MAJOR (kept for seniority order) ──────────────────────
  {
    // Undergraduate capstone project — on-board AI for Earth-observation
    // satellites. Owner was the platform lead; the system coordinates
    // tasking → onboard inference → ground station → analytics over
    // a custom FPGA + Cambricon MLU220 compute stack (Jiguang-1000/2000/5000
    // edge servers). Includes a digital-twin for ground simulation.
    id: 'fallback-mono-4',
    slug: 'satellite-onboard-ai-platform',
    title: 'Onboard Satellite AI Platform (星载智能算法平台)',
    tagline:
      'A satellite-edge AI platform: Earth-observation tasking → onboard inference → ground station → analytics',
    description:
      'An end-to-end satellite-edge AI platform: front-end (React + Vite + satellite.js + react-globe.gl) for satellite-pass visualisation and tasking; Python back-end (Flask + SQLAlchemy + PyTorch) coordinating the Jiguang-1000 onboard computer (FPGA + Cambricon NPU) and the Jiguang-2000 MLU220 inference cluster; TIFF/UTIF pipeline for cloud-mask, target-detection and image-compression modules; a parallel-twin ground simulator for hardware-in-the-loop testing; admin dashboard, auth, and Socket.IO real-time data visualisations.',
    category: 'ml',
    tier: 'major',
    status: 'shipped',
    tech: [
      'React',
      'Vite',
      'Flask',
      'SQLAlchemy',
      'PyTorch',
      'satellite.js',
      'UTIF/UTIFF',
      'socket.io',
      'react-globe.gl',
      'three.js',
      'FPGA',
      'Cambricon MLU220',
    ],
    highlights: [
      'Onboard inference over Cambricon MLU220 (80 TOPS int8) with a 32-TOPS FPGA-accelerated preprocessor',
      'WebSocket-backed ground visualisations of orbital passes, telemetry and algorithm outputs',
      'Hardware-in-the-loop parallel-twin simulator so operators can dry-run tasking payloads before uplink',
      'TIFF upload + UTIF decoding pipeline feeding cloud-mask, target-detection and image-compression modules',
    ],
    link: null,
    repo: 'https://github.com/EthanWu2019/Ai_Platform',
    coverImage:
      'https://images.unsplash.com/photo-1457364887197-9150188c107b?w=1600&q=80&auto=format&fit=crop',
    featured: false,
    sortOrder: 4,
    year: 2024,
  },

  // ──── MAJOR (newer) ────
  {
    // Personal / portfolio piece — a Next.js 16 + v0 app that
    // simulates the dynamic of a hostile social-media feed and lets
    // players experience an "echo chamber" first-hand. Initial v0
    // commit 2026-04-13; DeepSeek integration landed on day two with
    // a deterministic mock fallback so the app stays playable even
    // when the upstream model is rate-limited.
    id: 'fallback-mono-echo-chamber',
    slug: 'echo-chamber-cyberbullying-simulator',
    title: 'EchoChamber — Cyber-bullying Simulator',
    tagline:
      'An interactive social-media simulator where 6 personality archetypes gaslight, fawn over or pile on what you just posted',
    description:
      'A single-page Next.js 16 + v0-generated app that simulates a hostile social-media feed. The user posts something; six AI archetypes (hater, stan, logic-lord, moral-knight, spam-bot, normal) reply in real time, weighted toward negative personalities. A live sentiment meter drifts the player\'s reputation; pulls toward negative unlocks achievements ("first flamed", "sentiment crashed") and DM harassment events; recovery unlocks a different set. A story-mode panel ships hand-authored scenarios (easy/medium/hard). LLM calls route through /api/generate-comments using DeepSeek with a 35% hater / 15% stan / 20% logic-lord / 20% moral-knight / 10% spam-bot weighting baked into the system prompt; the local mock-ai library keeps the experience intact when the API is unreachable. Bilingual zh/en UI with a per-component i18n table, screen-shake on harsh comments, sound effects, idle overlay, account stats, block / report / mute, and light/dark themes.',
    category: 'web',
    tier: 'major',
    status: 'shipped',
    tech: [
      'Next.js',
      'React 19',
      'TypeScript',
      'Tailwind v4',
      'Framer Motion',
      'Radix UI',
      'DeepSeek API',
      'framer-motion',
      'recharts',
      'socket.io',
      'zustand-style local storage',
    ],
    highlights: [
      'Per-personality system prompts run through DeepSeek to keep replies stylistically distinct',
      'Local mock-ai fallback keeps the demo fully playable offline / when rate-limited',
      'Sentiment-driven achievement system with branches for "flamed" and "recovered" arcs',
      'Story-mode with 3 hand-authored difficulty tiers for short, focused sessions',
      'Trilingual (zh / en) UI with per-component translation tables',
    ],
    link: null,
    repo: 'https://github.com/EthanWu2019/v0-echo-chamber',
    coverImage:
      'https://images.unsplash.com/photo-1557682250-33d709cdaed6?w=1600&q=80&auto=format&fit=crop',
    featured: true,
    sortOrder: 3,
    year: 2026,
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
  const list = tier ? FALLBACK_PROJECTS.filter((p) => p.tier === tier) : FALLBACK_PROJECTS;
  // Match the DB ORDER BY — by sortOrder asc, then latest first.
  return [...list].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return (b.year ?? 0) - (a.year ?? 0);
  });
}
