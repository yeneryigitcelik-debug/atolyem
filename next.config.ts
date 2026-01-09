import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow external images from Unsplash and Supabase
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "wiynbmqoraexxskeiybr.supabase.co",
      },
    ],
  },

  // Redirects for removed routes
  async redirects() {
    return [
      {
        source: "/sanatcilar",
        destination: "/kesfet",
        permanent: true, // 301 redirect
      },
    ];
  },

  // Security headers for production
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
