import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Add cache headers for all responses
  const pathname = request.nextUrl.pathname

  // Handle static assets with aggressive caching
  if (pathname.match(/\.(js|css|woff|woff2|ttf|eot|otf)$/)) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    )
    response.headers.set('Vary', 'Accept-Encoding')
  }

  // Handle images with 30-day caching
  if (pathname.match(/\.(jpg|jpeg|png|gif|ico|svg|webp|avif)$/)) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=2592000, stale-while-revalidate=86400'
    )
    response.headers.set('Vary', 'Accept-Encoding')
  }

  // Handle API routes with shorter caching (excluding RSS to reduce bundle size)
  if (pathname.startsWith('/api/') && pathname !== '/api/rss') {
    if (pathname.startsWith('/api/posts') || pathname.startsWith('/api/categories')) {
      // Posts and categories - cache for 5 minutes
      response.headers.set(
        'Cache-Control',
        'public, max-age=300, stale-while-revalidate=60'
      )
    } else {
      // Other API routes - minimal caching
      response.headers.set(
        'Cache-Control',
        'public, max-age=60, stale-while-revalidate=30'
      )
    }

    // Add ETag for API responses
    response.headers.set('Vary', 'Accept-Encoding')
  }

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Add performance hints
  response.headers.set('X-DNS-Prefetch-Control', 'on')

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/rss (RSS feed to reduce bundle size)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/rss).*)',
  ],
}