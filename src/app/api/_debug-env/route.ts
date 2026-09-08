import { NextResponse } from "next/server";

export async function GET() {
  // Strip non-name parts. We want to know what the lambda actually sees.
  const subset = ["NEXTAUTH_URL", "AUTH_URL", "VERCEL_URL", "VERCEL_ENV", "NODE_ENV",
                  "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET",
                  "GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET",
                  "DATABASE_URL", "AUTH_SECRET"];
  const out: Record<string, string | number> = {};
  for (const k of subset) {
    const v = process.env[k] ?? "";
    if (k.includes("SECRET") || k.includes("PASSWORD") || k.includes("DATABASE_URL")) {
      out[k] = "[secret,len=" + v.length + "]";
    } else {
      out[k] = v === "" ? "(empty)" : v;
    }
  }
  return NextResponse.json(out, { headers: { "Cache-Control": "no-store" } });
}
