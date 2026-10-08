import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a self-contained `.next/standalone` build (only the files
  // actually needed at runtime, with a minimal node_modules) so the
  // production Docker image doesn't need to ship the full workspace.
  output: 'standalone',
};

export default nextConfig;
