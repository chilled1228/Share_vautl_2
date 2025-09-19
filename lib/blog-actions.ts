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
    // Revalidate home page
    revalidatePath('/')
    
    // Revalidate blog listing page
    revalidatePath('/blog')
    
    // Revalidate the specific post page (old slug if it changed)
    if (oldSlug) {
      revalidatePath(`/${oldSlug}`)
    }
    
    // Revalidate the new post page if slug changed
    if (updates.slug && updates.slug !== oldSlug) {
      revalidatePath(`/${updates.slug}`)
    }
    
    // Revalidate category page if category exists
    if (updates.category) {
      revalidatePath(`/category/${updates.category}`)
    }
    
    // Revalidate old category page if category changed
    if (currentPost?.category && updates.category && currentPost.category !== updates.category) {
      revalidatePath(`/category/${currentPost.category}`)
    }
    
    // Revalidate admin pages
    revalidatePath('/admin/posts')
    
    // Use tags for broader cache invalidation
    revalidateTag('posts')
    revalidateTag('blog-posts')
    
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
    revalidatePath('/')
    revalidatePath('/blog')
    revalidatePath('/admin/posts')
    if (post.category) {
      revalidatePath(`/category/${post.category}`)
    }
    revalidateTag('posts')
    revalidateTag('blog-posts')
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
    revalidatePath('/')
    revalidatePath('/blog')
    revalidatePath('/admin/posts')
    
    if (postToDelete?.slug) {
      revalidatePath(`/${postToDelete.slug}`)
    }
    
    if (postToDelete?.category) {
      revalidatePath(`/category/${postToDelete.category}`)
    }
    
    revalidateTag('posts')
    revalidateTag('blog-posts')
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
    revalidatePath('/')
    revalidatePath('/blog')
    revalidatePath('/admin/posts')
    if (post?.slug) {
      revalidatePath(`/${post.slug}`)
    }
    if (post?.category) {
      revalidatePath(`/category/${post.category}`)
    }
    revalidateTag('posts')
    revalidateTag('blog-posts')
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
    revalidatePath('/')
    revalidatePath('/blog')
    revalidatePath('/admin/posts')
    if (post?.slug) {
      revalidatePath(`/${post.slug}`)
    }
    if (post?.category) {
      revalidatePath(`/category/${post.category}`)
    }
    revalidateTag('posts')
    revalidateTag('blog-posts')
  } catch (revalidationError) {
    console.error('Error revalidating paths after unpublishing post:', revalidationError)
  }
}