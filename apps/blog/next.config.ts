import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  agentRules: false,
  env: {
    // Keep existing Vercel variables working during the framework migration.
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ?? process.env.VITE_API_URL,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY:
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ??
      process.env.VITE_TURNSTILE_SITE_KEY,
  },
}

export default nextConfig
