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
    title: 'YunZai QQ Bot',
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
    contributions: [
      'Independently shipped a suite of third-party YunZai plugins: weather, 豆浆 in-group virtual-currency game, Game ID social-card, stock + gold/silver price, and several one-shot utilities — all single-JS modules in plugin/example/.',
      'Built and maintained my own NapCat-based QQ login adapter to replace the unstable official QQ login path after Tencent’s third-party-bot crackdown. Covers avatars, file transfer, group-message routing, and the full login lifecycle.',
      'Currently packaging the whole deployment as YunZai Console — a Tauri 2 desktop app that bundles Redis + TRSS-YunZai + NapCat into a single-binary installer.',
    ],
    contributionStats: [
      { value: '20k+', label: 'Daily messages' },
      { value: '10k+', label: 'Active group users' },
      { value: '24/7', label: 'Uptime on a Mac mini' },
      { value: '4', label: 'Single-JS plugins shipped' },
    ],
    chapters: [
      {
        era: '2020',
        heading: 'The spark — Genshin, QQ, and a bot in a thousand-person group',
        body:
          "Genshin Impact launches globally as a phenomenon, and QQ is the biggest social platform for Chinese game communities — bar none. In group chats with thousands of members, I watched people talk to a bot through #-commands: pulling in-game account data, character build help, material and farming info, even auto check-ins on Hoyolab. That moment I understood — this is a genuinely fun community bot. It planted the seed for everything after.",
        contribution: false,
      },
      {
        era: 'The platform',
        heading: 'YunZai — the open-source engine underneath',
        body:
          "That bot was running on YunZai, an open-source QQ bot platform. The original project is TimeRainStarSky's — I am a downstream user and plugin author, not a core contributor. Everything after this point is my own layer on top of that upstream engine.",
        contribution: false,
        links: [
          {
            label: 'TimeRainStarSky/Yunzai · source',
            href: 'https://github.com/TimeRainStarSky/Yunzai',
          },
        ],
      },
      {
        era: 'Contribution 01',
        heading: 'Game ID — my first plugin',
        body:
          "Because YunZai got famous, plugins beyond Genshin kept appearing in the open-source ecosystem: tarot-card draws to tell your fortune, AI summarizers of group chat, multi-game account binding with live community info, even a Discord deployment bridge. I wanted to join that movement. My first plugin was Game ID: friends store their game IDs in the bot's local database and print a card-style list of everything they play — a social business card for gamers.",
        contribution: true,
      },
      {
        era: 'Contribution 02',
        heading: 'Weather, stock & gold, and 豆浆',
        body:
          "As the first, tenth, hundredth user adopted Game ID, I was genuinely happy — so I kept going. A weather plugin for city-level forecasts anywhere in the world via a free weather API. A stock + gold-price plugin on free market APIs. And 豆浆, an in-group virtual-currency game: earn coins by chatting with the bot, redeem virtual prizes, keep the group chat alive.",
        contribution: true,
      },
      {
        era: 'Contribution 03',
        heading: 'The crackdown — and the NapCat adapter',
        body:
          "Then Tencent began cracking down on third-party bots — they can be abused for grey-market content, explicit material, even political propaganda — and YunZai's original QQ login path became less and less stable. I adapted the deployment to log in through NapCat instead: NapCat loads the real QQ client and exposes a OneBot11 endpoint, then connects back to YunZai as a WebSocket client at ws://localhost:2536/OneBotv11 (connection \"trss\", 30s heartbeat, 30s reconnect). Three QQ accounts run side by side, each with its own config pair — covering avatars, file transfer, group-message routing and the whole login lifecycle. Startup order: Redis → YunZai → NapCat. The full wiring is live on my game laptop.",
        contribution: true,
      },
      {
        era: 'Contribution 04 · in progress',
        heading: 'YunZai Console — packaging the whole stack',
        body:
          "Right now I'm working on turning this whole deployment into a product: YunZai Console, a Tauri 2 desktop app that bundles Redis + TRSS-YunZai + NapCat into a single-binary installer — setup wizard, QR-code web login (localhost web UI), one-click start/stop, MSI/NSIS packaging for Windows.",
        contribution: true,
      },
      {
        era: 'Live',
        heading: '海绵酱 — running 24/7',
        body:
          "The bot has been running around the clock ever since. This is the official intro site for 海绵酱, my always-on YunZai-based bot.",
        contribution: false,
        links: [
          {
            label: '海绵酱.love · live site',
            href: 'https://www.xn--90w268avpn.love/',
          },
        ],
      },
    ],

  },
  {
    // CSE 4504 software-engineering semester project. Full team
    // sprint cycle: infrastructure first, then features in parallel
    // branches with PR review, then integration, then packaging.
    // The owner was frontend lead (Chengze Wu) — owned the Next.js
    // console, the Zustand store, the display-screen pairing, and
    // integration tests at the controller layer.
    id: 'fallback-major-athlete',
    slug: 'athlete-tracker-team-project',
    title: 'Athlete Tracker',
    tagline:
      'A semester-long team build in CSE 4504 — Clean Architecture across Python + TypeScript, real PR review, packaged into an Electron desktop app with a multi-platform CI release workflow',
    description:
      "A team project for WashU CSE 4504 (Software Engineering). The team ran it the way real software shops run production work: every feature started as an issue, became a pull request, and was reviewed by at least one teammate before merge. Clean Architecture on the Python side (domain / application / infrastructure / controller), Next.js + Zustand + SWR on the frontend, FastAPI bridging the two. The owner was frontend lead — owned the console UI, the Zustand store, the external display-screen pairing, the component contracts, and the controller-layer integration test. Repo carries a complete record of the engineering process — PR history, code-review comments, and issue threads walk through the work in chronological order. Per-feature test coverage was written as features were built. Final packaging: PyInstaller bundles the Python backend into a single folder, Electron wraps it as a desktop app, and GitHub Actions ships multi-platform release builds.",
    category: 'web',
    tier: 'major',
    status: 'shipped',
    tech: [
      'Next.js 15',
      'React 19',
      'TypeScript',
      'Tailwind v4',
      'Zustand',
      'SWR',
      'FastAPI',
      'Pydantic',
      'uvicorn',
      'Resend (transactional email)',
      'PyInstaller',
      'Electron',
      'electron-builder',
      'Clean Architecture (domain / application / infrastructure / controller)',
      'pytest',
      'GitHub Actions (multi-platform release workflow)',
    ],
    highlights: [
      'Full semester of real engineering practice: PRs, code review, issues, tests, CI',
      'Owner was frontend lead: Next.js console, Zustand store, external display-screen pairing, component contracts, integration tests at the controller layer',
      'Clean Architecture across Python and TypeScript — domain / application / infrastructure / controller separation',
      'Undo last scan feature shipped with ScanDebouncer, event-log index capture, and a toast state machine — all in PR review',
      'Final packaging: PyInstaller bundles Python backend, Electron wraps it, GitHub Actions ships multi-platform release builds',
    ],
    link: 'https://athlete-tracker-team-project.vercel.app',
    repo: 'https://github.com/cse4504-sp26-wustl/team-project-team1-obpc',
    coverImage:
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1600&q=80&auto=format&fit=crop',
    featured: true,
    sortOrder: 2,
    year: 2026,
    contributions: [
      'Frontend lead — owned the Next.js 15 console (Zustand store, SWR, lucide-react, Tailwind v4), the external display-screen pairing, and the component-contract API that let the rest of the team build against stable frontend shapes without waiting for UI.',
      'Wrote the integration test at the controller layer end-to-end — loads a CSV roster, starts a group, fires simulated RFID/NFC events, asserts the workout completion report. The bar for "feature complete" was "feature has test evidence in the PR".',
      'Shipped the "undo last scan" feature end-to-end across the boundary — frontend toast state machine, Zustand store rollback, ScanDebouncer on the hardware integration side, event-log index capture for which scan to undo. Took several review rounds to land cleanly.',
      'Carried the team’s review cadence: every PR I opened and most of the team\'s frontend PRs went through my review before merge.',
    ],
    contributionStats: [
      { value: 'Full semester', label: 'Sustained team workflow' },
      { value: 'PR → review → merge', label: 'Every feature' },
      { value: 'End-to-end test', label: 'Controller integration' },
      { value: 'Multi-platform', label: 'CI release workflow' },
    ],
    chapters: [
      {
        era: 'Sprint 01',
        heading: 'Brief & team formation',
        body:
          "CSE 4504 handed the team a one-line brief — build an interval-training timing platform that exercises every part of the production engineering loop. The team spent the first sprint agreeing on stack, scope, and ownership: frontend, infrastructure, persistence, deployment. Clean Architecture was the agreed backbone on the Python side — domain / application / infrastructure / controller. The owner took frontend lead (Chengze Wu — also the maintainer of main & integration and the controller-layer integration test, per the README work-assignment table).",
        contribution: false,
      },
      {
        era: 'Sprint 02',
        heading: 'Repo, CI, and the engineering contract',
        body:
          "Set up the repo, CI, and the team\'s engineering contract: every feature starts as an issue, becomes a pull request, and is reviewed by at least one other teammate before merge. Function-level decoupling was enforced from day one so each piece could be tested and replaced independently. The contract we wrote on the wall was simple — 'every feature has test evidence in the PR' — and the team held to it for the whole semester. The postinstall hook even bootstraps a Python venv and installs FastAPI / Pydantic / uvicorn / Resend automatically, so a fresh checkout gets a working backend with one `pnpm install`.",
        contribution: true,
      },
      {
        era: 'Sprint 03',
        heading: 'Frontend foundation — Next.js, Zustand, component contracts',
        body:
          "Owned the frontend layer: Next.js 15 + React 19 + Tailwind v4 app shell, the Zustand store as the single source of truth for workout state (active workout, runner states, scan history, undo stack), SWR for backend sync, and lucide-react for icons. The component contracts were the most important part — they let the rest of the team build against stable frontend APIs without waiting for UI to be finished. The frontend also drives two pages: the coach console and an external display screen (a separate /display route) that the team could mirror onto a projector during practice.",
        contribution: true,
      },
      {
        era: 'Sprint 04',
        heading: 'Undo last scan — end-to-end across the boundary',
        body:
          "Mid-semester, the team hit a real product pain: a coach mis-scans an RFID tag and now the runner\'s lap count is wrong and there\'s no way to undo it. We shipped the fix end-to-end. Frontend side: a toast state machine (success / failure, with `ok: false` from the backend surfaced as a clear failure toast — that detail was its own review-rounds PR). Zustand store rolled back the runner\'s laps and the last scan\'s event-log index. Hardware integration side: a ScanDebouncer in the RFID reader loop so duplicate events from the same physical tap don't double-count. Backend side: the workout use case grew a real undo endpoint that re-derives runner state from the event log instead of trusting the fronted\'s view of the world. The interesting design problem was modeling which scan to undo when several happened in the same second — we ended up capturing the event-log index at scan time and using that as the undo key. Took three PR rounds to land cleanly. That PR cluster is one of the better illustrations of how a real product bug moves through every layer of the architecture.",
        contribution: true,
      },
      {
        era: 'Sprint 05',
        heading: 'Per-feature test coverage',
        body:
          "Wrote the frontend test suite alongside each feature, not after. Every component shipped with unit tests, paired with teammate-owned controller-layer integration tests that drive the full stack from CSV roster load → group start → simulated RFID/NFC events → workout completion report. The owner\'s main & integration contribution was a controller-layer integration test that simulates a Feature 1 flow end-to-end without manual input — that test became the team\'s smoke gate for every PR that touched the persistence or use-cases layer.",
        contribution: true,
      },
      {
        era: 'Final sprint',
        heading: 'Packaging the desktop app — PyInstaller + Electron + multi-platform CI',
        body:
          "This was the part the team got stuck on the most, and the part that taught the most. We packaged the Python backend with PyInstaller into a single folder distribution (--onedir --name api-server), wired Electron to launch it as a child process, and shipped a GitHub Actions multi-platform desktop release workflow that builds for macOS / Windows / Linux from the same pipeline. There were real review-rounds fights here: making sure the .env got bundled, removing duplicate test helpers, hardening error responses, adding --add-data for the seed CSV, pinning serve in devDependencies. The prebuild:api step that creates a placeholder .env if missing was added specifically so a fresh checkout wouldn't crash on a missing secrets file. We burned more time on this final sprint than on any other, and it was the closest the semester got to a real shipping problem.",
        contribution: false,
      },
      {
        era: 'Outcome',
        heading: 'What this project actually proves',
        body:
          "The point of the project was never the athlete tracker itself — it was to exercise the entire production engineering loop under deadline. Issues → PRs → code review → per-feature tests → mid-semester bug that touches every architectural layer → packaging → CI release. Every chapter above maps onto that loop. The owner ended up shipping the frontend lead role, the controller-layer integration test, the undo-last-scan end-to-end feature, and a fair amount of the Electron packaging work. The repo carries the full record.",
        contribution: false,
      },
    ],
  },
  {
    // Solo side-project. Everything below is one person building
    // something because they wanted to see what it felt like.
    id: 'fallback-mono-echo-chamber',
    slug: 'echo-chamber-cyberbullying-simulator',
    title: 'EchoChamber — Cyber-bullying Simulator',
    tagline:
      'A small browser toy I made because the internet finally felt too loud to ignore. Post a sentence and six AI personalities pile on',
    description:
      "A solo Next.js side-project — about ~8.9k lines of custom code, 6 AI personality archetypes, 28 achievements, and 4 hand-written story scenarios. You post a sentence in the box and six different toxic archetypes reply in real time, weighted toward the negative. A sentiment meter drifts your reputation; pulling toward negative unlocks achievement branches, recovery unlocks a different set. The whole thing is bilingual (zh/en) and works offline when the upstream API is rate-limited. Free to play, no accounts, no tracking.",
    category: 'web',
    tier: 'major',
    status: 'shipped',
    tech: [
      'Next.js 16',
      'React 19',
      'TypeScript',
      'Tailwind v4',
      'Framer Motion',
      'Radix UI primitives',
      'shadcn/ui',
      'OpenAI-compatible LLM API',
      'Web Audio API (sound effects)',
      'localStorage persistence',
      'Vercel deployment',
    ],
    highlights: [
      'Six AI personalities, weighted system prompts, per-personality prompt engineering',
      'Local mock-ai fallback keeps the demo fully playable offline / when the API rate-limits',
      'Sentiment-meter drives a 28-achievement branch tree (flamed arc vs recovered arc)',
      'Four hand-authored story-mode scenarios with bilingual initial posts',
      '143-key bilingual i18n table, hand-translated end to end',
    ],
    link: 'https://echo-chamber-simulator.vercel.app',
    repo: 'https://github.com/EthanWu2019/SemiProject-EchoChamberSimulator',
    coverImage: '/echochamber-cover.png',
    featured: true,
    sortOrder: 3,
    year: 2026,
    sidebarLabel: 'What I leveled up here',
    contributions: [
      'LLM prompt engineering for stable persona over a long conversation — system-prompt weighting (35% hater / 15% stan / 20% logic-lord / 20% moral-knight / 10% spam-bot) baked into the prompt itself, not the routing code.',
      'Defensive parsing of model output: stripping <think>...</think> reasoning blocks, scanning for the first JSON array vs object, unwrapping json_object mode wrapping, and recovering from character-keyed objects (`{0:"l", 1:"m", ...}`).',
      'The single sharpest JavaScript gotcha I hit this year: `{...someString}` spreads a string into `{0:"a", 1:"b", ...}`. Coercing each parsed item to a real object before spreading fixed three broken deploys in a row.',
      'localStorage-backed client state with a single custom hook serializing the whole session (posts, comments, DMs, achievements, blocked users, language) and enforcing cross-slice invariants at the hook layer, not the data layer.',
      'Web Audio API sound effects generated entirely in code — no audio files shipped, just oscillators + gain envelopes wired to per-event triggers with a 1.2s cooldown to keep the framer-motion budget clean.',
      'Full bilingual i18n with 143 hand-translated keys × 2 languages and an intentional handful of culture-bound strings that are written separately per language, not translated.',
    ],
    chapters: [
      {
        era: 'How it started',
        heading: 'Years of the internet, condensed into one box',
        body:
          "I've been on the internet too long. Group chats, comment sections, DMs from strangers, the whole parade — by now I have a pretty good mental catalogue of every flavor of 'yeah whatever, here is my unsolicited opinion about your post'. I didn't build this project to study toxicity or to write a paper about it. I built it because one day it occurred to me that all of that lived only in my head and other people's heads, and it might be useful to have a tangible toy that lets you poke at it on purpose. Like, you can actually sit down and watch a number drift down as strangers pile on, and feel the thing that real people feel on bad days, and then close the tab. That was the whole spark. I started building on a Saturday with no plan, mostly to see if a model could commit to a personality long enough for it to feel like a person and not a slot machine. By Sunday night I had something close to the thing in my head, and I was in too deep to stop.",
        contribution: false,
      },
      {
        era: 'Architecture · 01',
        heading: 'I went client-only on purpose, and that was expensive',
        body:
          "I made the call early to keep everything in the browser. No backend database, no server session, no auth — just a single React app talking to two API routes and persisting the whole world in localStorage under one key. The honest reason is I didn't want to run a database for a toy, and I liked the idea that the app behaves like something privacy-respecting: you close the tab, nothing about you exists anywhere. The cost turned out to be bigger than I expected. I ended up writing a custom React hook that serializes the entire session — posts, comments, DMs, achievements, blocked users, language preference — on every relevant state change, and I had to think really carefully about cross-slice invariants (like: if you block a user, does their DM history get cleared, and does the sentiment-meter retroactively forget them?). 'Simple persistence' sounds like a small problem until your state tree has 8+ slices that all reference each other. I shipped that hook on the third try and it's the part of the codebase I trust the least — which is maybe the highest compliment I can give it.",
        contribution: false,
      },
      {
        era: 'Architecture · 02',
        heading: 'The LLM call — system prompt, weights, and why I baked the weights into the prompt',
        body:
          "Every reply goes through one of two routes — /api/generate-comments (post-level replies) or /api/generate-topics (trending + topic posts). Both take a personality-weighted system prompt, a temperature around 1.0 to 1.1, the conversation context, and ask for strict JSON back. The personality weights — 35% hater / 15% stan / 20% logic-lord / 20% moral-knight / 10% spam-bot — live in the system prompt as explicit percentage guidance, not in the routing code. I tried it both ways and the prompt-baked version wins for one reason: a single config tweak changes the whole vibe of the demo, and that makes it easy to A/B the feel without redeploying anything. The downside is that the model occasionally ignores the weights and you get a weirdly wholesome comment section, but for a toy that's fine. When the upstream API is down or rate-limited, a local mock-ai library picks up the same JSON shape from a static personality-tagged pool, so the demo never breaks — that fallback path was the single highest-leverage thing I shipped, because 'broken demo' kills vibe faster than anything else.",
        contribution: false,
      },
      {
        era: 'Sentiment & Achievements',
        heading: '28 achievements, two arcs, one number',
        body:
          "The sentiment meter is a single number that drifts per reply based on per-personality impact (hater: -3 to -8, stan: +3 to +8, spam-bot: -1, etc.) and decays slowly over time. Crossing thresholds unlocks achievements and triggers event cascades — DM harassment when sentiment collapses, recovery arcs when sentiment recovers. I wrote all 28 achievements by hand: thresholds, unlock conditions, icons, and the dichotomy between a 'flamed' arc (negative drift) and a 'recovered' arc (positive drift after a collapse). The interesting design problem was modeling the *branches*. Not just 'achievement X unlocks at sentiment Y', but 'achievement X unlocks at sentiment Y AND you've posted at least 3 times AND no achievement from the recovered arc has fired'. Several achievements are mutually exclusive; that constraint is enforced in the unlock hook, not in the data, so when I want to add a new achievement I don't have to think about edge cases at the data layer. That's the kind of small architectural choice I used to skip and then regret two months later.",
        contribution: false,
      },
      {
        era: 'Story Mode',
        heading: 'Four scenarios I wrote because I wanted to see how each archetype would behave',
        body:
          "Story mode is the guided-tour version of the free-play sandbox: pick a difficulty, read a hand-written initial post, try to survive the replies. Four scenarios — Celebrity Scandal (hard), Product Fail (medium), Viral Moment (easy), Taking Sides (hard) — each with a bilingual initial post and per-scenario difficulty metadata. The data lives in lib/types.ts as STORY_SCENARIOS and feeds two components, the picker panel and the immersive player view. Honestly the scenarios were the hardest part to write. I could make the model play a hater all day, but writing an initial post that actually provokes a moral-knight into landing a real critique (instead of generic virtue-signaling) took a lot of drafts. The easy mode (Viral Moment) is a cat photo that goes viral — even that's interesting because the spam-bots show up disproportionately when something goes viral, which is the kind of pattern you don't see unless you build it.",
        contribution: false,
      },
      {
        era: 'i18n',
        heading: '143 keys, two languages, all translated by hand',
        body:
          "Every visible string — button labels, idle-overlay hints, sentiment-widget copy, story-mode descriptions, achievement unlock text — lives in lib/i18n.ts as a 143-key translation table with both zh and en. I translated both sides by hand because machine translation would lose the casual tone that makes the toxic replies feel real. A stan who says '啊啊啊宝子你太棒了！！！' in zh should not become 'AHHHH BABY YOU ARE SO AMAZING!!!' in en — the energy is different, and translating it word-for-word strips the energy out. The bigger lesson was that some copy is genuinely culture-bound. A handful of keys have intentionally different copy per language, not a translation. When you go full bilingual, you stop thinking of translation as a one-way map and start thinking of it as two separate writing tasks, which is the only honest way to do it.",
        contribution: false,
      },
      {
        era: 'Edges',
        heading: 'The bugs that taught me the most',
        body:
          "The most interesting problems were all edges. The screen-shake animation has to debounce — fire it on every harsh comment and it ruins the framer-motion animation budget, so I added a 1.2s cooldown in the hook. The idle-overlay only shows after the tab has been hidden for 30+ seconds AND the user has at least one post (otherwise an empty-account user sees it the first time they switch tabs, which is annoying). The DM harassment event fires only when sentiment is below a threshold AND the user has posted at least twice AND they haven't blocked the harasser. The sentiment meter clamps to [-100, +100] so a flood of one-sided replies can't break the UI. And the LLM-output parser was the longest fix of the whole project — three deploys in a row where the model wrapped arrays differently each time, and then the JavaScript gotcha where `{...string}` spreads a string into a character-indexed object, so a perfectly valid 'lmao deleted? coward' reply turned into `{0: 'l', 1: 'm', ...}` on the client. I shipped three broken deploys before I understood all three failure modes at once. That's the bug I remember the most, because every fix I tried individually was correct and they only worked together.",
        contribution: false,
      },
      {
        era: 'Where it lives',
        heading: "It's live, free, and I still play with it",
        body:
          "The whole thing is deployed on Vercel, the repo is public on GitHub, and there's no auth, no tracking, no backend. The hosted version runs the same upstream LLM endpoint as local dev, with the same mock-ai fallback path. I still occasionally open it on my phone and post something to see how the archetypes react — partly to test new prompt tweaks, partly because it's a weirdly useful way to decompress after a frustrating day on the internet. If you want to see it, the live URL is below; if you want to read or fork the code, the GitHub link is right under it.",
        contribution: false,
        links: [
          {
            label: 'Live · echo-chamber-simulator.vercel.app',
            href: 'https://echo-chamber-simulator.vercel.app',
          },
          {
            label: 'Source · github.com/EthanWu2019/SemiProject-EchoChamberSimulator',
            href: 'https://github.com/EthanWu2019/SemiProject-EchoChamberSimulator',
          },
        ],
      },
    ],
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
    // Personal expense tracker. The story: owner wanted something
    // less tedious than existing finance apps (every entry needed
    // category + project name + amount) and did not trust a single
    // bank-aggregator like Rocket Money to read all accounts (multiple
    // banks, USD + RMB). So owner built a local-first pipeline where
    // Hermes (the AI agent) is the input mechanism, Notion is the
    // structured store, and GitHub Pages is the public visualization.
    id: 'fallback-major-money',
    slug: 'where-my-money-go',
    title: 'Where My Money Go',
    tagline:
      'A personal finance pipeline: tell the AI agent "I spent $40 on lunch" and it lands in Notion by morning — built because every other expense app I tried asked for too much',
    description:
      "A personal expense tracker built around three opinions: (1) input friction is the killer — the entry point is just talking to the AI agent in natural language, no category picker, no project-name field, no amount field to fill; (2) local-first means the AI agent writes to a JSON queue on the Mac mini, and only the daily cron syncs it onward, so any entry point (WebUI, QQ bot, future CLI) shares one source of truth; (3) the dashboard is a static GitHub Page so it costs nothing to host and the data is a single all.json file you can fork. The result is a pipeline with three layers: a Hermes skill that writes pending.json, a 23:00 cron that pushes the queue into Notion, and a 23:10 cron that renders the public dashboard.",
    category: 'web',
    tier: 'major',
    status: 'shipped',
    tech: [
      'Vanilla JavaScript',
      'Chart.js',
      'Notion API (data source query, page creation)',
      'Cron (5 jobs: sync, render, monthly charges x 3, backup)',
      'GitHub Pages (static hosting)',
      'open.er-api.com (live FX rate)',
      'CSS (5 hand-rolled themes: Violet / Sharp / Minimal / Neon / Sunset)',
      'Hermes skill (Python, the entry point)',
    ],
    highlights: [
      'Input mechanism is "tell the AI" — natural-language expense entry, no forms, no dropdowns',
      'Three-stage pipeline: pending.json → Notion → GitHub Pages static dashboard',
      'Local-first: pending.json is the single source of truth; multi-entry-point safe (WebUI / QQ bot / future CLI)',
      '5-month dashboard with currency switch (USD/RMB), weekly/monthly reports, 5 visual themes',
      'Auto-recurring monthly charges via separate cron jobs (iCloud / Apple Care / split phone bill)',
    ],
    link: 'https://ethanwu2019.github.io/where-my-money-go/',
    repo: 'https://github.com/EthanWu2019/where-my-money-go',
    coverImage:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1600&q=80&auto=format&fit=crop',
    featured: false,
    sortOrder: 11,
    year: 2026,
    sidebarLabel: 'What this taught me',
    contributions: [
      'Designed the pipeline shape: input layer (Hermes) → queue layer (pending.json) → structured store (Notion) → public render (GitHub Pages). Each layer has one job and one failure mode.',
      'Wrote the Notion data_source schema (12 categories across 收入/支出, currency select, date index) and the sync.py that throttles at 2 req/s and uses Notion-Version 2025-09-03.',
      'Built the GitHub Pages dashboard in vanilla JS: Chart.js pie chart for spend distribution, currency switch with live FX rate (open.er-api.com), weekly/monthly reports with prev/next navigation, click-to-filter transaction list.',
      'Designed 5 hand-rolled CSS themes (Violet / Sharp / Minimal / Neon / Sunset) — same component, no framework, just CSS custom properties.',
      'Set up the recurring-charge subsystem: 3 cron jobs (iCloud on the 3rd, Apple Care on the 10th, split phone bill on the 14th) each running a Python script that writes to the same pending.json pipeline.',
    ],
    contributionStats: [
      { value: '1 line', label: 'To log an expense' },
      { value: '5 cron jobs', label: 'Keeping it alive' },
      { value: '12 categories', label: 'Notion schema' },
      { value: '5 themes', label: 'Hand-rolled CSS' },
    ],
    chapters: [
      {
        era: 'Why I built this',
        heading: 'Every other expense app asked for too much',
        body:
          "I have used a handful of personal finance apps over the years and they all share the same problem: every single entry is a form. You open the app, you pick a date (it autofills to today, but only after you tap), you pick or type a category (which is the wrong list, because what you actually spent on is rarely what their dropdown says), you type a project name (which you will never search for again), you type an amount (the worst part — you have to context-switch from 'I just bought coffee' to 'is this 4.50 or 4.55?'), you hit save. By the third entry of the day you have stopped. Rocket Money solved the data-input half by reading bank transactions directly. But I have two bank accounts, a Chinese RMB account, USD on a debit card, and recurring charges that sometimes come out of one and sometimes the other. Linking them all to a US-focused aggregator did not feel right either — that is one platform seeing my entire financial life, and I did not want one more of those.",
        contribution: false,
      },
      {
        era: 'The input mechanism',
        heading: 'I built a Hermes skill so I can just say it',
        body:
          "The insight was that I was already talking to an AI agent all day. If the entry point could be 'tell the AI you spent money', the form disappears. So I built an expense-tracker skill for Hermes. The workflow: I say 'I just spent $40 on lunch' in any session — WebUI, QQ bot, anywhere — and the skill appends a JSON entry to a queue file (pending.json) on the Mac mini. No form, no dropdown, no amount field with two decimals of precision. The skill uses simple keyword rules to infer category and currency ('$ → USD', '块 → RMB', '原神/Steam/月卡 → 游戏', 'AI/Token/ChatGPT → AI'), and if it is ambiguous it just asks one clarifying question instead of five. The queue file is the single source of truth: any entry point writes to the same file, and the only process that ever reads it is the nightly cron. This pattern (multi-entry-point write, single-source-of-truth file, time-delayed sync) was the most useful thing I have ever built. It is how every personal-tool I now build works.",
        contribution: false,
      },
      {
        era: 'The pipeline · stage 1',
        heading: 'pending.json — the local queue',
        body:
          'pending.json is literally an array of objects, one per expense: `{项目, 金额, 币种, 类型, 分类, 日期, 备注}`. Chinese field names because they are for me, not for an API. Every entry point (WebUI / QQ / future CLI) follows the same four steps: read the file, parse the JSON, append, write the whole array back. The reason it has to be read-then-write rather than append is that the queue gets cleared by the nightly cron after sync, and any naive write-append would silently drop entries. The Hermes skill enforces this read-then-write order with a hard rule: never call write_file without first reading. The first time I tried to be clever and skip the read step I overwrote the entire queue and lost a day of entries. Lesson burned in: local-first systems make the read-write race the dominant failure mode, and the only fix is discipline, not better tools.',
        contribution: false,
      },
      {
        era: 'The pipeline · stage 2',
        heading: '23:00 cron → Notion',
        body:
          "A single cron job at 23:00 CDT does: read pending.json → POST each entry to the Notion 账目明细 database → on success, remove from pending.json. The Notion data source ID is hardcoded in the script. Throttling is 2 requests per second so we don't hit the Notion rate limit even when the queue has 20+ entries (rare but happens after vacation). After this runs, pending.json is empty, and every entry now exists in Notion where I can query it, sort it, filter by date or category, and export it. The reason I split sync from render into two separate cron jobs is so a slow Notion call does not block the public dashboard from updating. If Notion is down for an hour, the render job still runs on yesterday's data; if the render job fails, sync still succeeded and I can run render manually when Notion is back. Two-stage pipelines are easier to debug than one big pipeline that fails halfway.",
        contribution: false,
      },
      {
        era: 'The pipeline · stage 3',
        heading: '23:10 cron → GitHub Pages render',
        body:
          'A second cron job runs at 23:10, ten minutes after the sync. It pulls all entries from Notion via the data_sources/query API, paginates through them, and writes a single data/all.json file. Then it commits and pushes to the where-my-money-go GitHub repo, and GitHub Pages automatically serves the updated dashboard. The dashboard itself is vanilla JS + Chart.js — no framework, no build step, just an index.html, a script.js, and a styles.css. Five CSS themes are hand-rolled (Violet / Sharp / Minimal / Neon / Sunset) using CSS custom properties, and a single Chart.js pie chart shows spend distribution. The page reads the open.er-api.com live FX rate to convert USD↔RMB on the fly. I am not precious about exposing this publicly — if you can read my spend pattern, that is fine, that is actually the point. Static-hosting the dashboard costs $0/year and the data file is one all.json you can fork.',
        contribution: false,
      },
      {
        era: 'Recurring charges',
        heading: 'Three separate cron jobs for monthly auto-charges',
        body:
          "Some expenses are recurring and I don't want to manually type 'iCloud $9.99' every month. So there is a small Python script (recurring.py) that takes a date-keyed dict: `{3: [('iCloud 订阅', 9.99, 'USD', '月扣')], 10: [...], 14: [...]}`. Three separate cron jobs fire on the 3rd, 10th, and 14th of each month at 09:00 CDT, each runs recurring.py, each only writes the charges that match today's date. The split-phone-bill entry has a 备注 explaining the calculation ('3 people share $100, my share is $33.33') because six months later I will not remember why that exact amount exists. I made this its own cron subsystem rather than a single big cron because I wanted each recurring to be independently auditable and reschedulable — when I added a fourth recurring, it was one new cron, one new line in the dict, no other changes.",
        contribution: false,
      },
      {
        era: 'Bugs and recovery',
        heading: 'The two incidents that taught me everything',
        body:
          "Two incidents shaped this project more than any planned feature. First: I once ran sync.py manually to 'force a quick sync' without checking whether the cron had already synced. Result: 5 duplicate entries in Notion. The fix was to write a Notion API deduplication script that groups by (项目, 金额, 币种, 日期), keeps the earliest created_time, archives the rest. Now I never run sync.py by hand — if the queue is empty, I trust the cron ran. Second: an off-platform integration once called sync.py directly and POSTed to Notion, then deleted the entry from pending.json. Result: I genuinely thought the data was lost and almost re-entered it. It was not lost — it was in Notion. The lesson burned in twice over: any time pending.json is empty, query Notion first, never assume the data is gone. These two incidents turned the skill into something that has explicit pitfall warnings at the top. The warnings are longer than the actual implementation — and that is intentional.",
        contribution: false,
      },
      {
        era: 'What I learned',
        heading: 'Three things I will carry to the next personal tool',
        body:
          '1. **Local-first pipelines beat cloud-first pipelines for personal tools.** Single source of truth file + time-delayed sync is the most resilient architecture I have found for things that only I use. Multi-entry-point, offline-capable, debuggable by reading one JSON file. 2. **The hardest part of a personal tool is not the technology — it is the input discipline.** Every time I want to log an expense, the cost of opening a form vs. saying one sentence determines whether I actually log it. The skill gets 90% of the friction out of the way. 3. **Two-stage pipelines are easier to reason about than one big pipeline.** Sync and render being separate crons means a Notion outage does not take the dashboard down, and a render bug does not block writes. Each stage has one job and one failure mode. If I build another personal tool that has any async data flow, it will have this same three-layer shape.',
        contribution: false,
      },
    ],
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
