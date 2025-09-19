import type { MetadataRoute } from "next"
import { BlogService } from "@/lib/blog-service"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sharevault.in"

  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/quotes`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ]

  try {
    // Fetch all blog posts from Firebase
    const posts = await BlogService.getPosts()

    const blogPages = posts.map((post) => ({
      url: `${baseUrl}/${post.slug}`, // Using clean URLs without /blog/ prefix
      lastModified: post.updatedAt || post.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))

    return [...staticPages, ...blogPages]
  } catch (error) {
    console.error('Error fetching posts for sitemap:', error)
    // Return static pages only if there's an error
    return staticPages
  }
}
