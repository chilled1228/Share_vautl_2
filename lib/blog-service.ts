import { collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, query, where, orderBy, limit, startAfter, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import { BlogPost, MediaFile } from '@/types/blog'
import { errorHandler } from '@/lib/error-handler'
import { unstable_cache } from 'next/cache'
import { PerformanceMonitor } from '@/lib/performance'

export class BlogService {
  static async createPost(post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'posts'), {
      ...post,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    return docRef.id
  }

  // Get posts with optional caching for frequently accessed data - OPTIMIZED
  static getPosts = unstable_cache(
    async (limitCount?: number): Promise<BlogPost[]> => {
      let q;
      if (limitCount) {
        q = query(
          collection(db, 'posts'),
          where('published', '==', true),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        )
      } else {
        q = query(
          collection(db, 'posts'),
          where('published', '==', true),
          orderBy('createdAt', 'desc')
        )
      }
      const querySnapshot = await getDocs(q)
      console.log(`✅ [BlogService.getPosts] Retrieved ${querySnapshot.docs.length} posts from Firebase`, {
        limitCount,
        hasLimit: !!limitCount,
        totalDocs: querySnapshot.docs.length
      })
      return querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
        } as BlogPost
      })
    },
    ['blog-posts'],
    {
      revalidate: 3600, // 1 hour (increased from 10 minutes)
      tags: ['posts']
    }
  )

  static async getAllPosts(limitCount?: number): Promise<BlogPost[]> {
    try {
      let q;
      if (limitCount) {
        q = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        )
      } else {
        q = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc')
        )
      }
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
        } as BlogPost
      })
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
      const q = query(
        collection(db, 'posts'),
        where('featured', '==', true),
        where('published', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
      const querySnapshot = await getDocs(q)
      console.log(`✅ [BlogService.getFeaturedPosts] Retrieved ${querySnapshot.docs.length} featured posts`)
      return querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
        } as BlogPost
      })
    },
    ['featured-posts'],
    {
      revalidate: 3600, // 1 hour
      tags: ['posts', 'featured-posts']
    }
  )

  static async getPostById(id: string): Promise<BlogPost | null> {
    const docRef = doc(db, 'posts', id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
      } as BlogPost
    }
    return null
  }

  // Get post by slug with caching (cached for 2 hours)
  static getPostBySlug = unstable_cache(
    async (slug: string): Promise<BlogPost | null> => {
      const q = query(
        collection(db, 'posts'),
        where('slug', '==', slug),
        where('published', '==', true),
        limit(1)
      )
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        const data = doc.data()
        console.log(`✅ [BlogService.getPostBySlug] Retrieved post: ${slug}`)
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
        } as BlogPost
      }
      console.log(`⚠️ [BlogService.getPostBySlug] Post not found: ${slug}`)
      return null
    },
    ['post-by-slug'],
    {
      revalidate: 7200, // 2 hours (increased from 30 minutes)
      tags: ['posts', 'single-post']
    }
  )

  static async getPostsWithPagination(offset: number, limitCount: number): Promise<BlogPost[]> {
    try {
      // First get all posts to determine the starting point
      const allPostsQuery = query(
        collection(db, 'posts'),
        where('published', '==', true),
        orderBy('createdAt', 'desc')
      )
      const allPostsSnapshot = await getDocs(allPostsQuery)

      // Get the posts we want (skip 'offset' number of documents)
      const docsToReturn = allPostsSnapshot.docs.slice(offset, offset + limitCount)

      return docsToReturn.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
        } as BlogPost
      })
    } catch (error) {
      console.error('Error in getPostsWithPagination:', error)
      throw error
    }
  }

  static async getTotalPostsCount(): Promise<number> {
    try {
      const q = query(
        collection(db, 'posts'),
        where('published', '==', true)
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.length
    } catch (error) {
      console.error('Error getting total posts count:', error)
      return 0
    }
  }

  static async updatePost(id: string, updates: Partial<BlogPost>): Promise<void> {
    const docRef = doc(db, 'posts', id)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    })
  }

  static async deletePost(id: string): Promise<void> {
    const docRef = doc(db, 'posts', id)
    await deleteDoc(docRef)
  }

  static async uploadMedia(file: File, userId: string): Promise<MediaFile> {
    const storageRef = ref(storage, `sharevault/${userId}/${Date.now()}_${file.name}`)
    const snapshot = await uploadBytes(storageRef, file)
    const url = await getDownloadURL(snapshot.ref)

    return {
      id: snapshot.metadata.fullPath,
      name: file.name,
      url: url,
      type: file.type,
      size: file.size,
      path: snapshot.metadata.fullPath,
      uploadedBy: userId,
      uploadedAt: new Date()
    }
  }

  static async deleteMedia(path: string): Promise<void> {
    const storageRef = ref(storage, path)
    await deleteObject(storageRef)
  }

  static async getPostsByCategory(category: string, limitCount?: number): Promise<BlogPost[]> {
    // Create a more efficient query that filters at database level
    let q = query(
      collection(db, 'posts'),
      where('published', '==', true),
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    )

    // Add limit if specified
    if (limitCount) {
      q = query(q, limit(limitCount))
    }

    const querySnapshot = await getDocs(q)
    console.log(`✅ [BlogService.getPostsByCategory] Retrieved ${querySnapshot.docs.length} posts for category "${category}"`, {
      category,
      limitCount,
      totalDocs: querySnapshot.docs.length
    })

    return querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
      } as BlogPost
    })
  }

  // Optimized method specifically for related posts (only fetch essential fields)
  // Get related posts with caching (cached for 20 minutes)
  static getRelatedPostsOptimized = unstable_cache(
    async (category: string, currentSlug: string, limitCount: number = 3): Promise<BlogPost[]> => {
      try {
        // First try to get posts from the same category
        const categoryQuery = query(
          collection(db, 'posts'),
          where('published', '==', true),
          where('category', '==', category),
          orderBy('createdAt', 'desc'),
          limit(limitCount + 1) // +1 to account for filtering out current post
        )

        const categorySnapshot = await getDocs(categoryQuery)
        const categoryPosts = categorySnapshot.docs
          .map(doc => {
            const data = doc.data()
            return {
              id: doc.id,
              slug: data.slug,
              title: data.title,
              excerpt: data.excerpt,
              category: data.category,
              imageUrl: data.imageUrl,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
              updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
            } as BlogPost
          })
          .filter(post => post.slug !== currentSlug)
          .slice(0, limitCount)

        console.log(`✅ [BlogService.getRelatedPostsOptimized] Found ${categoryPosts.length} related posts in category "${category}"`)

        // If we have enough posts from category, return them
        if (categoryPosts.length >= 2) {
          return categoryPosts.slice(0, 2)
        }

        // Otherwise, get some recent posts to fill the gap
        const recentQuery = query(
          collection(db, 'posts'),
          where('published', '==', true),
          orderBy('createdAt', 'desc'),
          limit(5) // Get 5 to have options after filtering
        )

        const recentSnapshot = await getDocs(recentQuery)
        const recentPosts = recentSnapshot.docs
          .map(doc => {
            const data = doc.data()
            return {
              id: doc.id,
              slug: data.slug,
              title: data.title,
              excerpt: data.excerpt,
              category: data.category,
              imageUrl: data.imageUrl,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
              updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
            } as BlogPost
          })
          .filter(post => post.slug !== currentSlug)

        // Combine category posts with recent posts, removing duplicates
        const allRelatedPosts = [...categoryPosts]
        const categoryPostSlugs = new Set(categoryPosts.map(p => p.slug))

        for (const recentPost of recentPosts) {
          if (!categoryPostSlugs.has(recentPost.slug) && allRelatedPosts.length < 2) {
            allRelatedPosts.push(recentPost)
          }
        }

        console.log(`✅ [BlogService.getRelatedPostsOptimized] Final result: ${allRelatedPosts.length} related posts`)
        return allRelatedPosts.slice(0, 2)

      } catch (error) {
        console.error('Error in getRelatedPostsOptimized:', error)
        return []
      }
    },
    ['related-posts'],
    {
      revalidate: 3600, // 1 hour (increased from 20 minutes)
      tags: ['posts', 'related-posts']
    }
  )

  // Get all unique categories from published posts
  static async getCategories(): Promise<string[]> {
    const q = query(
      collection(db, 'posts'),
      where('published', '==', true)
    )
    const querySnapshot = await getDocs(q)
    const categories = new Set<string>()

    querySnapshot.docs.forEach(doc => {
      const data = doc.data()
      if (data.category) {
        categories.add(data.category)
      }
    })

    return Array.from(categories).sort()
  }

  // Get categories with post counts (cached for 15 minutes)
  static getCategoriesWithCounts = unstable_cache(
    async (): Promise<Array<{ name: string, count: number, slug: string }>> => {
      const q = query(
        collection(db, 'posts'),
        where('published', '==', true)
      )
      const querySnapshot = await getDocs(q)
      const categoryMap = new Map<string, number>()

      querySnapshot.docs.forEach(doc => {
        const data = doc.data()
        if (data.category) {
          const current = categoryMap.get(data.category) || 0
          categoryMap.set(data.category, current + 1)
        }
      })

      console.log(`✅ [BlogService.getCategoriesWithCounts] Retrieved ${categoryMap.size} categories`)
      return Array.from(categoryMap.entries())
        .map(([name, count]) => ({
          name,
          count,
          slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        }))
        .sort((a, b) => b.count - a.count) // Sort by count descending
    },
    ['categories-with-counts'],
    {
      revalidate: 900, // 15 minutes
      tags: ['categories']
    }
  )

  // Get posts by category with pagination - OPTIMIZED
  static getPostsByCategoryWithPagination = unstable_cache(
    async (category: string, offset: number, limitCount: number): Promise<BlogPost[]> => {
      try {
        // Create optimized query that filters at database level
        const q = query(
          collection(db, 'posts'),
          where('published', '==', true),
          where('category', '==', category),
          orderBy('createdAt', 'desc')
        )

        const querySnapshot = await getDocs(q)
        console.log(`✅ [BlogService.getPostsByCategoryWithPagination] Retrieved ${querySnapshot.docs.length} posts for category "${category}"`, {
          category,
          offset,
          limitCount,
          totalDocs: querySnapshot.docs.length
        })

        // Apply pagination at the database level
        const paginatedDocs = querySnapshot.docs.slice(offset, offset + limitCount)

        return paginatedDocs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
          } as BlogPost
        })
      } catch (error) {
        console.error('Error in getPostsByCategoryWithPagination:', error)
        throw error
      }
    },
    ['category-posts-pagination'],
    {
      revalidate: 1800, // 30 minutes
      tags: ['posts', 'category-posts']
    }
  )

  // Get total posts count for a category - OPTIMIZED
  static getCategoryPostsCount = unstable_cache(
    async (category: string): Promise<number> => {
      try {
        const q = query(
          collection(db, 'posts'),
          where('published', '==', true),
          where('category', '==', category)
        )
        const querySnapshot = await getDocs(q)
        const count = querySnapshot.docs.length
        console.log(`✅ [BlogService.getCategoryPostsCount] Found ${count} posts for category "${category}"`)
        return count
      } catch (error) {
        console.error('Error getting category posts count:', error)
        return 0
      }
    },
    ['category-posts-count'],
    {
      revalidate: 1800, // 30 minutes
      tags: ['posts', 'category-counts']
    }
  )

  // Get draft posts (for admin)
  static async getDraftPosts(limitCount?: number): Promise<BlogPost[]> {
    let q;
    if (limitCount) {
      q = query(
        collection(db, 'posts'),
        where('published', '==', false),
        orderBy('updatedAt', 'desc'),
        limit(limitCount)
      )
    } else {
      q = query(
        collection(db, 'posts'),
        where('published', '==', false),
        orderBy('updatedAt', 'desc')
      )
    }
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
      } as BlogPost
    })
  }

  // Publish a draft post
  static async publishPost(id: string): Promise<void> {
    const docRef = doc(db, 'posts', id)
    await updateDoc(docRef, {
      published: true,
      updatedAt: new Date()
    })
  }

  // Unpublish a post (make it draft)
  static async unpublishPost(id: string): Promise<void> {
    const docRef = doc(db, 'posts', id)
    await updateDoc(docRef, {
      published: false,
      updatedAt: new Date()
    })
  }

  // Check if slug already exists
  static async isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, 'posts'),
        where('slug', '==', slug),
        limit(1)
      )
      const querySnapshot = await getDocs(q)

      // If no documents found, slug is unique
      if (querySnapshot.empty) return true

      // If we're editing a post, exclude it from the check
      if (excludeId) {
        const existingDoc = querySnapshot.docs[0]
        return existingDoc.id === excludeId
      }

      // Slug already exists
      return false
    } catch (error) {
      errorHandler.error('Error checking slug uniqueness', error as Error, {
        component: 'BlogService',
        action: 'isSlugUnique',
        metadata: { slug, excludeId }
      })
      // If there's an error, allow the slug (fail safe)
      return true
    }
  }

  // Optimized method to get post with related posts in a single operation
  static getPostWithRelatedPosts = unstable_cache(
    async (slug: string): Promise<{ post: BlogPost | null, relatedPosts: BlogPost[] }> => {
      try {
        // First get the main post
        const mainPostQuery = query(
          collection(db, 'posts'),
          where('slug', '==', slug),
          where('published', '==', true),
          limit(1)
        )

        const mainPostSnapshot = await getDocs(mainPostQuery)

        if (mainPostSnapshot.empty) {
          return { post: null, relatedPosts: [] }
        }

        const mainPostDoc = mainPostSnapshot.docs[0]
        const mainPostData = mainPostDoc.data()
        const mainPost = {
          id: mainPostDoc.id,
          ...mainPostData,
          createdAt: mainPostData.createdAt?.toDate ? mainPostData.createdAt.toDate() : mainPostData.createdAt,
          updatedAt: mainPostData.updatedAt?.toDate ? mainPostData.updatedAt.toDate() : mainPostData.updatedAt
        } as BlogPost

        // Get related posts from the same category (excluding current post)
        const relatedPostsQuery = query(
          collection(db, 'posts'),
          where('published', '==', true),
          where('category', '==', mainPost.category),
          where('slug', '!=', slug),
          orderBy('createdAt', 'desc'),
          limit(3)
        )

        const relatedPostsSnapshot = await getDocs(relatedPostsQuery)
        const relatedPosts = relatedPostsSnapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
          } as BlogPost
        })

        console.log(`✅ [BlogService.getPostWithRelatedPosts] Retrieved post "${slug}" with ${relatedPosts.length} related posts`)

        return { post: mainPost, relatedPosts }
      } catch (error) {
        console.error('Error in getPostWithRelatedPosts:', error)
        return { post: null, relatedPosts: [] }
      }
    },
    ['post-with-related-posts'],
    {
      revalidate: 1800, // 30 minutes
      tags: ['posts', 'single-post', 'related-posts']
    }
  )

  // Bulk delete posts
  static async bulkDeletePosts(postIds: string[]): Promise<void> {
    try {
      const deletePromises = postIds.map(id => {
        const docRef = doc(db, 'posts', id)
        return deleteDoc(docRef)
      })

      await Promise.all(deletePromises)
    } catch (error) {
      errorHandler.error('Error bulk deleting posts', error as Error, {
        component: 'BlogService',
        action: 'bulkDeletePosts',
        metadata: { postIds, count: postIds.length }
      })
      throw error
    }
  }

  // Lightweight method to get only slugs for generateStaticParams
  // This avoids the 2MB cache limit by fetching minimal data
  static getPostSlugsOnly = unstable_cache(
    async (): Promise<Array<{ slug: string }>> => {
      const q = query(
        collection(db, 'posts'),
        where('published', '==', true)
      )
      const querySnapshot = await getDocs(q)
      const slugs = querySnapshot.docs.map(doc => ({
        slug: doc.data().slug
      }))
      console.log(`✅ [BlogService.getPostSlugsOnly] Retrieved ${slugs.length} slugs for static params`)
      return slugs
    },
    ['post-slugs-only'],
    {
      revalidate: 3600, // 1 hour
      tags: ['posts', 'slugs']
    }
  )
}