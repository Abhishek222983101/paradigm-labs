import { existsSync } from "node:fs"
import type { NextConfig } from "next"

// Local dev: load the monorepo .env into the server process (never exposed to the browser:
// only NEXT_PUBLIC_* reaches client bundles). On Vercel the same names come from project env.
if (existsSync("../../.env")) process.loadEnvFile("../../.env")

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Camera + mic only for our own origin (the recorder); everything else off.
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(self), geolocation=(), payment=(), usb=()",
  },
]

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  poweredByHeader: false,
  transpilePackages: ["@adx/shared", "@adx/db"],
  serverExternalPackages: ["pg", "@neondatabase/serverless", "@hiero-ledger/sdk"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }]
  },
}

export default nextConfig
