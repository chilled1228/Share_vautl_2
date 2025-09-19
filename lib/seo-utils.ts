/**
 * SEO utilities for canonical URLs and other SEO functions
 */

export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sharevault.in'
export const SITE_EMAIL = process.env.NEXT_PUBLIC_SITE_EMAIL || 'blog.boopul@gmail.com'

export function getCanonicalUrl(path: string = ''): string {
  const cleanPath = path.replace(/^\/+/, '') // Remove leading slashes
  return cleanPath ? `${BASE_URL}/${cleanPath}` : BASE_URL
}

export function getImageUrl(imagePath: string): string {
  return imagePath.startsWith('http') ? imagePath : `${BASE_URL}/${imagePath.replace(/^\/+/, '')}`
}

export function getAuthorUrl(authorName: string): string {
  return getCanonicalUrl(`author/${authorName.toLowerCase().replace(/\s+/g, '-')}`)
}

export function getCategoryUrl(category: string): string {
  return getCanonicalUrl(`category/${category.toLowerCase().replace(/\s+/g, '-')}`)
}

export function getSearchUrl(query: string): string {
  return `${getCanonicalUrl('search')}?q=${encodeURIComponent(query)}`
}

export function getBlogUrl(): string {
  return getCanonicalUrl('blog')
}

export function getOgImageUrl(imageName: string = 'og-image.jpg'): string {
  return getImageUrl(imageName)
}

export function getAlternateUrls(path: string = ''): Record<string, string> {
  const cleanPath = path.replace(/^\/+/, '')
  
  return {
    'en-US': getCanonicalUrl(cleanPath),
    
    
  }
}

export function generateBlogPostCanonicalUrl(slug: string): string {
  return getCanonicalUrl(slug)
}

export function generateCategoryCanonicalUrl(category: string): string {
  return getCategoryUrl(category)
}

export function generatePaginationCanonicalUrl(baseUrl: string, page: number): string {
  return page === 1 ? getCanonicalUrl(baseUrl) : getCanonicalUrl(`${baseUrl}/page/${page}`)
}

export function shouldIndexPage(path: string): boolean {
  const noIndexPaths = [
    '/admin/',
    '/api/',
    '/private/',
    '/_next/',
    '/search',
    '/tag/',
  ]
  
  return !noIndexPaths.some(noIndexPath => path.startsWith(noIndexPath))
}

export function getRobotsMeta(path: string): {
  index: boolean
  follow: boolean
  googleBot?: {
    index: boolean
    follow: boolean
    'max-video-preview'?: number
    'max-image-preview'?: 'large' | 'standard' | 'none'
    'max-snippet'?: number
  }
} {
  const shouldIndex = shouldIndexPage(path)
  
  return {
    index: shouldIndex,
    follow: shouldIndex,
    googleBot: shouldIndex ? {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    } : {
      index: false,
      follow: false,
    },
  }
}