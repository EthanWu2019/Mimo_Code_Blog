// Server shell for /resume/edit — gates the page on the server so a
// non-admin never sees the source editor at all. We hand the source + a
// boolean `isAdmin` down to the client component to keep the rest of
// the page interactive.
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import fs from "node:fs/promises";
import path from "node:path";
import ResumeEditClient from "./ResumeEditClient";

const SOURCE_PATH = path.join(process.cwd(), "data", "resume", "source.tex");
const SEED_PATH = path.join(process.cwd(), "data", "resume", "seed.tex");

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
