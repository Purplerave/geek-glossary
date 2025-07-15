/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  experimental: { cpus: 4 },
  cacheHandler: require.resolve('cache-handler'),
};

module.exports = nextConfig;