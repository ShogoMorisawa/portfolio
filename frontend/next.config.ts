import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/lib/telemetry/:path*",
        destination: "https://www.clarity.ms/:path*",
      },
      {
        source: "/api/vitals-report",
        destination: "https://h.clarity.ms/collect",
      },
      {
        source: "/assets/vitals-sync.gif",
        destination: "https://c.clarity.ms/c.gif",
      },
    ];
  },
};

export default nextConfig;
