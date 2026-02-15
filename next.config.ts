import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
});

const nextConfig: NextConfig = withPWA({
  // Allow Turbopack in dev while next-pwa adds webpack config for prod
  turbopack: {},
});

export default nextConfig;
