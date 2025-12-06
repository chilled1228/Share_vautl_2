'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { BlogService } from '@/lib/blog-service'
import { BlogPost } from '@/types/blog'

// Server action to update a post with revalidation
export async function updatePostWithRevalidation(id: string, updates: Partial<BlogPost>) {
  // Get the current post to check for slug changes
  const currentPost = await BlogService.getPostById(id)
  const oldSlug = currentPost?.slug

  // Update the post in the database
  await BlogService.updatePost(id, updates)

  // Revalidate the paths after successful update
  try {
    // Use tags for efficient cache invalidation
    revalidateTag('posts')
    revalidateTag('single-post')
    revalidateTag('all-posts')

    // Only revalidate specific paths that changed
    if (oldSlug) {
      revalidatePath(`/${oldSlug}`)
    }

    if (updates.slug && updates.slug !== oldSlug) {
      revalidatePath(`/${updates.slug}`)
    }

    // Revalidate category pages if category changed
    if (updates.category) {
      revalidateTag('category-posts')
      revalidatePath(`/category/${updates.category}`)
    }

    if (currentPost?.category && updates.category && currentPost.category !== updates.category) {
      revalidatePath(`/category/${currentPost.category}`)
    }

    // Revalidate admin pages
    revalidatePath('/admin/posts')

  } catch (revalidationError) {
    console.error('Error revalidating paths after post update:', revalidationError)
    // Don't throw here as the post update was successful
  }
}

// Server action to create a post with revalidation
export async function createPostWithRevalidation(post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>) {
  const postId = await BlogService.createPost(post)

  // Revalidate relevant paths after creating a new post
  try {
    // Use tags for efficient cache invalidation
    revalidateTag('posts')
    revalidateTag('all-posts')
    revalidateTag('featured-posts')

    if (post.category) {
      revalidateTag('category-posts')
      revalidatePath(`/category/${post.category}`)
    }

    // Revalidate admin pages
    revalidatePath('/admin/posts')
  } catch (revalidationError) {
    console.error('Error revalidating paths after post creation:', revalidationError)
  }

  return postId
}

// Server action to delete a post with revalidation
export async function deletePostWithRevalidation(id: string) {
  // Get post info before deletion for revalidation
  const postToDelete = await BlogService.getPostById(id)

  await BlogService.deletePost(id)

  // Revalidate relevant paths after deletion
  try {
    // Use tags for efficient cache invalidation
    revalidateTag('posts')
    revalidateTag('all-posts')
    revalidateTag('featured-posts')

    if (postToDelete?.slug) {
      revalidatePath(`/${postToDelete.slug}`)
    }

    if (postToDelete?.category) {
      revalidateTag('category-posts')
      revalidatePath(`/category/${postToDelete.category}`)
    }

    // Revalidate admin pages
    revalidatePath('/admin/posts')
  } catch (revalidationError) {
    console.error('Error revalidating paths after post deletion:', revalidationError)
  }
}

// Server action to publish a post with revalidation
export async function publishPostWithRevalidation(id: string) {
  const post = await BlogService.getPostById(id)
  await BlogService.publishPost(id)

  // Revalidate relevant paths
  try {
    // Use tags for efficient cache invalidation
    revalidateTag('posts')
    revalidateTag('all-posts')
    revalidateTag('featured-posts')

    if (post?.slug) {
      revalidatePath(`/${post.slug}`)
    }
    if (post?.category) {
      revalidateTag('category-posts')
      revalidatePath(`/category/${post.category}`)
    }

    // Revalidate admin pages
    revalidatePath('/admin/posts')
  } catch (revalidationError) {
    console.error('Error revalidating paths after publishing post:', revalidationError)
  }
}

// Server action to unpublish a post with revalidation
export async function unpublishPostWithRevalidation(id: string) {
  const post = await BlogService.getPostById(id)
  await BlogService.unpublishPost(id)

  // Revalidate relevant paths
  try {
    // Use tags for efficient cache invalidation
    revalidateTag('posts')
    revalidateTag('all-posts')
    revalidateTag('featured-posts')

    if (post?.slug) {
      revalidatePath(`/${post.slug}`)
    }
    if (post?.category) {
      revalidateTag('category-posts')
      revalidatePath(`/category/${post.category}`)
    }

    // Revalidate admin pages
    revalidatePath('/admin/posts')
  } catch (revalidationError) {
    console.error('Error revalidating paths after unpublishing post:', revalidationError)
  }
}

// Server action to revalidate paths after client-side post changes
export async function revalidateAfterPostChange(slug?: string, category?: string) {
  try {
    // Use tags for efficient cache invalidation
    revalidateTag('posts')
    revalidateTag('all-posts')

    if (slug) {
      revalidatePath(`/${slug}`)
    }

    if (category) {
      revalidateTag('category-posts')
      revalidatePath(`/category/${category}`)
    }

    // Revalidate admin pages
    revalidatePath('/admin/posts')

    return { success: true }
  } catch (error) {
    console.error('Error revalidating paths:', error)
    return { success: false, error: 'Failed to revalidate paths' }
  }
}