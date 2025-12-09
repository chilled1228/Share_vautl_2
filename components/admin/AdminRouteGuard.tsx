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

    const checkAccess = () => {
      console.log('[AdminRouteGuard] Checking access...', {
        pathname,
        user: user ? { uid: user.uid, isAdmin: user.isAdmin } : null,
        authLoading,
        checkTimedOut
      })

      // 1. Allow access to login page
      if (pathname === '/admin/login') {
        console.log('[AdminRouteGuard] Allowing access to login page')
        setIsAuthorized(true)
        return
      }

      // 2. Handle timeout - redirect to login
      if (checkTimedOut && !user) {
        console.log('[AdminRouteGuard] Auth timed out without user, redirecting to login')
        router.push('/admin/login')
        return
      }

      // 3. Redirect to login if not authenticated
      if (!user) {
        console.log('[AdminRouteGuard] No user, redirecting to login')
        router.push('/admin/login')
        return
      }

      // 4. Redirect to home if not admin
      if (!user.isAdmin) {
        console.log('[AdminRouteGuard] User is not admin, redirecting to home')
        router.push('/')
        return
      }

      // 5. Grant access
      console.log('[AdminRouteGuard] Access granted')
      setIsAuthorized(true)
    }

    checkAccess()
  }, [user, authLoading, router, pathname, hasMounted, checkTimedOut])

  // Prevent hydration mismatch: return null on server/before mount
  if (!hasMounted) {
    return null
  }

  if ((authLoading && !checkTimedOut) || !isAuthorized) {
    // Show loader while checking auth state or performing redirects
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg mb-2">
            {checkTimedOut ? 'Loading...' : 'Checking access...'}
          </p>
        </div>

        {/* Debug Info Overlay - only shown in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="max-w-lg w-full bg-card border brutalist-border p-4 rounded text-xs font-mono text-left overflow-auto mt-4">
            <p className="font-bold text-primary mb-2">Debug Information:</p>
            <div className="space-y-1">
              <p>Pathname: {pathname}</p>
              <p>Auth Loading: {authLoading ? 'YES' : 'NO'}</p>
              <p>Check Timed Out: {checkTimedOut ? 'YES' : 'NO'}</p>
              <p>Authorized: {isAuthorized ? 'YES' : 'NO'}</p>
              <p>User Present: {user ? 'YES' : 'NO'}</p>
              {user && (
                <>
                  <p>User ID: {user.uid}</p>
                  <p>User Email: {user.email}</p>
                  <p>Is Admin: {user.isAdmin ? 'YES' : 'NO'}</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return <>{children}</>
}