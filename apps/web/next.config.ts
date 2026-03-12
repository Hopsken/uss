import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "@tanstack/react-query",
      "lucide-react",
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'robohash.org',
      },
    ],
  },
};

export default nextConfig;
