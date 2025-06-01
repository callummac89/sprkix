/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['media.themoviedb.org', 'image.tmdb.org', 'm.media-amazon.com'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig

