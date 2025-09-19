interface StructuredDataProps {
  type: "Article" | "BlogPosting" | "WebSite" | "Organization"
  data: Record<string, any>
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": type,
    ...data,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  )
}

export function WebsiteStructuredData() {
  return (
    <StructuredData
      type="WebSite"
      data={{
        name: "MINDSHIFT",
        description: "Raw motivation and brutal honesty for personal growth",
        url: process.env.NEXT_PUBLIC_SITE_URL || "https://mindshift-blog.vercel.app",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || "https://mindshift-blog.vercel.app"}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
        publisher: {
          "@type": "Organization",
          name: "MINDSHIFT",
          logo: {
            "@type": "ImageObject",
            url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://mindshift-blog.vercel.app"}/logo.png`,
          },
        },
      }}
    />
  )
}

export function ArticleStructuredData({
  title,
  description,
  author,
  publishedTime,
  modifiedTime,
  image,
  url,
  category,
}: {
  title: string
  description: string
  author: string
  publishedTime: string
  modifiedTime?: string
  image?: string
  url: string
  category: string
}) {
  return (
    <StructuredData
      type="BlogPosting"
      data={{
        headline: title,
        description,
        image: image || `${process.env.NEXT_PUBLIC_SITE_URL || "https://mindshift-blog.vercel.app"}/og-image.png`,
        author: {
          "@type": "Person",
          name: author,
        },
        publisher: {
          "@type": "Organization",
          name: "MINDSHIFT",
          logo: {
            "@type": "ImageObject",
            url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://mindshift-blog.vercel.app"}/logo.png`,
          },
        },
        datePublished: publishedTime,
        dateModified: modifiedTime || publishedTime,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://mindshift-blog.vercel.app"}${url}`,
        },
        articleSection: category,
        keywords: ["motivation", "inspiration", "personal growth", "mindset", category.toLowerCase()],
      }}
    />
  )
}
