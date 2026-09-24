import type { NextConfig } from "next";

// Cloudflare Workers の静的アセットとして配信するため、静的書き出しにする
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
