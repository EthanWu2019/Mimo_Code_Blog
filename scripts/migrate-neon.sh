#!/usr/bin/env bash
# Migrate the Prisma schema to the connected database (Neon in prod).
#
# Usage:
#   1. Make sure DATABASE_URL is in your environment (Vercel env var
#      locally, or `vercel env pull .env.local` if you want to reuse
#      Vercel's DATABASE_URL on your dev machine).
#   2. bash scripts/migrate-neon.sh
#
# This is intentionally one file / one line so the owner can paste it
# into a chat and run it without thinking. It does:
#   1. prisma generate  (regenerate client from schema.prisma)
#   2. prisma migrate deploy  (apply pending migrations to the DB)
#
# Why not `prisma migrate dev`?  `migrate dev` is interactive and wants
# to create a new migration file. We're applying existing schemas to
# production-like DBs, so `deploy` is correct.

set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is empty. Source it from .env.local first, e.g.:"
  echo "  export \$(grep -E '^DATABASE_URL=' .env.local | xargs)"
  echo "or pull from Vercel:"
  echo "  vercel env pull .env.local"
  exit 1
fi

cd "$(dirname "$0")/.."
echo "→ prisma generate"
npx prisma generate
echo "→ prisma migrate deploy"
npx prisma migrate deploy
echo "✓ done"
