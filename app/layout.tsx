import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { WebsiteStructuredData, OrganizationStructuredData } from "@/components/structured-data"
import { defaultSEO } from "@/lib/seo"
import { getCanonicalUrl } from "@/lib/seo-utils"
import WebVitals from "@/components/web-vitals"
import { AuthProvider } from "@/lib/auth-context"
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
        {/* Critical resource hints for performance */}
        <link rel="dns-prefetch" href="//shair-vault.firebaseapp.com" />
        <link rel="dns-prefetch" href="//www.gstatic.com" />

        <link rel="preconnect" href="https://shair-vault.firebaseapp.com" crossOrigin="" />
        <link rel="preconnect" href="https://www.gstatic.com" crossOrigin="" />

        {/* Preload critical Firebase Auth script */}
        <link
          rel="modulepreload"
          href="https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js"
          as="script"
          crossOrigin=""
        />

        {/* Structured data */}
        <WebsiteStructuredData />
        <OrganizationStructuredData />

        {/* RSS and manifest */}
        <link rel="alternate" type="application/rss+xml" title="ShareVault RSS Feed" href="/api/rss" />
        <link rel="manifest" href="/manifest.json" />

        {/* Favicons - SVG first, with fallbacks */}
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/logo.svg" />
        <link rel="icon" type="image/png" sizes="16x16" href="/logo.svg" />

        {/* Meta tags */}
        <meta name="theme-color" content="#1a0b2e" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION} />

        {/* Critical CSS inline for above-the-fold content */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical CSS for initial render */
            .brutalist-border { border: 4px solid #1B1D1B; }
            .brutalist-shadow { box-shadow: 8px 8px 0px #1B1D1B; }
            .brutalist-border-thick { border: 6px solid #1B1D1B; }
            .font-black { font-weight: 900; }
            .bg-primary { background-color: #4B7A6D; }
            .bg-secondary { background-color: #DEA486; }
            .bg-accent { background-color: #4B7A6D; }
            .bg-destructive { background-color: #CC4444; }
            .text-primary-foreground { color: #1B1D1B; }
            .text-secondary-foreground { color: #1B1D1B; }
            .text-accent-foreground { color: #FFFFFF; }
            .text-destructive-foreground { color: #FFFFFF; }
          `
        }} />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <WebVitals />
        <AuthProvider>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-2xl font-black">LOADING...</div></div>}>{children}</Suspense>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
