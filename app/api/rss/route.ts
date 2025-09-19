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

      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.excerpt || post.content?.substring(0, 200) || ''}]]></description>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
      <author>noreply@sharevault.in (ShareVault)</author>
      <category><![CDATA[${post.category || 'Blog'}]]></category>
      ${post.tags ? post.tags.map(tag => `<category><![CDATA[${tag}]]></category>`).join('\n      ') : ''}
      <enclosure url="${imageUrl}" type="${imageType}"/>
      <media:content url="${imageUrl}" type="${imageType}" medium="image" width="1200" height="630">
        <media:title><![CDATA[${post.title}]]></media:title>
        <media:description><![CDATA[${post.excerpt || post.content?.substring(0, 200) || ''}]]></media:description>
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
    <title>ShareVault - Inspiring Stories and Life Wisdom</title>
    <atom:link href="${siteUrl}/api/rss" rel="self" type="application/rss+xml"/>
    <link>${siteUrl}</link>
    <description>Discover inspiring stories, life wisdom, and personal growth insights to transform your life.</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <language>en-US</language>
    <sy:updatePeriod>hourly</sy:updatePeriod>
    <sy:updateFrequency>1</sy:updateFrequency>
    <generator>ShareVault RSS Generator</generator>
    <image>
      <url>${getImageUrl('logo.png')}</url>
      <title>ShareVault</title>
      <link>${siteUrl}</link>
      <width>144</width>
      <height>144</height>
    </image>
    <managingEditor>noreply@sharevault.in (ShareVault Team)</managingEditor>
    <webMaster>noreply@sharevault.in (ShareVault Team)</webMaster>
    <copyright>© ${new Date().getFullYear()} ShareVault. All rights reserved.</copyright>
    <category>Personal Development</category>
    <category>Inspiration</category>
    <category>Life Wisdom</category>
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