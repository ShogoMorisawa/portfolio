import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // 表向きは「サイトの動作安定用スクリプト」を装う
        source: "/lib/telemetry/:path*",
        // 実際の通信先（Clarity）
        destination: "https://www.clarity.ms/:path*",
      },
    ];
  },
};

export default nextConfig;
