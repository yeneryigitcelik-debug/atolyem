import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "imagedelivery.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "/**",
      },
    ],
    // Cloudflare Images için unoptimized kullanabiliriz (CDN zaten optimize ediyor)
    // unoptimized: true, // İsterseniz açabilirsiniz
  },
};

export default nextConfig;
