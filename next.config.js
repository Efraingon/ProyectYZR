const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '~': path.join(__dirname, './src'),
      '@': path.join(__dirname, './src'),
    };
    return config;
  },
};

module.exports = nextConfig;
