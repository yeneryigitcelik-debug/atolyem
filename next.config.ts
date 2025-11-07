import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "imagedelivery.net",
        // Cloudflare Images delivery URL formatı:
        // https://imagedelivery.net/{account_hash}/{image_id}/{variant}
        // Account hash environment variable'dan alınacak, pathname pattern ile eşleşir
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
