'use client'

import { useEffect } from 'react'

// Performance thresholds for scoring
const PERFORMANCE_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 }
}

function getPerformanceRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = PERFORMANCE_THRESHOLDS[metric as keyof typeof PERFORMANCE_THRESHOLDS]
  if (!threshold) return 'good'

  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

export default function WebVitals() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

    let clsValue = 0
    const performanceData: Record<string, number> = {}

    // Monitor Core Web Vitals with proper attribution
    const observePerformance = () => {
      // LCP Observer with detailed information
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as any
          const value = lastEntry.startTime
          const rating = getPerformanceRating('LCP', value)

          performanceData.LCP = value
          console.log(`🎯 [LCP] ${value.toFixed(0)}ms (${rating})`, {
            element: lastEntry.element?.tagName || 'unknown',
            url: lastEntry.url || 'unknown'
          })

          // Store for potential analytics
          if (typeof gtag !== 'undefined') {
            gtag('event', 'web_vitals', {
              event_category: 'performance',
              event_label: 'LCP',
              value: Math.round(value),
              custom_map: { metric_rating: rating }
            })
          }
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      } catch (e) {
        console.warn('LCP monitoring failed:', e)
      }

      // FID/INP Observer
      try {
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const value = (entry as any).processingStart - entry.startTime
            const rating = getPerformanceRating('FID', value)

            performanceData.FID = value
            console.log(`👆 [FID] ${value.toFixed(0)}ms (${rating})`)
          }
        })
        fidObserver.observe({ entryTypes: ['first-input'] })

        // Also observe INP for newer browsers
        const inpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const value = (entry as any).processingStart - entry.startTime
            const rating = getPerformanceRating('INP', value)

            performanceData.INP = value
            console.log(`🔄 [INP] ${value.toFixed(0)}ms (${rating})`)
          }
        })
        inpObserver.observe({ entryTypes: ['event'] })
      } catch (e) {
        console.warn('FID/INP monitoring failed:', e)
      }

      // CLS Observer with session tracking
      try {
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value
              const rating = getPerformanceRating('CLS', clsValue)

              performanceData.CLS = clsValue
              console.log(`📐 [CLS] ${clsValue.toFixed(3)} (${rating})`)
            }
          }
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
      } catch (e) {
        console.warn('CLS monitoring failed:', e)
      }

      // FCP Observer
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          for (const entry of entries) {
            if (entry.name === 'first-contentful-paint') {
              const value = entry.startTime
              const rating = getPerformanceRating('FCP', value)

              performanceData.FCP = value
              console.log(`🎨 [FCP] ${value.toFixed(0)}ms (${rating})`)
            }
          }
        })
        fcpObserver.observe({ entryTypes: ['paint'] })
      } catch (e) {
        console.warn('FCP monitoring failed:', e)
      }

      // Resource timing and other performance metrics
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          let totalResources = 0
          let totalSize = 0

          for (const entry of entries) {
            totalResources++
            totalSize += (entry as any).transferSize || 0
          }

          if (totalResources > 0) {
            console.log(`📦 [Resources] ${totalResources} resources, ${(totalSize / 1024).toFixed(0)}KB total`)
          }
        })
        resourceObserver.observe({ entryTypes: ['resource'] })
      } catch (e) {
        console.warn('Resource monitoring failed:', e)
      }
    }

    // Initialize monitoring
    observePerformance()

    // TTFB from Navigation API
    const measureTTFB = () => {
      const navigationEntries = performance.getEntriesByType('navigation')
      if (navigationEntries.length > 0) {
        const entry = navigationEntries[0] as PerformanceNavigationTiming
        const ttfb = entry.responseStart - entry.requestStart
        const rating = getPerformanceRating('TTFB', ttfb)

        performanceData.TTFB = ttfb
        console.log(`⚡ [TTFB] ${ttfb.toFixed(0)}ms (${rating})`)
      }
    }

    // Measure TTFB after navigation
    if (document.readyState === 'complete') {
      measureTTFB()
    } else {
      window.addEventListener('load', measureTTFB)
    }

    // Performance summary on page unload
    const logPerformanceSummary = () => {
      const metrics = Object.entries(performanceData)
      if (metrics.length > 0) {
        console.log('📊 Performance Summary:', performanceData)

        // Calculate overall score (simplified)
        const scores = metrics.map(([metric, value]) => {
          const rating = getPerformanceRating(metric, value)
          return rating === 'good' ? 100 : rating === 'needs-improvement' ? 60 : 25
        })
        const overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length

        console.log(`🏆 Overall Performance Score: ${overallScore.toFixed(0)}/100`)
      }
    }

    window.addEventListener('beforeunload', logPerformanceSummary)

    // Cleanup
    return () => {
      window.removeEventListener('load', measureTTFB)
      window.removeEventListener('beforeunload', logPerformanceSummary)
    }
  }, [])

  return null
}