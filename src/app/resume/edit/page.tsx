// Server shell for /resume/edit — gates the page on the server so a
// non-admin never sees the source editor at all. We hand the source + a
// boolean `isAdmin` down to the client component to keep the rest of
// the page interactive.
//
// Source priority (must match /api/resume/source so the editor's initial
// value lines up with what /api/resume/pdf renders):
//   1. LatexSource DB row (authoritative on Vercel production)
//   2. /tmp/source.tex           (warm-only; wiped on cold start)
//   3. data/resume/source.tex    (committed; pre-DB writes)
//   4. data/resume/seed.tex      (the original committed seed)
//   5. The minimal stub (last-resort, only if every layer is unreachable)
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import fs from "node:fs/promises";
import path from "node:path";
import prisma from "@/lib/prisma";
import ResumeEditClient from "./ResumeEditClient";

const SOURCE_PATH = path.join(process.cwd(), "data", "resume", "source.tex");
const SEED_PATH = path.join(process.cwd(), "data", "resume", "seed.tex");

async function readSource(): Promise<string> {
  // 1) DB
  try {
    const row = await prisma.latexSource.findUnique({ where: { id: "resume" } });
    if (row?.tex && row.tex.trim().length > 0) return row.tex;
  } catch (e) {
    console.warn("[/resume/edit] LatexSource read failed", e);
  }
  // 2) /tmp
  try {
    return await fs.readFile("/tmp/source.tex", "utf8");
  } catch (e: any) {
    if (e.code !== "ENOENT") {
      console.warn("[/resume/edit] /tmp/source.tex read failed", e.code, e.message);
    }
  }
  // 3) data/
  try {
    return await fs.readFile(SOURCE_PATH, "utf8");
  } catch (e: any) {
    if (e.code !== "ENOENT") throw e;
    // 4) seed
    try {
      const seed = await fs.readFile(SEED_PATH, "utf8");
      await fs.mkdir(path.dirname(SOURCE_PATH), { recursive: true });
      await fs.writeFile(SOURCE_PATH, seed).catch(() => {});
      return seed;
    } catch {
      // 5) stub
      return "\\documentclass{article}\\begin{document}\\end{document}";
    }
  }
}

export default async function ResumeEditPage() {
  const session = await auth();
  const isAdmin = (session?.user as any)?.role === "admin";
  if (!session?.user) {
    redirect("/login?callbackUrl=/resume/edit");
  }
  if (!isAdmin) {
    // Signed in but not admin. Don't leak the editor — bounce to view.
    redirect("/resume");
  }
  const initialSource = await readSource();
  return <ResumeEditClient initialSource={initialSource} isAdmin={isAdmin} />;
}
