// Edge-compatible auth config — used by middleware and full auth.ts alike.
// MUST NOT import Prisma, bcrypt, or any Node-only modules.
import type { NextAuthConfig } from "next-auth";

const PUBLIC_PATHS = ["/login", "/register", "/forbidden", "/api/auth", "/api/mobile"];

export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [], // Populated in auth.ts (Node runtime only).
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return true;
      if (pathname === "/") return true;
      return !!auth?.user;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
