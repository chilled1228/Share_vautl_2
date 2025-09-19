export default function OrganizationSchema() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ShareVault",
    "description": "Raw motivation and brutal honesty for personal growth",
    "url": process.env.NEXT_PUBLIC_SITE_URL || "https://www.sharevault.in",
    "logo": {
      "@type": "ImageObject",
      "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.sharevault.in"}/logo.png`,
      "width": 200,
      "height": 60
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "blog.boopul@gmail.com",
      "contactType": "customer service"
    },
    "sameAs": [
      "https://twitter.com/sharevault",
      "https://facebook.com/sharevault",
      "https://instagram.com/sharevault"
    ],
    "foundingDate": "2024",
    "founder": {
      "@type": "Person",
      "name": "SHAREVAULT TEAM"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
    />
  )
}