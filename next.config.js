/** @type {import('next').NextConfig} */
const nextConfig = {
  // Set middleware to use Edge Runtime
  middleware: {
    runtime: 'edge',
  },
  // Set environment variable for runtime detection
  env: {
    RUNTIME_ENV: 'node', // Default to Node.js runtime for API routes
  },
  output: 'standalone',
  outputFileTracing: true,
  images: {
    domains: [
      'cloud.appwrite.io',
      'localhost',
      'lvh.me',
      'vercel.app',
      'example.com',
      process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.replace(/^https?:\/\//, '') || '',
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    },
    appDir: true, // Ensures App Router compatibility
    outputFileTracingIncludes: {
      '/*': ['./node_modules/.prisma/**/*', './node_modules/@prisma/client/**/*']
    }
  },
  typescript: {
    ignoreBuildErrors: true
  },
  transpilePackages: [
    '@prisma/client',
    '@tanstack/react-table'
  ],
  productionBrowserSourceMaps: false,
  poweredByHeader: false
};

module.exports = nextConfig;
