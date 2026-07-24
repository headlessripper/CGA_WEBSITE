import type { NextConfig } from "next";

/**
 * next/image needs every remote image host declared up front. Unsplash covers
 * the demo artwork; the Appwrite host is derived from the endpoint env var so
 * that thumbnails served from an Appwrite bucket load without extra config.
 */
const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  { protocol: "https", hostname: "images.unsplash.com" },
];

const appwriteEndpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
if (appwriteEndpoint) {
  try {
    remotePatterns.push({
      protocol: "https",
      hostname: new URL(appwriteEndpoint).hostname,
    });
  } catch {
    // Malformed endpoint — ignore; the app still builds.
  }
}

const nextConfig: NextConfig = {
  images: { remotePatterns },
};

export default nextConfig;
