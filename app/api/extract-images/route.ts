import { NextRequest, NextResponse } from 'next/server'
import { BlogService } from '@/lib/blog-service'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sharevault.in'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    let dbFeaturedImage: string | null = null
    let dbImages: string[] = []

    // Check if URL is from our own site
    if (url.includes(siteUrl) || url.includes('sharevault.in')) {
      // Extract slug from URL
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/').filter(Boolean)
      const slug = pathParts[pathParts.length - 1]

      if (slug) {
        try {
          // Fetch post from database by slug
          const post = await BlogService.getPostBySlug(slug)
          if (post) {
            // Get featured image from database
            dbFeaturedImage = post.featuredImage || post.imageUrl || null

            // Add database featured image to images array
            if (dbFeaturedImage) {
              dbImages = [dbFeaturedImage]
            }
          }
        } catch (error) {
          console.log('Could not fetch post from database:', error)
        }
      }
    }

    // Fetch the HTML content from the URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch URL' }, { status: 400 })
    }

    const html = await response.text()

    // Extract images from HTML
    const htmlImages = extractImages(html, url)

    // Extract OpenGraph image
    const ogImage = extractOpenGraphImage(html, url)

    // Extract Twitter Card image
    const twitterImage = extractTwitterCardImage(html, url)

    // Combine database images with HTML images (prioritize database)
    const allImages = [...dbImages, ...htmlImages.filter(img => !dbImages.includes(img))]

    return NextResponse.json({
      success: true,
      images: allImages,
      featuredImage: dbFeaturedImage || ogImage || twitterImage || allImages[0] || null,
      fromDatabase: !!dbFeaturedImage
    })

  } catch (error) {
    console.error('Error extracting images:', error)
    return NextResponse.json(
      { error: 'Failed to extract images from URL' },
      { status: 500 }
    )
  }
}

function extractImages(html: string, baseUrl: string): string[] {
  const images: string[] = []
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
  let match

  while ((match = imgRegex.exec(html)) !== null) {
    let src = match[1]

    // Convert relative URLs to absolute
    if (src.startsWith('//')) {
      src = 'https:' + src
    } else if (src.startsWith('/')) {
      const url = new URL(baseUrl)
      src = url.origin + src
    } else if (!src.startsWith('http://') && !src.startsWith('https://')) {
      const url = new URL(baseUrl)
      src = url.origin + '/' + src.replace(/^\//, '')
    }

    // Filter out common non-content images
    if (!src.match(/(icon|logo|button|avatar|thumbnail-small|spacer|pixel|tracking)/i) &&
        src.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      images.push(src)
    }
  }

  // Remove duplicates and limit to reasonable number
  return [...new Set(images)].slice(0, 20)
}

function extractOpenGraphImage(html: string, baseUrl: string): string | null {
  const ogRegex = /<meta[^>]+property="og:image"[^>]+content=["']([^"']+)["'][^>]*>/i
  const match = ogRegex.exec(html)

  if (match) {
    let src = match[1]

    // Convert relative URLs to absolute
    if (src.startsWith('//')) {
      src = 'https:' + src
    } else if (src.startsWith('/')) {
      const url = new URL(baseUrl)
      src = url.origin + src
    } else if (!src.startsWith('http://') && !src.startsWith('https://')) {
      const url = new URL(baseUrl)
      src = url.origin + '/' + src.replace(/^\//, '')
    }

    return src
  }

  return null
}

function extractTwitterCardImage(html: string, baseUrl: string): string | null {
  const twitterRegex = /<meta[^>]+name="twitter:image"[^>]+content=["']([^"']+)["'][^>]*>/i
  const match = twitterRegex.exec(html)

  if (match) {
    let src = match[1]

    // Convert relative URLs to absolute
    if (src.startsWith('//')) {
      src = 'https:' + src
    } else if (src.startsWith('/')) {
      const url = new URL(baseUrl)
      src = url.origin + src
    } else if (!src.startsWith('http://') && !src.startsWith('https://')) {
      const url = new URL(baseUrl)
      src = url.origin + '/' + src.replace(/^\//, '')
    }

    return src
  }

  return null
}