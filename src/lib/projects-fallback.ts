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
    title: 'Ethan Wu Platform',
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
    sortOrder: 5,
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
    repo: 'https://github.com/EthanWu2019/SemiProject-AIVideoPipeline',
    coverImage:
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1600&q=80&auto=format&fit=crop',
    featured: false,
    sortOrder: 6,
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
    repo: 'https://github.com/EthanWu2019/SemiProject-DistributedTaskOrchestrator',
    coverImage:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1600&q=80&auto=format&fit=crop',
    featured: false,
    sortOrder: 7,
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
    repo: 'https://github.com/EthanWu2019/SemiProject-SatelliteOnboardAI',
    coverImage:
      'https://images.unsplash.com/photo-1457364887197-9150188c107b?w=1600&q=80&auto=format&fit=crop',
    featured: false,
    sortOrder: 9,
    year: 2024,
  },

  // ──── MAJOR (newer) ────
  // ──── MAJOR 01 (owner priority) ────
  {
    // Owner's flagship personal project. Hosts a self-deployed
    // TRSS-YunZai QQ bot, contributes plugins to the upstream
    // example directory, and runs a small landing site for it.
    id: 'fallback-major-yunzai-local',
    slug: 'yunzai-local-deployment',
    title: 'YunZai QQ Bot — Local Deployment',
    tagline:
      'A 24/7 self-hosted TRSS-YunZai stack on a Mac mini, with single-JS plugins, a NapCat QQ client adapter, and the 海绵酱.love landing site',
    description:
      'The flagship personal project. The full TRSS-YunZai bot platform (originally by TimeRainStarSky on GitHub — the original repo is https://github.com/TimeRainStarSky/Yunzai — the owner is NOT a contributor upstream and did not write the platform itself) is self-hosted on a Mac mini. What the owner actually built: (1) a stack of single-JS plugins in the bot’s plugin/example directory, single-file modules that hook into the bot’s event bus (Game ID social-card plugin, weather plugin via a free weather API, stock-market + gold-price plugin, 豆浆 in-group virtual-currency + prize-redemption plugin, plus several other one-shot utilities — to be detailed with screenshots later); (2) the NapCat-based QQ client adapter that replaced the unstable official QQ login path after Tencent’s third-party-bot crackdown forced the legacy login flow to keep breaking; (3) the in-progress YunZai Console Tauri 2 desktop app that packages Redis + TRSS-YunZai + NapCat into a single-binary installer. v1 draft prose — the project page will get per-plugin screenshots, sample message transcripts, an actual NapCat adapter walkthrough, and a YunZai Console build log once the owner has time to publish them. The bot also runs 24/7 at https://海绵酱.love (currently served from the xn-- punycode form), which is the public-facing intro site for the same deployment. Note: the inspiration story for the whole effort goes back to 2020 — see the story block at the bottom of this card.',
    category: 'tooling',
    tier: 'major',
    status: 'shipped',
    tech: [
      'Node.js',
      'TRSS-YunZai',
      'NapCat',
      'QQ client protocol',
      'WebSocket',
      'Linux / macOS daemon',
      'Tauri 2 (YunZai Console, in progress)',
    ],
    highlights: [
      'NapCat <-> YunZai adapter: the alternative QQ login path the original platform lost after Tencent’s third-party-bot crackdown; covers avatars, file transfer, group message routing, login lifecycle',
      'Single-JS plugins in plugin/example/: Game ID social-card, weather (free weather API), stock + gold-price (free APIs), 豆浆 virtual-currency + prize redemption, and a handful of one-shot utilities',
      'YunZai Console: Tauri 2 desktop app that bundles Redis + TRSS-YunZai + NapCat into a one-click installer (in progress, build log to be added to the project page later)',
      '24/7 deployment running on a Mac mini, public-facing intro at 海绵酱.love',
      'Upstream source: https://github.com/TimeRainStarSky/Yunzai (owner is a downstream user and plugin author, not a YunZai core contributor)',
    ],
    link: 'https://海绵酱.love',
    repo: 'https://github.com/TimeRainStarSky/Yunzai',
    // Inline SVG data URI — no third-party hotlink, can’t 404, and
    // it visually says what the project is instead of being a
    // generic stock photo. Stable across the whole project life.
    coverImage:
      'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%201600%20800%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%220%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%230a0a0b%22%2F%3Cstop%20offset%3D%221%22%20stop-color%3D%22%2318181b%22%2F%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%221600%22%20height%3D%22800%22%20fill%3D%22url%28%23g%29%22%2F%3E%3Ccircle%20cx%3D%22320%22%20cy%3D%22400%22%20r%3D%22120%22%20fill%3D%22%23fafafa%22%2F%3E%3Ccircle%20cx%3D%22320%22%20cy%3D%22400%22%20r%3D%2280%22%20fill%3D%22%237a4a22%22%2F%3E%3Ccircle%20cx%3D%22302%22%20cy%3D%22392%22%20r%3D%226%22%20fill%3D%22%233b2410%22%2F%3E%3Ccircle%3D%20328%3D%22%20cy%3D%22385%22%20r%3D%225%22%20fill%3D%22%233b2410%22%2F%3E%3Ccircle%20cx%3D%22312%22%20cy%3D%22415%22%20r%3D%224%22%20fill%3D%22%233b2410%22%2F%3E%3Cpath%20d%3D%22M1180%20720%20Q1320%20680%201420%20740%22%20stroke%3D%22%237a4a22%22%20stroke-width%3D%223%22%20fill%3D%22none%22%2F%3E%3Ctext%20x%3D%22800%22%20y%3D%22200%22%20font-family%3D%22Georgia%2Cserif%22%20font-size%3D%2290%22%20fill%3D%22%23fafafa%22%3E%E6%B5%B7%E7%BB%B5%E9%85%B1%3C%2Ftext%3E%3Ctext%20x%3D%22800%22%20y%3D%22290%22%20font-family%3D%22Georgia%2Cserif%22%20font-size%3D%2228%22%20fill%3D%22%23a1a1aa%22%20font-style%3D%22italic%22%3EQQ%20bot%20%E2%80%A2%20%E2%97%A6%E2%97%A6%2F7%20%E2%80%A2%2024%2F7%3C%2Ftext%3E%3Ctext%20x%3D%22120%22%20y%3D%22440%22%20font-family%3D%22ui-monospace%2C%20monospace%22%20font-size%3D%2222%22%20fill%3D%22%23a1a1aa%22%3E%3C%2Ftext%3E%3C%2Fsvg%3E',
    featured: true,
    sortOrder: 0,
    year: 2026,
  },
  {
    // Course project: full semester agile build, real engineering
    // process (PRs / code review / issues / tests / AB). Team of
    // several CSE 4504 students; owner was frontend lead.
    id: 'fallback-major-athlete',
    slug: 'athlete-tracker-team-project',
    title: 'Athlete Tracker',
    tagline:
      'CSE 4504 software-engineering semester project — full-stack athlete training tracker',
    description:
      'A semester-long team project for WashU CSE 4504 (Software Engineering). The team ran the project the way real software shops run production work: every feature was scoped via issues, discussed in pull requests, and reviewed by at least one other teammate before merge. Owner was frontend lead (React/TS/UI state, accessibility, and component contracts). Other teammates owned infrastructure, persistence, and deployment. The repo carries a complete record of the engineering process — read the PR history and issue threads to see the work in chronological order. Test cases were written for every feature, and the team ran an A/B comparison of two parallel implementations of the analytics dashboard before settling on the final design. v1 draft prose; the project page will get deployment screenshots, the team retro, and per-feature test evidence when the owner is ready to publish them in detail.',
    category: 'web',
    tier: 'major',
    status: 'shipped',
    tech: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Jest', 'Cypress'],
    highlights: [
      'Full semester of real engineering practice: PRs, code review, issues, tests',
      'Owner owned frontend: React + TS, accessibility, component contracts',
      'A/B testing on the analytics dashboard before settling on the final design',
      'Function-by-function decoupling and per-feature test coverage',
    ],
    link: null,
    repo: 'https://github.com/cse4504-sp26-wustl/team-project-team1-obpc',
    coverImage:
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1600&q=80&auto=format&fit=crop',
    featured: true,
    sortOrder: 2,
    year: 2026,
  },
  {
    // EchoChamber kept its full description; bumped to sortOrder 3.
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
    repo: 'https://github.com/EthanWu2019/SemiProject-EchoChamberSimulator',
    coverImage:
      'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=1600&q=80&auto=format&fit=crop',
    featured: true,
    sortOrder: 3,
    year: 2026,
  },

  // ────────────────────── VIBE ──────────────────────
  {
    id: 'fallback-macos-dock-clock',
    slug: 'macos-dock-clock',
    title: 'macOS Dock Clock',
    tagline: 'iOS StandBy-style flip clock for the dock',
    description:
      'Vite + React dock-resident flip clock with iOS StandBy gradient themes and 16 fonts. Deployed at clock.ethanshermes.com.',
    category: 'web',
    tier: 'vibe',
    status: 'shipped',
    tech: ['Vite', 'React', 'Framer Motion'],
    highlights: [],
    link: 'https://clock.ethanshermes.com',
    repo: 'https://github.com/EthanWu2019/SemiProject-MacOSDockClock',
    coverImage:
      'https://images.unsplash.com/photo-1494173853739-c21f58b16055?w=800&q=80&auto=format&fit=crop',
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
    repo: 'https://github.com/EthanWu2019/SemiProject-TerminalTyper',
    coverImage:
      'https://images.unsplash.com/photo-1620503374956-c942862f0372?w=800&q=80&auto=format&fit=crop',
    featured: false,
    sortOrder: 1,
    year: 2025,
  },
  {
    id: 'fallback-vibe-hermes-control-room',
    slug: 'hermes-control-room',
    title: 'Hermes Control Room',
    tagline:
      'A live operations dashboard for the personal AI agent — token flow, sessions, system load, alerts',
    description:
      'A vanilla-JS operations dashboard for the Hermes Agent gateway running on a Mac mini. Live wires to the gateway via Server-Sent Events: per-day token breakdown (input / cache read / output / reasoning), per-provider quota tracking, real-time conversation monitor for the top 20 sessions, host CPU/memory/disk/thermal-core view, system load average, and cron-job status. Toggles dark/light, embeds a 30-day token-spend chart, and surfaces an alerts panel. Deployed at ethanshermes.com. The owner built this as the public face of the gateway — not a polished product, just the panels the owner actually needs at a glance.',
    category: 'web',
    tier: 'vibe',
    status: 'shipped',
    tech: ['Vanilla JS', 'Server-Sent Events', 'Chart.js'],
    highlights: [
      'SSE-wired dashboard refreshed live from the gateway process',
      'Per-provider quota, host load, and per-session tool-call metrics',
      'Built and shipped as the personal face of the home Mac mini',
    ],
    link: 'https://ethanshermes.com',
    repo: 'https://github.com/EthanWu2019/SemiProject-HermesControlRoom',
    coverImage:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80&auto=format&fit=crop',
    featured: false,
    sortOrder: 3,
    year: 2026,
  },
  {
    id: 'fallback-vibe-canvas-pulse',
    slug: 'canvas-assignment-pulse',
    title: 'Canvas Assignment Pulse',
    tagline:
      'A weekly / monthly WashU Canvas assignment tracker refreshed every 30 minutes from the ICS feed',
    description:
      'A single-page WashU Canvas dashboard that turns the institutional ICS feed into a week / 2-weeks / month / term view. A cron job (d9552b9f65ba) runs every 30 minutes: pull ICS → parse → SQLite → expose a tiny JSON endpoint the page reads. Each upcoming assignment links straight to the Canvas deep-link; the term-overview panel maps each course onto its date band so you can see "what is due in the next 17 weeks" at a glance. Deployed at canvas.ethanshermes.com.',
    category: 'web',
    tier: 'vibe',
    status: 'shipped',
    tech: ['Python', 'SQLite', 'ICS', 'vanilla JS'],
    highlights: [
      'Cron-driven 30-min refresh from WashU Canvas ICS — no manual sync',
      'Three read modes: next week / next two weeks / month / term overview',
      'Built to solve one problem: "what is due before next Friday"',
    ],
    link: 'https://canvas.ethanshermes.com',
    repo: 'https://github.com/EthanWu2019/SemiProject-CanvasAssignmentPulse',
    coverImage:
      'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=800&q=80&auto=format&fit=crop',
    featured: false,
    sortOrder: 14,
    year: 2026,
  },

  // ────────────────────── MAJOR (batch added from GitHub inventory) ──────────────────────
  {
    // Tauri 2 desktop app that orchestrates a full QQ bot stack with
    // one click. Lower priority than the local-deploy flagship.
    id: 'fallback-major-yunzai',
    slug: 'yunzai-tauri-launcher',
    title: 'YunZai Console',
    tagline: 'Tauri 2 desktop app that orchestrates a full QQ bot stack with one click',
    description:
      'A Tauri 2 desktop application that packages Redis + TRSS-Yunzai + NapCat QQ bot into a single installer experience: setup wizard, QR-code web login UI, one-click start/stop orchestration, and MSI/NSIS packaging for Windows.',
    category: 'tooling',
    tier: 'major',
    status: 'in-progress',
    tech: ['Rust', 'Tauri 2', 'React', 'TypeScript', 'Tailwind', 'Redis'],
    highlights: [
      'One-click orchestration of a three-service bot stack',
      'Web-based QR login flow (localhost web UI)',
      'Windows installers via MSI/NSIS',
    ],
    link: null,
    repo: 'https://github.com/EthanWu2019/MyYunZai',
    coverImage:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1600&q=80&auto=format&fit=crop',
    featured: true,
    sortOrder: 4,
    year: 2026,
  },
  {
    id: 'fallback-major-money',
    slug: 'where-my-money-go',
    title: 'Where My Money Go',
    tagline: 'Personal expense tracker backed by Notion + daily cron sync',
    description:
      'A personal finance front-end that records every expense into a local cache and syncs to Notion on a nightly cron. Categories, fixed monthly subscriptions, and a daily digest.',
    category: 'web',
    tier: 'major',
    status: 'shipped',
    tech: ['JavaScript', 'Notion API', 'Cron', 'CSS'],
    highlights: [
      'Nightly cron sync into Notion database',
      'Category system tuned for personal budgeting',
    ],
    link: null,
    repo: 'https://github.com/EthanWu2019/where-my-money-go',
    coverImage:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1600&q=80&auto=format&fit=crop',
    featured: false,
    sortOrder: 11,
    year: 2026,
  },
  {
    id: 'fallback-major-wucg',
    slug: 'wucg-hackathon-skoool',
    title: 'WUCG Hackathon — Team SKOOOL',
    tagline: 'Game-club hackathon build in Flutter',
    description:
      'Hackathon entry built with the WUCG gaming club: a mobile app built in Dart/Flutter over a weekend sprint.',
    category: 'mobile',
    tier: 'major',
    status: 'shipped',
    tech: ['Dart', 'Flutter'],
    highlights: [],
    link: null,
    repo: 'https://github.com/EthanWu2019/Hackathon_WUCG_Team_SKOOOL',
    coverImage:
      'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=1600&q=80&auto=format&fit=crop',
    featured: false,
    sortOrder: 12,
    year: 2026,
  },

  // ────────────────────── VIBE (batch added from GitHub inventory) ──────────────────────
  {
    id: 'fallback-vibe-music',
    slug: 'local-music-generation',
    title: 'Local Music Generation',
    tagline: 'Stable Audio 3 running locally on Apple Silicon / CPU',
    description:
      'Scripts that get Stable Audio 3 text-to-music generation running fully locally on a Mac — no cloud API, just a working local pipeline.',
    category: 'ml',
    tier: 'vibe',
    status: 'shipped',
    tech: ['Python', 'Stable Audio 3', 'Shell'],
    highlights: [],
    link: null,
    repo: 'https://github.com/EthanWu2019/SemiProject-MusicGeneration',
    coverImage:
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80&auto=format&fit=crop',
    featured: false,
    sortOrder: 5,
    year: 2026,
  },
  {
    id: 'fallback-vibe-upscale',
    slug: 'video-upscale-demo',
    title: 'Video Upscale Demo',
    tagline: 'Real-Cugan 2x/4x upscale + RIFE 2x/4x frame interpolation',
    description:
      'A demo pipeline combining Real-Cugan super-resolution with RIFE frame interpolation for AI video enhancement.',
    category: 'ml',
    tier: 'vibe',
    status: 'shipped',
    tech: ['Python', 'Real-Cugan', 'RIFE', 'ffmpeg'],
    highlights: [],
    link: null,
    repo: 'https://github.com/EthanWu2019/SemiProject-VideoUpscaleDemo',
    coverImage:
      'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&q=80&auto=format&fit=crop',
    featured: false,
    sortOrder: 6,
    year: 2026,
  },
  {
    id: 'fallback-vibe-imagetools',
    slug: 'image-tools-cli',
    title: 'Image Tools CLI',
    tagline: 'Single-file CLI toolbox: background removal, upscale, face restore, watermark',
    description:
      'A single-file Python CLI that chains common image tasks — background removal, super-resolution, face restoration, and watermark cleanup.',
    category: 'tooling',
    tier: 'vibe',
    status: 'shipped',
    tech: ['Python', 'CLI'],
    highlights: [],
    link: null,
    repo: 'https://github.com/EthanWu2019/SemiProject-ImageTools',
    coverImage:
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80&auto=format&fit=crop',
    featured: false,
    sortOrder: 7,
    year: 2026,
  },
  {
    id: 'fallback-vibe-canvascal',
    slug: 'canvas-calendar',
    title: 'Canvas Calendar',
    tagline: 'Standalone WashU Canvas ICS calendar site',
    description:
      'A small standalone site that renders the WashU Canvas assignment ICS feed as a readable calendar.',
    category: 'web',
    tier: 'vibe',
    status: 'shipped',
    tech: ['HTML', 'JavaScript', 'ICS'],
    highlights: [],
    link: null,
    repo: 'https://github.com/EthanWu2019/SemiProject-CanvasCalendar',
    coverImage:
      'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&q=80&auto=format&fit=crop',
    featured: false,
    sortOrder: 8,
    year: 2026,
  },
  {
    id: 'fallback-vibe-gamepilot',
    slug: 'game-piloting-prototype',
    title: 'Game Piloting Prototype',
    tagline: 'v0-sketched UI prototype for AI-assisted game piloting',
    description:
      'A v0-generated prototype exploring UI for AI-assisted game piloting — thrown together to test interaction ideas.',
    category: 'experiment',
    tier: 'vibe',
    status: 'shipped',
    tech: ['TypeScript', 'v0'],
    highlights: [],
    link: null,
    repo: 'https://github.com/EthanWu2019/SemiProject-GamePiloting',
    coverImage:
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80&auto=format&fit=crop',
    featured: false,
    sortOrder: 9,
    year: 2026,
  },
  {
    id: 'fallback-vibe-dashboard',
    slug: 'daily-dashboard-prototype',
    title: 'Daily Dashboard Prototype',
    tagline: 'v0-sketched personal daily dashboard',
    description:
      'A v0-generated prototype of a personal daily dashboard — weather, tasks, calendar, and a quick-glance overview.',
    category: 'experiment',
    tier: 'vibe',
    status: 'shipped',
    tech: ['TypeScript', 'v0'],
    highlights: [],
    link: null,
    repo: 'https://github.com/EthanWu2019/SemiProject-DailyDashboard',
    coverImage:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80&auto=format&fit=crop',
    featured: false,
    sortOrder: 10,
    year: 2026,
  },
  {
    id: 'fallback-vibe-actordb',
    slug: 'virtual-actor-db',
    title: 'Virtual Actor DB',
    tagline: 'AI virtual-character database site',
    description:
      'A database site for AI virtual characters — browse, search, and explore character profiles with tags and metadata.',
    category: 'web',
    tier: 'vibe',
    status: 'shipped',
    tech: ['HTML', 'CSS', 'JavaScript'],
    highlights: [],
    link: null,
    repo: 'https://github.com/EthanWu2019/Virtual-Actor-DB',
    coverImage:
      'https://images.unsplash.com/photo-1633613286991-611fe299c4be?w=800&q=80&auto=format&fit=crop',
    featured: false,
    sortOrder: 11,
    year: 2026,
  },
  {
    id: 'fallback-vibe-hermesblog',
    slug: 'hermes-blog',
    title: 'Hermes Blog',
    tagline: 'A blog site for the Hermes agent project',
    description:
      'An early blog site documenting the Hermes agent experiments and personal automation work.',
    category: 'web',
    tier: 'vibe',
    status: 'shipped',
    tech: ['HTML', 'CSS'],
    highlights: [],
    link: null,
    repo: 'https://github.com/EthanWu2019/Hermes_Blog',
    coverImage:
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80&auto=format&fit=crop',
    featured: false,
    sortOrder: 12,
    year: 2026,
  },
  {
    id: 'fallback-vibe-legacyhome',
    slug: 'legacy-homepage',
    title: 'Legacy Homepage',
    tagline: 'The first version of the personal homepage',
    description:
      'The original ethanwu2019.github.io homepage — a static HTML site that predates ethanwu.work.',
    category: 'web',
    tier: 'vibe',
    status: 'archived',
    tech: ['HTML'],
    highlights: [],
    link: null,
    repo: 'https://github.com/EthanWu2019/ethanwu2019.github.io',
    coverImage:
      'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80&auto=format&fit=crop',
    featured: false,
    sortOrder: 13,
    year: 2024,
  },
  {
    id: 'fallback-vibe-legacyblog',
    slug: 'legacy-blog',
    title: 'Legacy Blog',
    tagline: 'An early JavaScript blog',
    description:
      'An early static blog built in plain JavaScript — one of the first personal web projects.',
    category: 'web',
    tier: 'vibe',
    status: 'archived',
    tech: ['JavaScript'],
    highlights: [],
    link: null,
    repo: 'https://github.com/EthanWu2019/Blog',
    coverImage:
      'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&q=80&auto=format&fit=crop',
    featured: false,
    sortOrder: 2,
    year: 2024,
  },
  {
    id: 'fallback-vibe-phpgroup',
    slug: 'php-group-assignment',
    title: 'PHP Group Assignment',
    tagline: 'CSE 330S rapid-prototyping group project in PHP',
    description:
      'A group assignment for CSE 330S (Rapid Prototype Development) built in PHP — quick iteration, shared codebase.',
    category: 'web',
    tier: 'vibe',
    status: 'archived',
    tech: ['PHP'],
    highlights: [],
    link: null,
    repo: 'https://github.com/EthanWu2019/330_assign2_Group',
    coverImage:
      'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&q=80&auto=format&fit=crop',
    featured: false,
    sortOrder: 15,
    year: 2025,
  },
  {
    id: 'fallback-vibe-hmj',
    slug: 'hmj-memorial-page',
    title: 'HMJ Memorial Page',
    tagline: 'A personal memorial page',
    description:
      'A small static memorial page — a personal project built with care.',
    category: 'web',
    tier: 'vibe',
    status: 'shipped',
    tech: ['HTML', 'CSS'],
    highlights: [],
    link: null,
    repo: 'https://github.com/EthanWu2019/HMJ.love',
    coverImage:
      'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&q=80&auto=format&fit=crop',
    featured: false,
    sortOrder: 16,
    year: 2026,
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
