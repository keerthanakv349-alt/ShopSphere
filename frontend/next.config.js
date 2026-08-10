/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Produces a minimal server.js + only the node_modules actually used
  // at runtime — see frontend/Dockerfile, which copies this output
  // instead of the full node_modules tree into the production image.
  output: "standalone",
  images: {
    // Product images currently come from our own FastAPI backend's /media
    // mount (see backend Dockerfile / app/core/images.py). remotePatterns
    // is Next's SSRF guard — it refuses to fetch/optimize images from any
    // host not explicitly listed here. The localhost:8000 pattern covers
    // local dev; the https wildcard covers a future S3/CDN host once
    // Phase 2's local-disk storage is swapped out (see images.py docstring).
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "8000" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

module.exports = nextConfig;
