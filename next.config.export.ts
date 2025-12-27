import type { NextConfig } from "next";

const exportConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default exportConfig;
