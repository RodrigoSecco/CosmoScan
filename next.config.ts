// next.config.ts
import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const repo = "CosmoScan"; 

const nextConfig: NextConfig = {
  output: "export",              
  images: { unoptimized: true }, 
  assetPrefix: isProd ? `/${repo}/` : undefined,
  trailingSlash: true,           
};

export default nextConfig;

