import type { NextConfig } from "next";

// All /api/* traffic flows through the App Router catch-all at
// `app/api/[...path]/route.ts` so the NextAuth session can inject the
// Gmail access token. The legacy rewrite to FastAPI is intentionally gone.
const nextConfig: NextConfig = {};

export default nextConfig;
