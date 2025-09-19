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

    return Response.json({
      posts,
      offset,
      limit
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return Response.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}