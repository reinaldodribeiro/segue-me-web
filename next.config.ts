import type { NextConfig } from "next";

const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:8000/storage";
const storageOrigin = new URL(storageUrl);

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_STORAGE_URL: process.env.NEXT_PUBLIC_STORAGE_URL,
  },
  images: {
    remotePatterns: [
      {
        protocol: storageOrigin.protocol.replace(":", "") as "http" | "https",
        hostname: storageOrigin.hostname,
        ...(storageOrigin.port ? { port: storageOrigin.port } : {}),
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
