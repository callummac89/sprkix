/** @type {import('next').NextConfig} */
const nextConfig: import('next').NextConfig = {
  images: {
    domains: ['media.themoviedb.org', 'image.tmdb.org', 'm.media-amazon.com'],
  },
}

export default nextConfig

// next.config.js
module.exports = {
  eslint: {
    ignoreDuringBuilds: true,
  },
}