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
        name: "ShareVault",
        description: "Raw motivation and brutal honesty for personal growth",
        url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.sharevault.in",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.sharevault.in"}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
        publisher: {
          "@type": "Organization",
          name: "ShareVault",
          logo: {
            "@type": "ImageObject",
            url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.sharevault.in"}/logo.png`,
          },
        },
      }}
    />
  )
}

export function OrganizationStructuredData() {
  return (
    <StructuredData
      type="Organization"
      data={{
        name: "ShareVault",
        description: "Raw motivation and brutal honesty for personal growth",
        url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.sharevault.in",
        logo: {
          "@type": "ImageObject",
          url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.sharevault.in"}/logo.png`,
          width: 200,
          height: 60
        },
        contactPoint: {
          "@type": "ContactPoint",
          email: "blog.boopul@gmail.com",
          contactType: "customer service"
        },
        sameAs: [
          "https://twitter.com/sharevault",
          "https://facebook.com/sharevault",
          "https://instagram.com/sharevault"
        ],
        foundingDate: "2024",
        founder: {
          "@type": "Person",
          name: "MINDSHIFT TEAM"
        },
        address: {
          "@type": "PostalAddress",
          addressCountry: "IN"
        }
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
        image: image || `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.sharevault.in"}/og-image.png`,
        author: {
          "@type": "Person",
          name: author,
        },
        publisher: {
          "@type": "Organization",
          name: "ShareVault",
          logo: {
            "@type": "ImageObject",
            url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.sharevault.in"}/logo.png`,
          },
        },
        datePublished: publishedTime,
        dateModified: modifiedTime || publishedTime,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.sharevault.in"}${url}`,
        },
        articleSection: category,
        keywords: ["motivation", "inspiration", "personal growth", "mindset", "sharevault", category.toLowerCase()],
      }}
    />
  )
}
