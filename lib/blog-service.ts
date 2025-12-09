
import { supabase } from '@/lib/supabase'
import { BlogPost, MediaFile } from '@/types/blog'
import { errorHandler } from '@/lib/error-handler'
import { unstable_cache } from 'next/cache'
import { SupabaseClient } from '@supabase/supabase-js'

export class BlogService {
  // Helper to map Supabase data to BlogPost
  private static mapToBlogPost(data: any): BlogPost {
    return {
      id: data.id,
      title: data.title,
      content: data.content,
      excerpt: data.excerpt,
      slug: data.slug,
      category: data.category,
      tags: data.tags,
      featured: data.featured,
      published: data.published,
      imageUrl: data.image_url,
      featuredImage: data.featured_image,
      authorId: data.author_id,
      author: data.author_name,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      publishedAt: data.published_at ? new Date(data.published_at) : undefined,
      readTime: data.read_time
    }
  }

  static async createPost(post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>, client: SupabaseClient = supabase): Promise<string> {
    // Generate a UUID for the post ID since the table uses text IDs
    const postId = crypto.randomUUID()

    const { data, error } = await client
      .from('posts')
      .insert({
        id: postId,
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        slug: post.slug,
        category: post.category,
        tags: post.tags,
        featured: post.featured,
        published: post.published,
        image_url: post.imageUrl,
        featured_image: post.featuredImage,
        author_id: post.authorId,
        author_name: post.author,
        read_time: post.readTime,
      })
      .select('id')
      .single()

    if (error) {
      // Enhanced error handling with detailed Supabase error information
      const errorMessage = error.message || 'Unknown database error'
      const errorDetails = error.details ? ` Details: ${error.details}` : ''
      const errorHint = error.hint ? ` Hint: ${error.hint}` : ''
      const errorCode = error.code ? ` (Code: ${error.code})` : ''

      throw new Error(`${errorMessage}${errorDetails}${errorHint}${errorCode}`)
    }
    return data.id
  }

  static getPosts = unstable_cache(
    async (limitCount?: number): Promise<BlogPost[]> => {
      let query = supabase
        .from('posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })

      if (limitCount) {
        query = query.limit(limitCount)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error in getPosts:', error)
        return []
      }

      console.log(`✅ [BlogService.getPosts] Retrieved ${data.length} posts from Supabase`, {
        limitCount,
        hasLimit: !!limitCount,
        totalIds: data.length
      })

      return data.map(BlogService.mapToBlogPost)
    },
    ['blog-posts'],
    {
      revalidate: 7200,
      tags: ['posts', 'all-posts']
    }
  )

  static async getAllPosts(limitCount?: number, client: SupabaseClient = supabase): Promise<BlogPost[]> {
    try {
      let query = client
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (limitCount) {
        query = query.limit(limitCount)
      }

      const { data, error } = await query
      if (error) throw error

      return data.map(BlogService.mapToBlogPost)
    } catch (error) {
      errorHandler.error('Error in getAllPosts', error as Error, {
        component: 'BlogService',
        action: 'getAllPosts',
        metadata: { limitCount }
      })
      throw error
    }
  }

  static getFeaturedPosts = unstable_cache(
    async (limitCount = 3): Promise<BlogPost[]> => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('featured', true)
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(limitCount)

      if (error) {
        console.error('Error in getFeaturedPosts:', error)
        return []
      }

      console.log(`✅ [BlogService.getFeaturedPosts] Retrieved ${data.length} featured posts`)
      return data.map(BlogService.mapToBlogPost)
    },
    ['featured-posts'],
    {
      revalidate: 7200,
      tags: ['posts', 'featured-posts']
    }
  )

  static async getPostById(id: string, client: SupabaseClient = supabase): Promise<BlogPost | null> {
    const { data, error } = await client
      .from('posts')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null
    return BlogService.mapToBlogPost(data)
  }

