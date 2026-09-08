import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

// Emails that get full admin access automatically when they sign in
// via any provider. Keep this list in sync with the user's intent —
// the admin role only grants access to /resume/edit and other gated
// surfaces; everywhere else it behaves the same as a normal user.
const ADMIN_EMAILS = new Set<string>([
  "ethanwucz2019@gmail.com",
  "3401895383@qq.com",
]);

async function promoteToAdminIfEligible(userId: string, email: string | null | undefined) {
  if (!email) return;
  if (!ADMIN_EMAILS.has(email.toLowerCase())) return;
  // Idempotent: only flip if not already admin.
  // We don't await to keep the login flow snappy, but we DO await here
  // so subsequent DB reads (e.g. session callback) see the new role.
  try {
    await prisma.user.updateMany({
      where: { id: userId, NOT: { role: "admin" } },
      data: { role: "admin" },
    });
  } catch (e) {
    console.error("Failed to promote admin", e);
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // PrismaAdapter requires database sessions. Credentials provider forces
  // a JWT strategy, so we use JWT for the whole app and manage OAuth
  // users through the adapter on a per-event basis. See events.signIn.
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // 'user' is only set on the first call after sign-in. Pull id+role
      // from the DB row so JWT reflects persisted admin status.
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role || "user";
        token.email = user.email ?? token.email;
      }
      // For OAuth providers, the 'user' object from credentials may be
      // missing role; re-fetch to pick up the role we set in events.signIn.
      if (token.email && account?.provider !== "credentials") {
        const row = await prisma.user.findUnique({
          where: { email: String(token.email).toLowerCase() },
          select: { id: true, role: true },
        });
        if (row) {
          token.id = row.id;
          token.role = row.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      // For OAuth providers, NextAuth + PrismaAdapter creates a User
      // row on first sign-in (row.role defaults to 'user' per schema).
      // We then promote based on email here. This runs before jwt callback,
      // so by the time jwt.fetch happens, role is already 'admin'.
      const email = user?.email ?? (profile as any)?.email ?? null;
      const userId = (user as any)?.id;
      if (userId && email) {
        await promoteToAdminIfEligible(userId, email);
      }
    },
  },
});

// Helper used by server components / route handlers to gate UI on admin role.
export function isAdmin(role: string | undefined | null): boolean {
  return role === "admin";
}
