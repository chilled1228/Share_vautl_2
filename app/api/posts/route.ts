import { NextRequest } from 'next/server'
import { BlogService } from '@/lib/blog-service'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const offset = parseInt(searchParams.get('offset') || '0')
    const limit = parseInt(searchParams.get('limit') || '12')

    // Get posts with pagination
    const posts = await BlogService.getPostsWithPagination(offset, limit)

    const response = Response.json({
      posts,
      offset,
      limit
    })

    // Add cache headers with 5-minute TTL and stale-while-revalidate
    response.headers.set(
      'Cache-Control',
      'public, max-age=300, stale-while-revalidate=60'
    )
    response.headers.set('Vary', 'Accept-Encoding')

    // Add ETag for cache validation
    const etag = `W/"posts-${offset}-${limit}-${posts.length}"`
    response.headers.set('ETag', etag)

    return response
  } catch (error) {
    console.error('Error fetching posts:', error)
    return Response.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}