/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'], // AVIF first for better compression
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year cache for optimized images
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-141831e61e69445289222976a15b6fb3.r2.dev',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  swcMinify: true,
  compress: true,
  poweredByHeader: false,

  // Cache optimization headers
  async headers() {
    return [
      // Cache static assets aggressively
      {
        source: '/(.*)\.(js|css|woff|woff2|ttf|eot|otf)$',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 1 year
          },
        ],
      },
      // Cache images for 30 days
      {
        source: '/(.*)\.(jpg|jpeg|png|gif|ico|svg|webp|avif)$',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400', // 30 days, 1 day stale
          },
        ],
      },
      // Cache API responses with shorter TTL
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, stale-while-revalidate=60', // 5 minutes, 1 minute stale
          },
        ],
      },
      // Special caching for RSS feed
      {
        source: '/api/rss',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=300', // 1 hour, 5 minutes stale
          },
        ],
      },
      // Serve ads.txt and robots.txt with proper headers
      {
        source: '/ads.txt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400', // 24 hours
          },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400', // 24 hours
          },
        ],
      },
      // Security and performance headers for all routes
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
      // Preload critical resources and add preconnect hints
      {
        source: '/',
        headers: [
          {
            key: 'Link',
            value: '<https://pub-141831e61e69445289222976a15b6fb3.r2.dev>; rel=preconnect'
          }
        ]
      },
    ]
  },

  // Performance optimizations
  experimental: {
    // Configure stale times for better caching
    staleTimes: {
      dynamic: 30,        // 30 seconds for dynamic routes
      static: 180,        // 3 minutes for static routes
    },

    // Optimize package imports for better tree shaking
    optimizePackageImports: [
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-aspect-ratio',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-collapsible',
      '@radix-ui/react-context-menu',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-hover-card',
      '@radix-ui/react-label',
      '@radix-ui/react-menubar',
      '@radix-ui/react-navigation-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slider',
      '@radix-ui/react-slot',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-toggle',
      '@radix-ui/react-toggle-group',
      '@radix-ui/react-tooltip',
      'lucide-react'
    ],

    // Enable web vitals attribution for better debugging
    webVitalsAttribution: ['CLS', 'FCP', 'FID', 'INP', 'LCP', 'TTFB'],
  },

  // Webpack optimizations for maximum performance
  webpack: (config, { dev, isServer }) => {
    // Performance optimizations for all builds
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve?.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      },
    }

    // Add performance hints
    config.performance = {
      hints: 'warning',
      maxEntrypointSize: 400000, // 400kb
      maxAssetSize: 300000, // 300kb
    }

    return config
  },

  // SWC configuration for modern JavaScript
  swcMinify: true,
  modularizeImports: {
    '@radix-ui/react-icons': {
      transform: '@radix-ui/react-icons/dist/{{member}}.js',
    },
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },
}

export default nextConfig
