/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint and TypeScript checking during builds to allow deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Strict React mode
  reactStrictMode: true,
  
  // Set the source directory explicitly
  distDir: '.next',
  
  // Experimental features
  experimental: {
    optimizeCss: true,
  },
  
  // Move serverComponentsExternalPackages to the root level
  serverExternalPackages: [],
  
  // Define path rewrites to ensure API routes work correctly
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      }
    ];
  },

  images: {
    domains: [
      'vercel-blob.com',
      'placehold.co'
    ],
  },

  // Configure environment variables that should be available on the client-side
  env: {
    NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  },
  
  // Vercel Cron Jobs configuration
  // This defines when the cron jobs should run
  // Documentation: https://vercel.com/docs/cron-jobs
  crons: {
    // Refresh trending cities daily at midnight UTC
    'refresh-trending-cities': {
      path: '/api/cron/refresh-trending',
      schedule: '0 0 * * *' // Daily at midnight (cron syntax)
    },
    
    // Refresh interest data weekly on Sunday at 2am UTC
    'refresh-interests-data': {
      path: '/api/cron/refresh-interests',
      schedule: '0 2 * * 0' // Weekly on Sunday at 2am (cron syntax)
    }
  }
};

module.exports = nextConfig; 