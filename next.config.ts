import type { NextConfig } from "next";
import exportConfig from "./next.config.export";

const isExport = process.env.NEXT_PUBLIC_BUILD_TARGET === "export";

const nextConfig: NextConfig = isExport
  ? exportConfig
  : {
      reactStrictMode: true,
    };

export default nextConfig;
