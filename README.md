# Ethan Wu

Personal site built on Next.js, PostgreSQL (Neon), Prisma, and a custom
document.startViewTransition theming animation. Live at
[ethanwu.work](https://ethanwu.work). The legacy `mimo-code-blog.vercel.app`
URL 308-redirects here via `next.config.ts`.

## What's here

- `/` — Editorial home page with hero, featured projects, blog teasers.
- `/project` — Portfolio: "Major projects" (recruiter-focused) + "Vibe coding" (side experiments).
- `/blog` and `/posts/<slug>` — Long-form writing (markdown).
- `/gallery` — AI image gallery.
- `/photography` — Photo archive.
- `/resume` — Live-compiled LaTeX résumé (PDF download).
- `/login`, `/register` — Sign-in (email/password + Google/GitHub OAuth).
- `/profile` — Account settings (auth required).

## Tech Stack

- **Frontend**: React, Next.js 16, Tailwind CSS, Framer Motion, GSAP.
- **Backend**: Next.js API Routes.
- **Database**: PostgreSQL via Prisma (Neon in production; local docker-compose for dev).
- **Auth**: next-auth v5 + Prisma Adapter (Credentials + Google + GitHub providers).
- **Resume compiler**: LaTeXOnline (`https://latex.ytotech.com/builds/sync`) — no
  TeX Live install required. Source lives in `data/resume/source.tex`, fall-back
  seed in `data/resume/seed.tex` (Jake's Resume ATS template pre-filled for Ethan).

## Quick Start

```
npm install
docker compose up -d
npx prisma migrate dev
npm run dev
```

Or use the bundled Windows scripts (`start.bat`, `start-win.bat`, `start-all.bat`).

## Environment

Copy `.env.example` (see OAuth setup below) into `.env` and fill in:

```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (optional, but recommended)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

### OAuth app setup

| Provider | Console | Authorized redirect URI |
|---|---|---|
| Google | https://console.cloud.google.com/apis/credentials | `https://ethanwu.work/api/auth/callback/google` |
| GitHub  | https://github.com/settings/developers | `https://ethanwu.work/api/auth/callback/github` |

When developing locally use `http://localhost:3000/api/auth/callback/{provider}`
instead, and set `NEXTAUTH_URL=http://localhost:3000`.

### Admin gating

Admin is auto-promoted by email. Whoever signs in with these emails becomes
`role=admin` in the database on first login (configured in `src/lib/auth.ts`):

```
ADMIN_EMAILS = new Set([
  "ethanwucz2019@gmail.com",
  "3401895383@qq.com",
]);
```

Admin-only surfaces: `/resume/edit`, `/api/resume/source PUT`.

## Resume pipeline

- Edit: visit `/resume/edit` while signed in as admin. Use the Save & Preview
  button to write the .tex source to `data/resume/source.tex`.
- Download: `/api/resume/pdf` POSTs the latest source to LaTeXOnline and
  streams the PDF back with `Content-Disposition: attachment; filename="Ethan_Wu_Resume.pdf"`.
- Cache: compiled PDFs are memoized in-process for 60s.
- Storage caveat: Vercel serverless filesystem is read-only at runtime —
  edits via the UI persist only on local dev. For production editing,
  swap `data/resume/source.tex` storage for Neon/Postgres later.

## Production environment

This site runs on Vercel. Domain `ethanwu.work` is registered at Tencent Cloud
(DNSPod), apex via A record `76.76.21.21`, www via CNAME `cname.vercel-dns.com`.
HTTPS terminates at Vercel with Let's Encrypt; `mimo-code-blog.vercel.app` 308-redirects
to apex via `next.config.ts`. Required env on Vercel production: `DATABASE_URL`,
`NEXTAUTH_SECRET`, `NEXTAUTH_URL=https://ethanwu.work`, optional OAuth client IDs/secrets.


<!-- cache-invalidation: bump sha -->
