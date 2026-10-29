import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "admin.luuquancoder.id.vn",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.k-sport.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "marketplace.canva.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
