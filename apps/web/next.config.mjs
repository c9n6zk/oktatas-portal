import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/db", "@repo/shared"],
  // Don't bundle Prisma/bcrypt — use them as runtime externals on Vercel.
  serverExternalPackages: ["@prisma/client", ".prisma/client", "bcryptjs"],
  // Tracing root = monorepo root so Vercel sees workspace files outside apps/web.
  outputFileTracingRoot: path.join(__dirname, "../../"),
  // Force-include Prisma engine binary into the serverless bundle.
  outputFileTracingIncludes: {
    "/api/**/*": [
      "../../node_modules/.pnpm/@prisma+client@*/node_modules/.prisma/client/**/*",
    ],
    "/dashboard/**/*": [
      "../../node_modules/.pnpm/@prisma+client@*/node_modules/.prisma/client/**/*",
    ],
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
