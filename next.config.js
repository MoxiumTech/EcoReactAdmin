/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    domains: [
      'cloud.appwrite.io',
      'localhost',
      'lvh.me',
      process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.replace(/^https?:\/\//, '') || '',
    ]
  },
  typescript: {
    ignoreBuildErrors: true
  },
  transpilePackages: [
    '@prisma/client',
    '@tanstack/react-table'
  ],
  experimental: {
    workerThreads: false,
    cpus: 3
  }
}

module.exports = nextConfig;