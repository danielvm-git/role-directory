import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['src/app', 'src/lib'], // Only lint app and lib, not tests
  },
};

export default nextConfig;

