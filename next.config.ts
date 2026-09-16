import type { NextConfig } from "next";

/**
 * Kept intentionally minimal for now.
 * Once Supabase + image sources (e.g. clinic/dentist photos) are finalised,
 * add `images.remotePatterns` here rather than widening `next/image` config elsewhere.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
};

export default nextConfig;
