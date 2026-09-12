// =============================================================
// /api/resume/source
//
// GET: any visitor can read the current .tex source.
//   - Priority: LatexSource DB row > /tmp source.tex >
//     data/resume/source.tex > data/resume/seed.tex.
//   - Returns text/plain so it can be loaded into the editor textarea.
//
// PUT: admin only — replace source. Persists to LatexSource (Postgres).
//   - Body: { tex: string }
//
// Why DB storage: Vercel Hobby tier has read-only filesystem except
// /tmp. /tmp is wiped on cold start, so filesystem-backed persistence
// loses every edit on the next deploy / Lambda cold start. The
// LatexSource row in Postgres is durable.
//
// The legacy /tmp and data/resume/source.tex writes remain as a
// fallback for local dev so the editor still works without a DB.
// =============================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import fs from "node:fs/promises";
import path from "node:path";

const SOURCE_PATH = path.join(process.cwd(), "data", "resume", "source.tex");
const SEED_PATH = path.join(process.cwd(), "data", "resume", "seed.tex");

async function readFromDb(): Promise<string | null> {
  try {
    const row = await prisma.latexSource.findUnique({ where: { id: "resume" } });
    return row?.tex ?? null;
  } catch (e) {
    console.warn("[/api/resume/source] LatexSource read failed", e);
    return null;
  }
}

async function readFromDisk(): Promise<string> {
  // Same Vercel-fallback strategy as before:
  //   /tmp/source.tex  >  data/resume/source.tex  >  data/resume/seed.tex
  try {
    return await fs.readFile("/tmp/source.tex", "utf8");
  } catch (e: any) {
    if (e.code !== "ENOENT") {
      console.warn("[/tmp/source.tex read failed]", e.code, e.message);
    }
  }
  try {
    return await fs.readFile(SOURCE_PATH, "utf8");
  } catch (e: any) {
    if (e.code === "ENOENT") {
      try {
        return await fs.readFile(SEED_PATH, "utf8");
      } catch {
        return "\\documentclass{article}\\begin{document}\\end{document}";
      }
    }
    throw e;
  }
}

async function ensureSourceFile(): Promise<string> {
  // 1) DB (authoritative on Vercel production)
  const fromDb = await readFromDb();
  if (fromDb && fromDb.trim().length > 0) return fromDb;
  // 2) Disk (authoritative on local dev, or first-boot before any save)
  return readFromDisk();
}

export async function GET() {
  const tex = await ensureSourceFile();
  return new NextResponse(tex, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { tex?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const tex = body.tex;
  if (typeof tex !== "string" || !tex.trim()) {
    return NextResponse.json({ error: "tex must be non-empty string" }, { status: 400 });
  }
  if (!tex.includes("\\documentclass") || !tex.includes("\\begin{document}")) {
    return NextResponse.json(
      { error: "Source must include \\documentclass and \\begin{document} — otherwise this is not a valid LaTeX file." },
      { status: 400 }
    );
  }

  // 1) Durable: write to Postgres LatexSource.
  const userId = (session.user as any).id as string | undefined;
  try {
    await prisma.latexSource.upsert({
      where: { id: "resume" },
      create: { id: "resume", tex, updatedBy: userId ?? null },
      update: { tex, updatedBy: userId ?? null },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Failed to persist source to database", detail: e?.message ?? String(e) },
      { status: 500 }
    );
  }

  // 2) Disk fallback for local dev (no DB). Best-effort on Vercel.
  await fs.mkdir("/tmp", { recursive: true }).catch(() => {});
  await fs.writeFile("/tmp/source.tex", tex).catch(() => {});
  await fs.mkdir(path.dirname(SOURCE_PATH), { recursive: true }).catch(() => {});
  await fs.writeFile(SOURCE_PATH, tex).catch(() => {});

  return NextResponse.json({ ok: true, bytes: tex.length });
}
