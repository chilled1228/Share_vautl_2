import { NextRequest } from 'next/server'
import { BlogService } from '@/lib/blog-service'

// Enable caching with 5-minute revalidation
export const revalidate = 300

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const offset = parseInt(searchParams.get('offset') || '0')
    const limit = parseInt(searchParams.get('limit') || '12')

    // Get posts with pagination (now cached via Next.js)
    const posts = await BlogService.getPostsWithPagination(offset, limit)

    return Response.json({
      posts,
      offset,
      limit
    }, {
      headers: {
        // Browser cache: 5 minutes, stale-while-revalidate: 10 minutes
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        // CDN cache: 10 minutes
        'CDN-Cache-Control': 'public, s-maxage=600',
        // Vercel CDN: 1 hour
        'Vercel-CDN-Cache-Control': 'public, s-maxage=3600',
      }
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return Response.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}