  static getPostBySlug = unstable_cache(
    async (slug: string): Promise<BlogPost | null> => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single()

      if (error || !data) {
        console.log(`⚠️ [BlogService.getPostBySlug] Post not found: ${slug}`)
        return null
      }

      console.log(`✅ [BlogService.getPostBySlug] Retrieved post: ${slug}`)
      return BlogService.mapToBlogPost(data)
    },
    ['post-by-slug'],
    {
      revalidate: 21600,
      tags: ['posts', 'single-post']
    }
  )

  static async getPostsWithPagination(offset: number, limitCount: number, client: SupabaseClient = supabase): Promise<BlogPost[]> {
    try {
      // Supabase range is inclusive, so offset to offset + limitCount - 1
      const { data, error } = await client
        .from('posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limitCount - 1)

      if (error) throw error

      return data.map(BlogService.mapToBlogPost)
    } catch (error) {
      console.error('Error in getPostsWithPagination:', error)
      throw error
    }
  }

  static async getTotalPostsCount(client: SupabaseClient = supabase): Promise<number> {
    try {
      const { count, error } = await client
        .from('posts')
        .select('*', { count: 'exact', head: true }) // head: true means don't return data, just count
        .eq('published', true)

      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Error getting total posts count:', error)
      return 0
    }
  }

  static async updatePost(id: string, updates: Partial<BlogPost>, client: SupabaseClient = supabase): Promise<void> {
    // Map updates to snake_case
    const dbUpdates: any = {
      updated_at: new Date().toISOString()
    }

    if (updates.title !== undefined) dbUpdates.title = updates.title
    if (updates.content !== undefined) dbUpdates.content = updates.content
    if (updates.excerpt !== undefined) dbUpdates.excerpt = updates.excerpt
    if (updates.slug !== undefined) dbUpdates.slug = updates.slug
    if (updates.category !== undefined) dbUpdates.category = updates.category
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags
    if (updates.featured !== undefined) dbUpdates.featured = updates.featured
    if (updates.published !== undefined) dbUpdates.published = updates.published
    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl
    if (updates.featuredImage !== undefined) dbUpdates.featured_image = updates.featuredImage
    if (updates.authorId !== undefined) dbUpdates.author_id = updates.authorId
    if (updates.author !== undefined) dbUpdates.author_name = updates.author
    if (updates.readTime !== undefined) dbUpdates.read_time = updates.readTime
    if (updates.publishedAt !== undefined) dbUpdates.published_at = updates.publishedAt
    if (updates.createdAt !== undefined) dbUpdates.created_at = updates.createdAt

    const { error } = await client
      .from('posts')
      .update(dbUpdates)
      .eq('id', id)

    if (error) throw error
  }

  static async deletePost(id: string, client: SupabaseClient = supabase): Promise<void> {
    const { error } = await client
      .from('posts')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  static async uploadMedia(file: File, userId: string, client: SupabaseClient = supabase): Promise<MediaFile> {
    const path = `sharevault/${userId}/${Date.now()}_${file.name}`

    const { data, error } = await client.storage
      .from('sharevault') // Assuming bucket name
      .upload(path, file)

    if (error) throw error

    const { data: publicUrlData } = client.storage
      .from('sharevault')
      .getPublicUrl(path)

    return {
      id: data.path,
      name: file.name,
      url: publicUrlData.publicUrl,
      type: file.type,
      size: file.size,
      path: data.path,
      uploadedBy: userId,
      uploadedAt: new Date()
    }
  }

  static async deleteMedia(path: string, client: SupabaseClient = supabase): Promise<void> {
    const { error } = await client.storage
      .from('sharevault')
      .remove([path])

    if (error) throw error
  }

  static async getPostsByCategory(category: string, limitCount?: number, client: SupabaseClient = supabase): Promise<BlogPost[]> {
    let query = client
      .from('posts')
      .select('*')
      .eq('published', true)
      .eq('category', category)
      .order('created_at', { ascending: false })

    if (limitCount) {
      query = query.limit(limitCount)
    }

    const { data, error } = await query

    if (error) {
      console.error(`Error in getPostsByCategory: ${error.message}`)
      return []
    }

    console.log(`✅ [BlogService.getPostsByCategory] Retrieved ${data.length} posts for category "${category}"`)
    return data.map(BlogService.mapToBlogPost)
  }

  static getRelatedPostsOptimized = unstable_cache(
    async (category: string, currentSlug: string, limitCount: number = 3): Promise<BlogPost[]> => {
      try {
        // Fetch posts from same category, excluding current
        const { data: categoryPosts, error: catError } = await supabase
          .from('posts')
          .select('*')
          .eq('published', true)
          .eq('category', category)
          .neq('slug', currentSlug)
          .order('created_at', { ascending: false })
          .limit(limitCount)

        if (catError) throw catError

        let relatedPoints = categoryPosts ? categoryPosts.map(BlogService.mapToBlogPost) : []

        // If not enough, fill with recent posts
        if (relatedPoints.length < limitCount) {
          const { data: recentPosts, error: recentError } = await supabase
            .from('posts')
            .select('*')
            .eq('published', true)
            .neq('slug', currentSlug) // Exclude current
            .order('created_at', { ascending: false })
            .limit(limitCount + 2) // Fetch a few more to avoid duplicates

          if (recentError) throw recentError

          const recentMapped = recentPosts.map(BlogService.mapToBlogPost)
          const existingIds = new Set(relatedPoints.map(p => p.id))

          for (const post of recentMapped) {
            if (!existingIds.has(post.id) && relatedPoints.length < limitCount) {
              relatedPoints.push(post)
            }
          }
        }

        return relatedPoints.slice(0, limitCount)
      } catch (error) {
        console.error('Error in getRelatedPostsOptimized:', error)
        return []
      }
    },
    ['related-posts'],
    {
      revalidate: 21600,
      tags: ['posts', 'related-posts']
    }
  )

  static async getCategories(client: SupabaseClient = supabase): Promise<string[]> {
    const { data, error } = await client
      .from('posts')
      .select('category')
      .eq('published', true)

    if (error) {
      console.error('Error getting categories:', error)
      return []
    }

    const categories = new Set<string>()
    data.forEach(row => {
      if (row.category) categories.add(row.category)
    })

    return Array.from(categories).sort()
  }

  static getCategoriesWithCounts = unstable_cache(
    async (): Promise<Array<{ name: string, count: number, slug: string }>> => {
      const { data, error } = await supabase
        .from('posts')
        .select('category')
        .eq('published', true)

      if (error) {
        console.error('Error getting categories with counts:', error)
        return []
      }

      const categoryMap = new Map<string, number>()
      data.forEach(row => {
        if (row.category) {
          categoryMap.set(row.category, (categoryMap.get(row.category) || 0) + 1)
        }
      })

      return Array.from(categoryMap.entries())
        .map(([name, count]) => ({
          name,
          count,
          slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        }))
        .sort((a, b) => b.count - a.count)
    },
    ['categories-with-counts'],
    {
      revalidate: 3600,
      tags: ['categories', 'posts']
    }
  )

  static getPostsByCategoryWithPagination = unstable_cache(
    async (category: string, offset: number, limitCount: number): Promise<BlogPost[]> => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('published', true)
          .eq('category', category)
          .order('created_at', { ascending: false })
          .range(offset, offset + limitCount - 1)

        if (error) throw error

        console.log(`✅ Retrieved ${data.length} posts for category "${category}" via pagination`)
        return data.map(BlogService.mapToBlogPost)
      } catch (error) {
        console.error('Error in getPostsByCategoryWithPagination:', error)
        throw error
      }
    },
    ['category-posts-pagination'],
    {
      revalidate: 7200,
      tags: ['posts', 'category-posts']
    }
  )

  static getCategoryPostsCount = unstable_cache(
    async (category: string): Promise<number> => {
      try {
        const { count, error } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('published', true)
          .eq('category', category)

        if (error) throw error
        return count || 0
      } catch (error) {
        console.error('Error getting category posts count:', error)
        return 0
      }
    },
    ['category-posts-count'],
    {
      revalidate: 7200,
      tags: ['posts', 'category-counts']
    }
  )

  static async getDraftPosts(limitCount?: number, client: SupabaseClient = supabase): Promise<BlogPost[]> {
    let query = client
      .from('posts')
      .select('*')
      .eq('published', false)
      .order('updated_at', { ascending: false })

    if (limitCount) {
      query = query.limit(limitCount)
    }

    const { data, error } = await query
    if (error) return []

    return data.map(BlogService.mapToBlogPost)
  }

  static async getOldestDraftPost(client: SupabaseClient = supabase): Promise<BlogPost | null> {
    const { data, error } = await client
      .from('posts')
      .select('*')
      .eq('published', false)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (error || !data) return null
    return BlogService.mapToBlogPost(data)
  }

  static async publishPost(id: string, client: SupabaseClient = supabase): Promise<void> {
    const now = new Date()
    const { error } = await client
      .from('posts')
      .update({
        published: true,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        published_at: now.toISOString()
      })
      .eq('id', id)

    if (error) throw error
  }

  static async unpublishPost(id: string, client: SupabaseClient = supabase): Promise<void> {
    const { error } = await client
      .from('posts')
      .update({
        published: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) throw error
  }

  static async isSlugUnique(slug: string, excludeId?: string, client: SupabaseClient = supabase): Promise<boolean> {
    try {
      let query = client
        .from('posts')
        .select('id')
        .eq('slug', slug)

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { data, error } = await query.limit(1)

      if (error) throw error
      return data.length === 0
    } catch (error) {
      console.error('Error checking slug uniqueness:', error)
      return true // Fail safe
    }
  }

  // Optimized method
  static getPostWithRelatedPosts = unstable_cache(
    async (slug: string): Promise<{ post: BlogPost | null, relatedPosts: BlogPost[] }> => {
      try {
        const { data: postData, error } = await supabase
          .from('posts')
          .select('*')
          .eq('slug', slug)
          .eq('published', true)
          .single()

        if (error || !postData) return { post: null, relatedPosts: [] }

        const post = BlogService.mapToBlogPost(postData)

        // Get related
        const { data: relatedData, error: relatedError } = await supabase
          .from('posts')
          .select('*')
          .eq('published', true)
          .eq('category', post.category)
          .neq('slug', slug)
          .order('created_at', { ascending: false })
          .limit(3)

        const relatedPosts = relatedData ? relatedData.map(BlogService.mapToBlogPost) : []
        return { post, relatedPosts }

      } catch (error) {
        console.error('Error in getPostWithRelatedPosts:', error)
        return { post: null, relatedPosts: [] }
      }
    },
    ['post-with-related-posts'],
    {
      revalidate: 1800,
      tags: ['posts', 'single-post', 'related-posts']
    }
  )

  static async bulkDeletePosts(postIds: string[], client: SupabaseClient = supabase): Promise<void> {
    const { error } = await client
      .from('posts')
      .delete()
      .in('id', postIds)

    if (error) {
      errorHandler.error('Error bulk deleting posts', error as Error, {
        component: 'BlogService',
        action: 'bulkDeletePosts',
        metadata: { postIds }
      })
      throw error
    }
  }

  static getPostSlugsOnly = unstable_cache(
    async (): Promise<Array<{ slug: string }>> => {
      const { data, error } = await supabase
        .from('posts')
        .select('slug')
        .eq('published', true)

      if (error) {
        console.error('Error getting slugs:', error)
        return []
      }
      return data // Already in { slug } format
    },
    ['post-slugs-only'],
    {
      revalidate: 21600,
      tags: ['posts', 'slugs']
    }
  )
}