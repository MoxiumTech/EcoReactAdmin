/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  outputFileTracing: true,
  distDir: '.next',
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    },
    outputFileTracingIncludes: {
      '/*': ['./node_modules/.prisma/**/*', './node_modules/@prisma/client/**/*']
    }
  },
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
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  // Configure dynamic routes
  async headers() {
    return [
      {
        source: '/(auth|api|store)/:path*',
        headers: [
          {
            key: 'x-next-cache-tags',
            value: 'dynamic',
          },
        ],
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true
  },
  transpilePackages: [
    '@tanstack/react-table'
  ],
  productionBrowserSourceMaps: false,
  poweredByHeader: false
};

module.exports = nextConfig;
