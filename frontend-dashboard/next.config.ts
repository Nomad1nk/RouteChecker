import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/api/v1/routes/optimize',
        destination: 'http://localhost:3000/api/v1/routes/optimize',
      },
    ];
  },
};

export default nextConfig;
