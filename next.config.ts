import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',      // CRITICAL: Tells Next.js to create a static 'out' folder
  images: {
    unoptimized: true,   // Mobile apps cannot use Next.js default image optimization
  },
};

export default nextConfig;
