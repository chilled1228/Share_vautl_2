import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import { WebsiteStructuredData, OrganizationStructuredData } from "@/components/structured-data"
import { defaultSEO } from "@/lib/seo"
import { getCanonicalUrl } from "@/lib/seo-utils"
import DynamicFooter from "@/components/dynamic-footer"
import WebVitals from "@/components/web-vitals"
import { PerformanceMonitor } from "@/lib/performance"
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
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />

        <link rel="preconnect" href="https://shair-vault.firebaseapp.com" crossOrigin="" />
        <link rel="preconnect" href="https://www.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

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

        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />

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
          <Suspense fallback={<LoadingSkeleton />}>{children}</Suspense>
        </AuthProvider>
        <Analytics />
        <script dangerouslySetInnerHTML={{ __html: `
          // Initialize performance monitoring
          if (typeof window !== 'undefined') {
            window.addEventListener('load', () => {
              console.log('🚀 [Performance] Page fully loaded');
              // Initialize Web Vitals
              if ('PerformanceMonitor' in window) {
                PerformanceMonitor.initWebVitals();
              }
            });
          }
        `}} />
      </body>
    </html>
  )
}
