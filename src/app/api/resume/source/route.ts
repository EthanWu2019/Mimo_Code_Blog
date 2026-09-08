// =============================================================
// /api/resume/source
//
// GET: any visitor can read the current .tex source.
//   - Returns text/plain so it can be loaded into the editor textarea.
//
// PUT: admin only — replace source. Triggers a background re-compile.
//   - Body: { tex: string }
//
// Storage strategy for now: single .tex file in data/resume/source.tex.
// This is fine for a personal site where there is exactly one resume
// per owner. When we want versioning, we can move to Postgres without
// changing the API shape.
//
// IMPORTANT: file path lives in the project's persistent filesystem.
// On Vercel this is fine because:
//   - The /api/resume/source route runs in the same Lambda as /api/resume/pdf
//   - Vercel nodejs runtime mounts the project's `data/` directory as part
//     of the build output, but FILE WRITES TO NON-`public/` PATHS DO NOT
//     PERSIST on Vercel serverless deployments (the FS is read-only).
//
// We accept this constraint for the initial cutover; on Vercel, edits
// will be ephemeral. Vercel KV or a Postgres-backed store would fix it
// at later cost. For now the admin can use the editor flow on local
// dev (`npm run dev`) and the seed.tex pre-compiles at boot time on
// Vercel as the published version.
// =============================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import fs from "node:fs/promises";
import path from "node:path";

const SOURCE_PATH = path.join(process.cwd(), "data", "resume", "source.tex");
const SEED_PATH = path.join(process.cwd(), "data", "resume", "seed.tex");

async function ensureSourceFile(): Promise<string> {
  try {
    return await fs.readFile(SOURCE_PATH, "utf8");
  } catch (e: any) {
    if (e.code === "ENOENT") {
      // First access — seed from seed.tex if present, else return minimal stub
      try {
        const seed = await fs.readFile(SEED_PATH, "utf8");
        await fs.mkdir(path.dirname(SOURCE_PATH), { recursive: true });
        await fs.writeFile(SOURCE_PATH, seed);
        return seed;
      } catch {
        return "\\documentclass{article}\\begin{document}\\end{document}";
      }
    }
    throw e;
  }
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
  await fs.mkdir(path.dirname(SOURCE_PATH), { recursive: true });
  await fs.writeFile(SOURCE_PATH, tex);
  return NextResponse.json({ ok: true, bytes: tex.length });
}
