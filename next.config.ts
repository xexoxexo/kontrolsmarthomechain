import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals.push("pull", "izaki", "izakis");
    return config;
  },
};

export default nextConfig;
