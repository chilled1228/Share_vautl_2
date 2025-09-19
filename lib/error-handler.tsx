/**
 * Production-ready error handling utilities
 * Replaces console.log statements with proper error tracking
 */

import React from 'react'

interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  metadata?: Record<string, unknown>
}

class ErrorHandler {
  private isDevelopment = process.env.NODE_ENV === 'development'

  /**
   * Log errors in development, track in production
   */
  error(message: string, error?: Error, context?: ErrorContext): void {
    if (this.isDevelopment) {
      console.error(`[${context?.component || 'App'}] ${message}`, error, context)
    } else {
      // In production, send to monitoring service (Sentry, etc.)
      this.trackError(message, error, context)
    }
  }

  /**
   * Log warnings in development only
   */
  warn(message: string, context?: ErrorContext): void {
    if (this.isDevelopment) {
      console.warn(`[${context?.component || 'App'}] ${message}`, context)
    }
  }

  /**
   * Log info messages in development only
   */
  info(message: string, context?: ErrorContext): void {
    if (this.isDevelopment) {
      console.log(`[${context?.component || 'App'}] ${message}`, context)
    }
  }

  /**
   * Track successful operations (useful for debugging)
   */
  success(message: string, context?: ErrorContext): void {
    if (this.isDevelopment) {
      console.log(`✅ [${context?.component || 'App'}] ${message}`, context)
    }
  }

  /**
   * Track errors in production (placeholder for monitoring service)
   */
  private trackError(message: string, error?: Error, context?: ErrorContext): void {
    // TODO: Implement proper error tracking service (Sentry, LogRocket, etc.)
    // For now, we'll use a minimal fallback
    if (typeof window !== 'undefined') {
      // Client-side error tracking
      window.dispatchEvent(new CustomEvent('app-error', {
        detail: { message, error: error?.message, context }
      }))
    }
  }

  /**
   * Handle async errors gracefully
   */
  async handleAsync<T>(
    asyncFn: () => Promise<T>,
    context?: ErrorContext
  ): Promise<T | null> {
    try {
      return await asyncFn()
    } catch (error) {
      this.error('Async operation failed', error as Error, context)
      return null
    }
  }
}

export const errorHandler = new ErrorHandler()

/**
 * HOC for component error boundaries
 */
export function withErrorHandling<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return function WrappedComponent(props: P) {
    try {
      return <Component {...props} />
    } catch (error) {
      errorHandler.error('Component render failed', error as Error, {
        component: componentName
      })
      return <div>Something went wrong. Please refresh the page.</div>
    }
  }
}

/**
 * Utility for retrying failed operations
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000,
  context?: ErrorContext
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxAttempts) {
        errorHandler.error(`Operation failed after ${maxAttempts} attempts`, lastError, {
          ...context,
          metadata: { attempts: maxAttempts }
        })
        throw lastError
      }
      
      errorHandler.warn(`Attempt ${attempt} failed, retrying...`, {
        ...context,
        metadata: { attempt, maxAttempts }
      })
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }
  
  throw lastError!
}