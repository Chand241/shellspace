import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  // Reduce logging noise in dev
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

export default nextConfig;

