import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
  eslint: {
    // Disable ESLint during builds (we lint separately)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip type checking during builds (we check separately)  
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
