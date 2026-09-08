// =============================================================
// /api/resume/pdf
//
// GET: anyone can download the current compiled PDF.
//   - On first hit, lazily uploads source.tex to LaTeXOnline
//     (https://latex.ytotech.com/builds/sync) and streams the resulting
//     PDF back to the caller with Content-Disposition: attachment so
//     browsers download it as `Ethan_Wu_Resume.pdf`.
//   - On subsequent hits within 60s we cache the compiled PDF in memory
//     so we don't spam LaTeXOnline every page view.
//
// Why a public remote compiler: zero install (no TeX Live), zero state,
// pay nothing. Privacy: we send the .tex over TLS; LaTeXOnline's TOS
// (latex-on-http, MIT) allows ephemeral compile and they don't retain
// content. We document this in the README.
//
// Edit flow: admin edits source via /resume/edit, hits Save →
// /api/resume/source PUT → /api/resume/pdf GET → LaTeXOnline re-compiles.
// =============================================================
import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

const SOURCE_PATH = path.join(process.cwd(), "data", "resume", "source.tex");
const SEED_PATH = path.join(process.cwd(), "data", "resume", "seed.tex");
const LATEX_URL = "https://latex.ytotech.com/builds/sync";
const CACHE_TTL_MS = 60_000;

// Module-scoped cache: survives across requests in the same warm
// Vercel function instance. Cleared on each compile or after TTL.
type Cache = { pdf: Buffer; builtAt: number; sourceHash: string };
let cache: Cache | null = null;

async function readSource(): Promise<string> {
  try {
    return await fs.readFile(SOURCE_PATH, "utf8");
  } catch (e: any) {
    if (e.code !== "ENOENT") throw e;
    try {
      const seed = await fs.readFile(SEED_PATH, "utf8");
      await fs.mkdir(path.dirname(SOURCE_PATH), { recursive: true });
      await fs.writeFile(SOURCE_PATH, seed);
      return seed;
    } catch {
      return "\\documentclass{article}\\begin{document}\\end{document}";
    }
  }
}

function hashSource(tex: string): string {
  // Cheap djb2 — sufficient for cache invalidation, not crypto.
  let h = 5381;
  for (let i = 0; i < tex.length; i++) h = ((h << 5) + h + tex.charCodeAt(i)) | 0;
  return String(h);
}

async function compileWithLatexOnline(tex: string): Promise<Buffer> {
  const boundary = "----boundary" + Date.now();
  const body =
    "--" + boundary + "\r\n" +
    "Content-Disposition: form-data; name=\"fileformat\"\r\n\r\npdf\r\n" +
    "--" + boundary + "\r\n" +
    "Content-Disposition: form-data; name=\"compiler\"\r\n\r\npdflatex\r\n" +
    "--" + boundary + "\r\n" +
    "Content-Disposition: form-data; name=\"files[]\"; filename=\"main.tex\"\r\n" +
    "Content-Type: text/plain\r\n\r\n" +
    tex.replace(/\n/g, "\r\n") + "\r\n" +
    "--" + boundary + "--\r\n";

  const r = await fetch(LATEX_URL, {
    method: "POST",
    headers: {
      "Content-Type": "multipart/form-data; boundary=" + boundary,
      "User-Agent": "ethanwu.work-resume/1.0",
    },
    body,
  });

  if (!r.ok) {
    const t = await r.text();
    throw new Error(`LaTeXOnline HTTP ${r.status}: ${t.slice(0, 500)}`);
  }
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.slice(0, 4).toString() !== "%PDF") {
    throw new Error("LaTeXOnline did not return a PDF: " + buf.slice(0, 200).toString("utf8"));
  }
  return buf;
}

export async function GET() {
  try {
    const tex = await readSource();
    const h = hashSource(tex);
    const now = Date.now();

    if (cache && cache.sourceHash === h && now - cache.builtAt < CACHE_TTL_MS) {
      return pdfResponse(cache.pdf);
    }

    const pdf = await compileWithLatexOnline(tex);
    cache = { pdf, builtAt: now, sourceHash: h };
    return pdfResponse(pdf);
  } catch (e: any) {
    return NextResponse.json(
      { error: "Failed to compile resume", detail: e?.message ?? String(e) },
      { status: 502 }
    );
  }
}

function pdfResponse(pdf: Buffer) {
  // NextResponse / fetch BodyInit on this runtime expects a Blob or
  // string — Buffer/Uint8Array are accepted at runtime but TypeScript's
  // edge types do not declare it. Convert to a Blob so both compile
  // and runtime are happy.
  const blob = new Blob([new Uint8Array(pdf)], { type: "application/pdf" });
  return new NextResponse(blob, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Ethan_Wu_Resume.pdf"',
      "Cache-Control": "no-store",
      "Content-Length": String(pdf.length),
    },
  });
}
