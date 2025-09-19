import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { WebsiteStructuredData, OrganizationStructuredData } from "@/components/structured-data"
import { defaultSEO } from "@/lib/seo"
import { getCanonicalUrl } from "@/lib/seo-utils"
import "./globals.css"

export const metadata: Metadata = {
  ...defaultSEO,
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sharevault.in'),
  alternates: {
    canonical: getCanonicalUrl(),
    types: {
      'application/rss+xml': [
        { url: '/api/rss', title: 'ShareVault RSS Feed' }
      ]
    }
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <WebsiteStructuredData />
        <OrganizationStructuredData />
        <link rel="alternate" type="application/rss+xml" title="ShareVault RSS Feed" href="/api/rss" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1a0b2e" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION} />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
