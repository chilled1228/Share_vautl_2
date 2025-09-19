'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

interface AdminRouteGuardProps {
  children: React.ReactNode
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) {
      return // Wait for authentication to complete
    }

    const isLoginPage = pathname === '/admin/login'
    const isSeedPage = pathname === '/admin/seed'

    if (isLoginPage) {
      if (user) {
        router.push('/admin')
      }
      return
    }

    if (!user) {
      router.push('/admin/login')
      return
    }

    if (!user.isAdmin && !isSeedPage) {
      router.push('/')
    }
  }, [user, isLoading, router, pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const isLoginPage = pathname === '/admin/login'
  const isSeedPage = pathname === '/admin/seed'

  if (isLoginPage && user) {
    return null // Redirecting
  }

  if (!user && !isLoginPage) {
    return null // Redirecting
  }

  if (user && !user.isAdmin && !isSeedPage) {
    return null // Redirecting
  }

  return <>{children}</>
}