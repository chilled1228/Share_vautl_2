import type { MetadataRoute } from "next"
import { BlogService } from "@/lib/blog-service"

export async function GET(): Promise<Response> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sharevault.in"

  try {
    // Fetch posts with a reasonable limit to avoid cache issues
    const posts = await BlogService.getPosts(100)

    // Create XML content for image sitemap
    const images = posts
      .filter(post => post.featuredImage || post.imageUrl) // Only posts with images
      .map(post => {
        const imageUrl = post.featuredImage || post.imageUrl
        const postUrl = `${baseUrl}/${post.slug}`

        return `
    <url>
      <loc>${postUrl}</loc>
      <image:image>
        <image:loc>${imageUrl}</image:loc>
        <image:title>${post.title}</image:title>
        <image:caption>${post.excerpt}</image:caption>
      </image:image>
    </url>`
      })
      .join('')

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${images}
</urlset>`

    return new Response(xmlContent, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    console.error('Error generating image sitemap:', error)

    // Return empty sitemap on error
    const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
</urlset>`

    return new Response(emptyXml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=300',
      },
    })
  }
}