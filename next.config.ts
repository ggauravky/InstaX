import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  images: {
    remotePatterns: [
      // Clerk user avatars
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      // UploadThing CDN (legacy)
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      // UploadThing CDN (new ufs.sh)
      {
        protocol: "https",
        hostname: "**.ufs.sh",
      },
      // Google profile images (from Clerk OAuth)
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
    // Reasonable device sizes for social feed
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [32, 48, 64, 96, 128, 256],
  },

  // Suppress noisy hydration warnings from Clerk in dev
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

export default nextConfig;
