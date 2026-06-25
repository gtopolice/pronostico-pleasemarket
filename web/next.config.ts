import type { NextConfig } from "next";
import path from "path";

import { pleaseMarketSunsetRedirects } from "./src/lib/anyone-redirect";

const orgPackages = path.join(__dirname, "vendor/pronostico-apps/packages");

const orgAliases = {
  "@pronostico-apps/ui": path.join(orgPackages, "ui/index.ts"),
  "@pronostico-apps/interfaces": path.join(orgPackages, "interfaces/index.ts"),
  "@pronostico-apps/prediction-market": path.join(orgPackages, "prediction-market/index.ts"),
  "@pronostico-apps/common": path.join(orgPackages, "common/index.ts"),
  "@pronostico-apps/theme-css": path.join(orgPackages, "theme-css"),
};

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: Object.keys(orgAliases),
  async redirects() {
    return pleaseMarketSunsetRedirects();
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      ...orgAliases,
    };
    return config;
  },
};

export default nextConfig;
