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
};

export default nextConfig;
