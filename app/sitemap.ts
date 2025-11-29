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
    {
      url: `${baseUrl}/dmca`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ]

  try {
    // Fetch posts with a reasonable limit to avoid cache issues
    const posts = await BlogService.getPosts(100)

    const blogPages = posts.map((post) => ({
      url: `${baseUrl}/${post.slug}`, // Using clean URLs without /blog/ prefix
      lastModified: post.updatedAt || post.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))

    // Fetch all categories and add them to sitemap
    const categories = await BlogService.getCategoriesWithCounts()

    const categoryPages = categories.map((category) => ({
      url: `${baseUrl}/category/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))

    return [...staticPages, ...blogPages, ...categoryPages]
  } catch (error) {
    console.error('Error fetching posts/categories for sitemap:', error)
    // Return static pages only if there's an error
    return staticPages
  }
}
