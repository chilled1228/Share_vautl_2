import { BlogService } from '@/lib/blog-service'
import { getCanonicalUrl, getImageUrl } from '@/lib/seo-utils'

export async function GET() {
  try {
    // Pinterest processes 200 pins/day and checks oldest first, so limit to recent posts
    const posts = await BlogService.getPosts(200) // Optimal for Pinterest's daily limit
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sharevault.in'

    const rssItems = posts.map(post => {
      const postUrl = `${siteUrl}/${post.slug}`
      const imageUrl = post.imageUrl ?
        (post.imageUrl.startsWith('http') ? post.imageUrl : `${siteUrl}${post.imageUrl}`) :
        getImageUrl('og-image-blog.jpg')

      // Get proper image type from URL extension
      const imageType = imageUrl.includes('.webp') ? 'image/webp' :
                       imageUrl.includes('.png') ? 'image/png' : 'image/jpeg'

      // Clean description by removing HTML tags and properly escaping
      const cleanDescription = (post.excerpt || post.content?.substring(0, 200) || '')
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&/g, '&amp;') // Escape ampersands
        .replace(/</g, '&lt;') // Escape less than
        .replace(/>/g, '&gt;') // Escape greater than
        .trim()

      // For media:description, use plain text without any HTML entities
      const plainDescription = (post.excerpt || post.content?.substring(0, 200) || '')
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&[^;]+;/g, '') // Remove all HTML entities
        .replace(/[<>]/g, '') // Remove any remaining angle brackets
        .trim()

      // Estimate file size for enclosure (required attribute)
      const estimatedLength = imageType === 'image/webp' ? '50000' :
                             imageType === 'image/png' ? '100000' : '75000'

      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${cleanDescription}]]></description>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
      <author>noreply@sharevault.in (ShareVault)</author>
      <category><![CDATA[${post.category || 'Blog'}]]></category>
      ${post.tags ? post.tags.map(tag => `<category><![CDATA[${tag}]]></category>`).join('\n      ') : ''}
      <enclosure url="${imageUrl}" type="${imageType}" length="${estimatedLength}"/>
      <media:content url="${imageUrl}" type="${imageType}" medium="image" width="1200" height="630">
        <media:title><![CDATA[${post.title}]]></media:title>
        <media:description><![CDATA[${plainDescription}]]></media:description>
      </media:content>
    </item>`
    }).join('')

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
    <sy:updateFrequency>1</sy:updateFrequency>
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
    ${rssItems}
  </channel>
</rss>`

    return new Response(rss, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return new Response('Error generating RSS feed', { status: 500 })
  }
}

export const revalidate = 1800 // Revalidate every 30 minutes for faster Pinterest updates