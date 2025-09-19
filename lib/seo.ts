import type { Metadata } from "next"

interface SEOProps {
  title: string
  description: string
  keywords?: string[]
  author?: string
  publishedTime?: string
  modifiedTime?: string
  section?: string
  tags?: string[]
  image?: string
  url?: string
}

export function generateSEO({
  title,
  description,
  keywords = [],
  author = "MINDSHIFT Team",
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  image = "/og-image.png",
  url,
}: SEOProps): Metadata {
  const siteName = "MINDSHIFT"
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mindshift-blog.vercel.app"
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl
  const imageUrl = image.startsWith("http") ? image : `${baseUrl}${image}`

  const allKeywords = [
    "motivation",
    "inspiration",
    "personal growth",
    "mindset",
    "self-improvement",
    "success",
    "discipline",
    "quotes",
    "brutal honesty",
    "raw motivation",
    ...keywords,
    ...tags,
  ]

  return {
    title: fullTitle,
    description,
    keywords: allKeywords.join(", "),
    authors: [{ name: author }],
    creator: author,
    publisher: siteName,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: section ? "article" : "website",
      title: fullTitle,
      description,
      url: fullUrl,
      siteName,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(section && { section }),
      ...(tags.length > 0 && { tags }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [imageUrl],
      creator: "@mindshift_blog",
      site: "@mindshift_blog",
    },
    alternates: {
      canonical: fullUrl,
    },
    category: section || "Personal Development",
  }
}

export const defaultSEO = generateSEO({
  title: "MINDSHIFT - Raw Motivation & Brutal Honesty",
  description:
    "Unfiltered motivation and brutal honesty for personal growth. Powerful quotes with context, actionable insights, and raw truth for those who refuse to settle.",
  keywords: ["motivational blog", "personal development", "self-help", "mindset coaching"],
})
