import { BlogService } from '@/lib/blog-service'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const categories = await BlogService.getCategoriesWithCounts()

    return Response.json({
      categories,
      total: categories.length
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return Response.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}