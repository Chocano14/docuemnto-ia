/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse']
  }
};

module.exports = nextConfig;
