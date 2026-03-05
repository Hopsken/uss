import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "@mantine/core",
      "@mantine/hooks",
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
