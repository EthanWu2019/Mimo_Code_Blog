import { NextResponse } from "next/server";

export async function GET() {
  // DO NOT commit this file. It will be removed after we diagnose the OAuth
  // signinUrl-vs-preview-URL leak. Print env so we can confirm runtime sees
  // the values we set via Vercel project env.
  const subset = ["NEXTAUTH_URL", "AUTH_URL", "VERCEL_URL", "VERCEL_ENV", "NODE_ENV",
                  "GOOGLE_CLIENT_ID", "GITHUB_CLIENT_ID", "DATABASE_URL"];
  const out: Record<string, string | boolean> = {};
  for (const k of subset) {
    const v = process.env[k];
    if (v == null) out[k] = "(unset)";
    else if (k.includes("SECRET") || k.includes("PASSWORD") || k.includes("CLIENT_SECRET") || k.includes("DATABASE_URL")) {
      out[k] = "[secret, len=" + v.length + "]";
    } else {
      out[k] = v.length > 64 ? v.slice(0, 60) + "…" : v;
    }
  }
  return NextResponse.json(out);
}
