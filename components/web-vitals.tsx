'use client'

import { useEffect } from 'react'

export default function WebVitals() {
  useEffect(() => {
    // Initialize Web Vitals monitoring
    if (typeof window !== 'undefined') {
      // Monitor LCP (Largest Contentful Paint)
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            if (entries.length > 0) {
              const lastEntry = entries[entries.length - 1]
              console.log(`📊 [LCP] Largest Contentful Paint: ${lastEntry.startTime.toFixed(2)}ms`)
            }
          })
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        } catch (e) {
          console.warn('LCP monitoring not supported:', e)
        }

        // Monitor FID (First Input Delay)
        try {
          const fidObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              const fid = (entry as any).processingStart - entry.startTime
              console.log(`📊 [FID] First Input Delay: ${fid.toFixed(2)}ms`)
            }
          })
          fidObserver.observe({ entryTypes: ['first-input'] })
        } catch (e) {
          console.warn('FID monitoring not supported:', e)
        }

        // Monitor CLS (Cumulative Layout Shift)
        try {
          const clsObserver = new PerformanceObserver((list) => {
            let cls = 0
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                cls += (entry as any).value
              }
            }
            console.log(`📊 [CLS] Cumulative Layout Shift: ${cls.toFixed(3)}`)
          })
          clsObserver.observe({ entryTypes: ['layout-shift'] })
        } catch (e) {
          console.warn('CLS monitoring not supported:', e)
        }

        // Monitor FCP (First Contentful Paint)
        try {
          const fcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            if (entries.length > 0) {
              console.log(`📊 [FCP] First Contentful Paint: ${entries[0].startTime.toFixed(2)}ms`)
            }
          })
          fcpObserver.observe({ entryTypes: ['paint'] })
        } catch (e) {
          console.warn('FCP monitoring not supported:', e)
        }

        // Monitor TTFB (Time to First Byte)
        const navigationEntries = performance.getEntriesByType('navigation')
        if (navigationEntries.length > 0) {
          const navigationEntry = navigationEntries[0] as PerformanceNavigationTiming
          const ttfb = navigationEntry.responseStart - navigationEntry.requestStart
          console.log(`📊 [TTFB] Time to First Byte: ${ttfb.toFixed(2)}ms`)
        }
      }
    }

    // Report performance metrics
    const reportWebVitals = (metric: any) => {
      console.log(`📈 [Web Vital] ${metric.name}: ${metric.value.toFixed(2)}ms`, {
        id: metric.id,
        value: metric.value,
        rating: metric.rating
      })
    }

    // Simulate web vitals reporting (in production, this would send to analytics)
    if (typeof window !== 'undefined' && (window as any).webVitals) {
      ;(window as any).webVitals.onCLS(reportWebVitals)
      ;(window as any).webVitals.onFID(reportWebVitals)
      ;(window as any).webVitals.onFCP(reportWebVitals)
      ;(window as any).webVitals.onLCP(reportWebVitals)
      ;(window as any).webVitals.onTTFB(reportWebVitals)
    }
  }, [])

  return null
}