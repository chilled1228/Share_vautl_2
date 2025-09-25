import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ShareVault - Raw Motivation & Brutal Honesty',
    short_name: 'ShareVault',
    description: 'Unfiltered motivation and brutal honesty for personal growth. Powerful quotes with context, actionable insights, and raw truth for those who refuse to settle.',
    start_url: '/',
    display: 'standalone',
    background_color: '#1a0b2e',
    theme_color: '#1a0b2e',
    icons: [
      {
        src: '/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any maskable',
      },
      {
        src: '/logo.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any maskable',
      },
      {
        src: '/logo.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any maskable',
      },
    ],
    categories: ['lifestyle', 'education', 'productivity'],
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'en',
    dir: 'ltr',
  }
}