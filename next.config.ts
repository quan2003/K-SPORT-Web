import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "admin.luuquancoder.id.vn",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
