import { createMDX } from 'fumadocs-mdx/next';

/** Must match `basePath` in `lib/base-path.ts`. */
const basePath = '/learn';

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  reactStrictMode: true,
  basePath,
  async headers() {
    return [
      {
        source: '/api/search',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/docs/:path*.md',
        destination: '/llms.mdx/docs/:path*',
      },
    ];
  },
};

const withMDX = createMDX();

export default withMDX(nextConfig);
