'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

interface AdminRouteGuardProps {
  children: React.ReactNode
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { user, isLoading: authLoading, hasMounted } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [checkTimedOut, setCheckTimedOut] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Set a timeout to prevent infinite "checking" state
  useEffect(() => {
    if (hasMounted && authLoading) {
      timeoutRef.current = setTimeout(() => {
        console.warn('[AdminRouteGuard] Auth check timed out after 5 seconds')
        setCheckTimedOut(true)
      }, 5000)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [hasMounted, authLoading])

  useEffect(() => {
    // Don't run on server or before mount
    if (!hasMounted) return

    // Wait for auth to load (unless timed out)
    if (authLoading && !checkTimedOut) return

    // Clear timeout since we got a response
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    const isLoginPage = pathname === '/admin/login'
    const isSeedPage = pathname === '/admin/seed'

    if (isLoginPage) {
      if (user) {
        router.push('/admin')
      } else {
        setIsAuthorized(true)
      }
      return
    }

    // Handle timeout - redirect to login
    if ((checkTimedOut || !authLoading) && !user) {
      router.push('/admin/login')
      return
    }

    if (!user) return

    if (!user.isAdmin && !isSeedPage) {
      router.push('/')
      return
    }

    setIsAuthorized(true)
  }, [user, authLoading, router, pathname, hasMounted, checkTimedOut])

  // Prevent hydration mismatch: return null on server/before mount
  if (!hasMounted) {
    return null
  }

  if ((authLoading && !checkTimedOut) || !isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {checkTimedOut ? 'Loading...' : 'Checking access...'}
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}