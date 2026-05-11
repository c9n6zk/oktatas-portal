// Lightweight Edge-compatible middleware.
// Uses auth.config.ts (no Prisma / bcrypt) to stay under Vercel's 1MB Edge function limit.
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

export const { auth: middleware } = NextAuth(authConfig);
export default middleware;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
