
import { BlogService } from '@/lib/blog-service'
import { getImageUrl } from '@/lib/seo-utils'

/**
 * Extract all images from post content (markdown and HTML)
 */
function extractImagesFromContent(content: string, siteUrl: string): string[] {
  if (!content) return []

  const images: string[] = []

  // Extract markdown images: ![alt](url)
  const mdRegex = /!\[.*?\]\(([^)]+)\)/g
  let match
  while ((match = mdRegex.exec(content)) !== null) {
    images.push(match[1])
  }

  // Extract HTML img tags: <img src="url">
  const htmlRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
  while ((match = htmlRegex.exec(content)) !== null) {
    images.push(match[1])
  }

  // Normalize URLs and filter
  return images
    .map(url => {
      // Make URL absolute
      if (url.startsWith('//')) return 'https:' + url
      if (url.startsWith('/')) return siteUrl + url
      if (!url.startsWith('http')) return siteUrl + '/' + url
      return url
    })
    .filter(url => {
      // Filter out non-content images (icons, logos, tracking pixels)
      return !url.match(/(icon|logo|button|avatar|spacer|pixel|tracking|badge)/i) &&
        url.match(/\.(jpg|jpeg|png|gif|webp|avif)(\?|$)/i)
    })
    .filter((url, index, self) => self.indexOf(url) === index) // Remove duplicates
}

/**
 * Escape special characters in XML attributes
 */
function escapeXmlAttribute(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Get image MIME type from URL
 */
function getImageType(imageUrl: string): string {
  if (imageUrl.includes('.webp')) return 'image/webp'
  if (imageUrl.includes('.png')) return 'image/png'
  if (imageUrl.includes('.gif')) return 'image/gif'
  if (imageUrl.includes('.avif')) return 'image/avif'
  return 'image/jpeg'
}

/**
 * Generate a single RSS item for an image
 */
function generateRssItem(
  post: any,
  imageUrl: string,
  imageIndex: number,
  siteUrl: string
): string {
  const postUrl = `${siteUrl}/${post.slug}`
  const imageType = getImageType(imageUrl)

  // Clean description
  const cleanDescription = (post.excerpt || post.content?.substring(0, 200) || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .trim()

  // Unique GUID for each image to prevent duplicates in Pinterest
  const guid = `${post.id}-img-${imageIndex}`

  // Estimate file size for enclosure
  const estimatedLength = imageType === 'image/webp' ? '50000' :
    imageType === 'image/png' ? '100000' : '75000'

  // Escape URLs for XML attributes
  const escapedImageUrl = escapeXmlAttribute(imageUrl)
  const escapedPostUrl = escapeXmlAttribute(postUrl)

  return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${cleanDescription}]]></description>
      <link>${escapedPostUrl}</link>
      <guid isPermaLink="false">${guid}</guid>
      <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
      <author>noreply@sharevault.in (ShareVault)</author>
      <category><![CDATA[${post.category || 'Blog'}]]></category>
      ${post.tags ? post.tags.map((tag: string) => `<category><![CDATA[${tag}]]></category>`).join('\n      ') : ''}
      <enclosure url="${escapedImageUrl}" type="${imageType}" length="${estimatedLength}"/>
      <media:content url="${escapedImageUrl}" type="${imageType}" medium="image" width="1200" height="630">
        <media:title><![CDATA[${post.title}]]></media:title>
        <media:description><![CDATA[${cleanDescription}]]></media:description>
      </media:content>
      <media:thumbnail url="${escapedImageUrl}" width="150" height="150"/>
    </item>`
}

export async function GET() {
  try {
    // Get ALL published posts for Pinterest
    const posts = await BlogService.getAllPosts()

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sharevault.in'

    // Generate one RSS item PER IMAGE (not per post)
    // This makes Pinterest create one pin per image
    const rssItems: string[] = []

    for (const post of posts) {
      // Collect all images: featured image + content images
      const allImages: string[] = []

      // Add featured image first
      let featuredImage = post.featuredImage || post.imageUrl
      if (featuredImage) {
        if (!featuredImage.startsWith('http')) {
          featuredImage = featuredImage.startsWith('/')
            ? `${siteUrl}${featuredImage}`
            : `${siteUrl}/${featuredImage}`
        }
        allImages.push(featuredImage)
      }

      // Extract and add inline content images
      const contentImages = extractImagesFromContent(post.content || '', siteUrl)
      for (const img of contentImages) {
        if (!allImages.includes(img)) {
          allImages.push(img)
        }
      }

      // If no images found, use default
      if (allImages.length === 0) {
        allImages.push(getImageUrl('og-image-blog.jpg'))
      }

      // Create one RSS item for each image
      allImages.forEach((imageUrl, index) => {
        rssItems.push(generateRssItem(post, imageUrl, index, siteUrl))
      })
    }

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:wfw="http://wellformedweb.org/CommentAPI/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:sy="http://purl.org/rss/1.0/modules/syndication/"
     xmlns:slash="http://purl.org/rss/1.0/modules/slash/"
     xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>ShareVault - Raw Motivation &amp; Brutal Honesty</title>
    <atom:link href="${siteUrl}/api/rss" rel="self" type="application/rss+xml"/>
    <link>${siteUrl}</link>
    <description>Unfiltered motivation and brutal honesty for personal growth. Powerful quotes with context, actionable insights, and raw truth for those who refuse to settle.</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <language>en-US</language>
    <sy:updatePeriod>hourly</sy:updatePeriod>
    <sy:updateFrequency>6</sy:updateFrequency>
    <generator>ShareVault RSS Generator</generator>
    <image>
      <url>${getImageUrl('logo.png')}</url>
      <title>ShareVault - Raw Motivation &amp; Brutal Honesty</title>
      <link>${siteUrl}</link>
      <width>144</width>
      <height>144</height>
    </image>
    <managingEditor>noreply@sharevault.in (ShareVault Team)</managingEditor>
    <webMaster>noreply@sharevault.in (ShareVault Team)</webMaster>
    <copyright>© ${new Date().getFullYear()} ShareVault. All rights reserved.</copyright>
    <category>Personal Development</category>
    <category>Motivation</category>
    <category>Inspiration</category>
    <category>Mindset</category>
    <category>Self Improvement</category>
    ${rssItems.join('')}
  </channel>
</rss>`

    return new Response(rss, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
      },
    })
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return new Response('Error generating RSS feed', { status: 500 })
  }
}

export const revalidate = 600 // Revalidate every 10 minutes for immediate Pinterest updates