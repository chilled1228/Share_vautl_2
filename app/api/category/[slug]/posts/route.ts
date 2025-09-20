import { NextRequest } from 'next/server'
import { BlogService } from '@/lib/blog-service'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const searchParams = request.nextUrl.searchParams
    const offset = parseInt(searchParams.get('offset') || '0')
    const limit = parseInt(searchParams.get('limit') || '12')

    // Convert slug back to category name (reverse the slug transformation)
    const category = slug.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')

    // Get posts with pagination
    const posts = await BlogService.getPostsByCategoryWithPagination(category, offset, limit)
    const totalPosts = await BlogService.getCategoryPostsCount(category)

    const response = Response.json({
      posts,
      offset,
      limit,
      total: totalPosts,
      category: category,
      slug: slug
    })

    // Add cache headers with 5-minute TTL
    response.headers.set(
      'Cache-Control',
      'public, max-age=300, stale-while-revalidate=60'
    )
    response.headers.set('Vary', 'Accept-Encoding')

    // Add ETag for cache validation
    const etag = `W/"category-${slug}-${offset}-${limit}-${totalPosts}"`
    response.headers.set('ETag', etag)

    return response
  } catch (error) {
    console.error('Error fetching category posts:', error)
    return Response.json(
      { error: 'Failed to fetch category posts' },
      { status: 500 }
    )
  }
}