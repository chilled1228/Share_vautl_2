import { NextRequest, NextResponse } from 'next/server'

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
    const images = extractImages(html, url)

    // Extract OpenGraph image
    const ogImage = extractOpenGraphImage(html, url)

    // Extract Twitter Card image
    const twitterImage = extractTwitterCardImage(html, url)

    return NextResponse.json({
      success: true,
      images,
      featuredImage: ogImage || twitterImage || images[0] || null
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