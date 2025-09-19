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
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
    ],
    categories: ['lifestyle', 'education', 'productivity'],
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'en',
    dir: 'ltr',
  }
}