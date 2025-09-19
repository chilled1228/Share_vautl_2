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

    return Response.json({
      posts,
      offset,
      limit,
      total: totalPosts,
      category: category,
      slug: slug
    })
  } catch (error) {
    console.error('Error fetching category posts:', error)
    return Response.json(
      { error: 'Failed to fetch category posts' },
      { status: 500 }
    )
  }
}