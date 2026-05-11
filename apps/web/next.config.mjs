import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Egyetlen pattern minden Prisma engine fájlra (pnpm hash-elt nevek miatt glob).
const PRISMA_ENGINE_GLOBS = [
  "../../node_modules/.pnpm/@prisma+client@*/node_modules/.prisma/client/**/*",
  "../../node_modules/.pnpm/@prisma+client@*/node_modules/@prisma/client/**/*",
  "../../node_modules/.pnpm/@prisma+engines@*/node_modules/@prisma/engines/**/*",
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/db", "@repo/shared"],
  // Don't bundle Prisma/bcrypt — use them as runtime externals on Vercel.
  serverExternalPackages: ["@prisma/client", ".prisma/client", "bcryptjs"],
  // Tracing root = monorepo root so Vercel sees workspace files outside apps/web.
  outputFileTracingRoot: path.join(__dirname, "../../"),
  // Force-include Prisma engine binary into EVERY serverless function bundle.
  // "**/*" + "*" pattern: ne maradjon ki egy oldal sem (dashboard, student, admin,
  // (authed) route group, API routes — egyik sem boldogul Prisma engine nélkül).
  outputFileTracingIncludes: {
    "**/*": PRISMA_ENGINE_GLOBS,
    "*": PRISMA_ENGINE_GLOBS,
    "/api/**/*": PRISMA_ENGINE_GLOBS,
    "/dashboard": PRISMA_ENGINE_GLOBS,
    "/dashboard/**/*": PRISMA_ENGINE_GLOBS,
    "/student/**/*": PRISMA_ENGINE_GLOBS,
    "/instructor/**/*": PRISMA_ENGINE_GLOBS,
    "/admin/**/*": PRISMA_ENGINE_GLOBS,
    "/events": PRISMA_ENGINE_GLOBS,
    "/events/**/*": PRISMA_ENGINE_GLOBS,
    "/profile": PRISMA_ENGINE_GLOBS,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "127.0.0.1:3000"],
    },
  },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
