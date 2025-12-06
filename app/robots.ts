import type { MetadataRoute } from "next"

// Cache robots.txt for 24 hours
export const revalidate = 86400

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sharevault.in"

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      {
        userAgent: "Googlebot-Image",
        allow: "/",
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
