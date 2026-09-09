import { createMDX } from 'fumadocs-mdx/next';

/** Must match `basePath` in `lib/base-path.ts`. */
const basePath = '/learn';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath,
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
