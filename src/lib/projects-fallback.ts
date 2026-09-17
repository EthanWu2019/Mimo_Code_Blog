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
    // Owner's flagship personal project: a self-deployed
    // TRSS-YunZai QQ bot stack plus the plugins and the NapCat
    // adapter the owner wrote around it.
    id: 'fallback-major-yunzai-local',
    slug: 'yunzai-local-deployment',
    title: 'YunZai QQ Bot — Local Deployment',
    tagline:
      'A 24/7 self-hosted TRSS-YunZai bot on a Mac mini — my plugins, my NapCat QQ adapter, and the 海绵酱 landing site',
    description:
      'YunZai is an open-source QQ bot platform. I self-host the full stack 24/7 on a Mac mini and built three layers of my own on top of it: a set of single-JS plugins, the NapCat QQ login adapter, and (in progress) a Tauri 2 desktop packager. See the sections below for my contributions and the full story.',
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
      'NapCat adapter — the QQ login path the platform lost after Tencent’s crackdown',
      'Game ID plugin — a social-card registry of friends’ game IDs',
      'Weather plugin — city-level forecasts via a free weather API',
      'Stock + gold-price plugin — live quotes from free APIs',
      '豆浆 plugin — in-group virtual-currency game to keep chats alive',
      'YunZai Console — Tauri 2 one-click installer (in progress)',
      '24/7 deployment — public intro at 海绵酱.love',
    ],
    link: 'https://www.xn--90w268avpn.love/',
    repo: 'https://github.com/TimeRainStarSky/Yunzai',
    coverImage: '/yunzai-cover.png',
    featured: true,
    sortOrder: 0,
    year: 2026,
    detailSections: [
      {
        heading: 'The original platform',
        body: 'YunZai is an open-source QQ bot platform, originally created by TimeRainStarSky. The source lives at https://github.com/TimeRainStarSky/Yunzai. I am a downstream user and plugin author — not a core contributor. Everything below is my own layer on top of that upstream project.',
      },
      {
        heading: 'My plugins · plugin/example/',
        body: 'A stack of single-JS plugins that hook into the bot’s event bus, each one file you can drop into plugin/example/ and restart. Game ID — a social-card registry where friends store their game IDs and print a card-style list for adding each other. Weather — city-level forecasts anywhere in the world via a free weather API. Stock & gold — live quotes from free market APIs. 豆浆 — an in-group virtual-currency game: earn coins by chatting with the bot, redeem virtual prizes, keep the group alive. Plus several one-shot utilities. (Placeholder list — per-plugin screenshots and usage walkthroughs are coming.)',
      },
      {
        heading: 'NapCat QQ adapter',
        body: 'After Tencent tightened control over third-party bots, YunZai’s original QQ login path became increasingly unstable. I adapted the deployment to log in through NapCat instead: NapCat loads the real QQ client and exposes a OneBot11 endpoint, then connects back to YunZai as a WebSocket client at ws://localhost:2536/OneBotv11 (connection name “trss”, 30s heartbeat, 30s reconnect). Three QQ accounts run side by side, each with its own config pair. This covers avatars, file transfer, group-message routing and the whole login lifecycle. Startup order: Redis → YunZai → NapCat. The full wiring is live on my game laptop and can be inspected there.',
      },
      {
        heading: 'YunZai Console · in progress',
        body: 'I am currently working on packaging the whole project: YunZai Console, a Tauri 2 desktop app that bundles Redis + TRSS-YunZai + NapCat into a single-binary installer — setup wizard, QR-code web login (localhost web UI), one-click start/stop, MSI/NSIS packaging for Windows.',
      },
      {
        heading: 'Live deployment · 海绵酱',
        body: 'The bot runs 24/7. This is the official intro site for 海绵酱, my always-on YunZai-based bot: https://www.xn--90w268avpn.love/',
      },
    ],
    story: [
      '2020 — Genshin Impact launches globally as a phenomenon, and QQ is the biggest social platform for Chinese game communities, bar none. In group chats with thousands of members I watched people talk to a bot with #-commands: pulling in-game account data, character build help, material and farming info, even auto check-ins on Hoyolab. That moment I understood — this is a genuinely fun community bot. It planted the seed for everything after.',
      'Because YunZai got famous, plugins beyond Genshin kept appearing in the open-source ecosystem: tarot-card draws to tell your fortune, AI summarizers of group chat, multi-game account binding with live community info, even a Discord deployment bridge. As a developer I wanted to join that movement.',
      'My first plugin was Game ID: friends store their game IDs in the bot’s local database and print a card-style list of everything they play, so other members can add them — a social business card for gamers.',
      'As the first, tenth, hundredth user adopted it, I was genuinely happy — so I kept going: a weather plugin (city-level forecasts anywhere via a free weather API), a stock + gold-price plugin (free APIs), the 豆浆 coin game (virtual currency and virtual prizes to keep group chats active), and all kinds of other fun utilities.',
      'Then Tencent began cracking down on third-party bots — they can be abused for grey-market content, explicit material, even political propaganda — and YunZai’s original QQ login method became less and less stable. That is exactly why I switched to NapCat as the login layer. The whole journey — the bot, the plugins, the adapter — is the soul of this project.',
    ],
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
