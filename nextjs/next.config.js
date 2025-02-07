/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.shields.io",
        pathname: "/**",
      },
      {
        protocol: "https", 
        hostname: "github.com",
        pathname: "/**",
      }
    ],
  },
  experimental: {
    turbo: {
      rules: {
        "*.md": {
          loaders: ["raw-loader"],
          as: "*.js",
        },
      },
    },
  },
  webpack: (config) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    config.module.rules.push({
      test: /\.md$/,
      type: "asset/source",
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return config;
  },
};

export default config;
