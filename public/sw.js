// High-performance Service Worker with comprehensive caching
const CACHE_NAME = 'sharevault-cache-v2'
const FIREBASE_CACHE = 'firebase-auth-v2'
const IMAGES_CACHE = 'images-cache-v2'
const API_CACHE = 'api-cache-v2'
const STATIC_CACHE = 'static-cache-v2'

// Cache versioning for automatic cleanup
const CACHE_VERSION = '2.0.0'

// Critical resources to cache immediately for offline support
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html' // Add offline fallback page
]

// Critical JavaScript chunks to cache
const JS_ASSETS = [
  '/_next/static/chunks/framework-*.js',
  '/_next/static/chunks/main-*.js',
  '/_next/static/chunks/webpack-*.js',
  '/_next/static/chunks/pages/_app-*.js'
]

// Firebase resources to cache aggressively
const FIREBASE_ASSETS = [
  'https://shair-vault.firebaseapp.com/__/auth/iframe.js',
  'https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js'
]

// Performance monitoring
const PERFORMANCE_CACHE = 'performance-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_ASSETS)
      }),
      // Cache Firebase assets
      caches.open(FIREBASE_CACHE).then((cache) => {
        return Promise.allSettled(
          FIREBASE_ASSETS.map(url =>
            fetch(url).then(response => {
              if (response.ok) {
                return cache.put(url, response);
              }
              console.warn(`Failed to cache Firebase asset: ${url}`);
            }).catch(error => {
              console.warn(`Error caching Firebase asset ${url}:`, error);
            })
          )
        )
      })
    ]).then(() => {
      self.skipWaiting()
    })
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            const currentCaches = [
              CACHE_NAME, FIREBASE_CACHE, IMAGES_CACHE,
              API_CACHE, STATIC_CACHE, PERFORMANCE_CACHE
            ]
            if (!currentCaches.includes(cacheName)) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      // Claim all clients immediately
      self.clients.claim(),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle Firebase auth iframe - cache first strategy
  if (url.hostname === 'shair-vault.firebaseapp.com' &&
      url.pathname.includes('auth/iframe.js')) {
    event.respondWith(
      caches.open(FIREBASE_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            // Return cached version immediately
            return cachedResponse
          }

          // Fetch and cache
          return fetch(request).then((response) => {
            if (response.status === 200) {
              const responseClone = response.clone()
              cache.put(request, responseClone)
            }
            return response
          })
        })
      })
    )
    return
  }

  // Handle R2 images - cache with 30-day TTL
  if (url.hostname === 'pub-141831e61e69445289222976a15b6fb3.r2.dev') {
    event.respondWith(
      caches.open(IMAGES_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          let staleResponse = cachedResponse
          // Check if cached response is still fresh (30 days)
          if (cachedResponse) {
            const cachedDate = new Date(cachedResponse.headers.get('sw-cached-date') || cachedResponse.headers.get('date'))
            if (!isNaN(cachedDate.getTime())) {
              const now = new Date()
              const thirtyDays = 30 * 24 * 60 * 60 * 1000

              if (now - cachedDate < thirtyDays) {
                return cachedResponse
              }
            }
          }

          // Fetch new version
          return fetch(request).then((response) => {
            if (response.status === 200) {
              const responseClone = response.clone()
              // Add custom header to track cache date
              const headers = new Headers(responseClone.headers)
              headers.set('sw-cached-date', new Date().toISOString())

              const cachedResponse = new Response(responseClone.body, {
                status: responseClone.status,
                statusText: responseClone.statusText,
                headers: headers
              })

              cache.put(request, cachedResponse)
            }
            return response
          }).catch(() => {
            // Return stale cache if network fails
            return staleResponse || new Response('Image not available', { status: 404 })
          })
        })
      })
    )
    return
  }

  // Handle other Firebase resources
  if (url.hostname.includes('firebase') || url.hostname.includes('gstatic.com')) {
    event.respondWith(
      caches.open(FIREBASE_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          return cachedResponse || fetch(request).then((response) => {
            if (response.status === 200) {
              cache.put(request, response.clone())
            }
            return response
          })
        })
      })
    )
    return
  }

  // Handle Next.js static assets with long-term caching
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }

          return fetch(request).then((response) => {
            if (response.status === 200) {
              // Cache static assets for 1 year
              const responseClone = response.clone()
              cache.put(request, responseClone)
            }
            return response
          })
        })
      })
    )
    return
  }

  // Handle API routes with optimized stale-while-revalidate
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(API_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          // Check if cache is still fresh (5 minutes for API)
          let isFresh = false
          if (cachedResponse) {
            const cachedDate = new Date(cachedResponse.headers.get('sw-cached-date'))
            if (!isNaN(cachedDate.getTime())) {
              const now = new Date()
              const fiveMinutes = 5 * 60 * 1000
              isFresh = now - cachedDate < fiveMinutes
            }
          }

          const fetchPromise = fetch(request).then((response) => {
            if (response.status === 200) {
              const responseClone = response.clone()
              const headers = new Headers(responseClone.headers)
              headers.set('sw-cached-date', new Date().toISOString())

              const cachedResponse = new Response(responseClone.body, {
                status: responseClone.status,
                statusText: responseClone.statusText,
                headers: headers
              })

              cache.put(request, cachedResponse)
            }
            return response
          })

          // Return fresh cache immediately, or fetch if stale/missing
          if (isFresh) {
            // Background update for fresh cache
            fetchPromise.catch(() => {})
            return cachedResponse
          }

          // Return fresh data, fallback to stale cache on failure
          return fetchPromise.catch(() => cachedResponse || new Response('API unavailable', { status: 503 }))
        })
      })
    )
    return
  }

  // Default: network first for other requests
  event.respondWith(fetch(request))
})