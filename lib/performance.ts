/**
 * Performance monitoring utilities for tracking page load times and Firebase queries
 */

export class PerformanceMonitor {
  private static timers = new Map<string, number>()

  // Start timing an operation
  static startTimer(label: string): void {
    this.timers.set(label, Date.now())
  }

  // End timing and log the result
  static endTimer(label: string): number {
    const startTime = this.timers.get(label)
    if (!startTime) {
      console.warn(`⚠️ [PerformanceMonitor] No start time found for ${label}`)
      return 0
    }

    const duration = Date.now() - startTime
    this.timers.delete(label)

    console.log(`⚡ [Performance] ${label}: ${duration}ms`)
    return duration
  }

  // Log Firebase query performance
  static logFirebaseQuery(operation: string, count: number, duration: number): void {
    console.log(`🔥 [Firebase] ${operation}: ${count} docs in ${duration}ms (${(duration/count).toFixed(2)}ms per doc)`)
  }

  // Log page rendering performance
  static logPageRender(page: string, duration: number): void {
    console.log(`📄 [Page Render] ${page}: ${duration}ms`)
  }

  // Measure and wrap Firebase operations
  static async measureFirebaseOperation<T>(
    label: string,
    operation: () => Promise<T>
  ): Promise<T> {
    this.startTimer(label)
    try {
      const result = await operation()
      this.endTimer(label)
      return result
    } catch (error) {
      this.endTimer(label)
      console.error(`❌ [Firebase Error] ${label}:`, error)
      throw error
    }
  }

  // Get Web Vitals (Core Web Vitals monitoring)
  static initWebVitals(): void {
    if (typeof window === 'undefined') return

    // Monitor LCP (Largest Contentful Paint)
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      console.log(`📊 [LCP] Largest Contentful Paint: ${lastEntry.startTime.toFixed(2)}ms`)
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // Monitor FID (First Input Delay)
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log(`📊 [FID] First Input Delay: ${entry.processingStart - entry.startTime}ms`)
      }
    }).observe({ entryTypes: ['first-input'] })

    // Monitor CLS (Cumulative Layout Shift)
    new PerformanceObserver((list) => {
      let cls = 0
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          cls += entry.value
        }
      }
      console.log(`📊 [CLS] Cumulative Layout Shift: ${cls}`)
    }).observe({ entryTypes: ['layout-shift'] })
  }

  // Track cache hits/misses
  static logCacheHit(key: string, hit: boolean): void {
    console.log(`💾 [Cache] ${key}: ${hit ? 'HIT' : 'MISS'}`)
  }
}

// Simple performance tracking for Next.js pages
export function withPerformanceMonitoring<T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> {
  return PerformanceMonitor.measureFirebaseOperation(label, fn)
}