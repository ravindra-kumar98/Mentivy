import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Explicitly set to the frontend project root to prevent Turbopack from
    // walking up and picking up stray package.json files in parent directories
    root: process.cwd(),
  },
};

export default nextConfig;
