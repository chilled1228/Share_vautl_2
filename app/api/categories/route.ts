import { BlogService } from '@/lib/blog-service'
import { unstable_cache } from 'next/cache'

export const dynamic = 'force-dynamic'

// Cache categories for 1 hour
const getCachedCategories = unstable_cache(
  async () => {
    return await BlogService.getCategoriesWithCounts()
  },
  ['categories-with-counts'],
  { revalidate: 3600, tags: ['categories'] }
)

export async function GET() {
  try {
    const categories = await getCachedCategories()

    return Response.json({
      categories,
      total: categories.length
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
      }
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return Response.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}