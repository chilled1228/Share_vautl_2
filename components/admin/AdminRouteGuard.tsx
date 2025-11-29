'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface AdminRouteGuardProps {
  children: React.ReactNode
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [isSeedPage, setIsSeedPage] = useState(false)

  useEffect(() => {
    const checkAdminAccess = async () => {
      // Check if current path is seed page or login page
      if (pathname) {
        setIsSeedPage(pathname === '/seed')

        // Allow access to login page without checks
        if (pathname === '/admin/login') {
          setIsLoading(false)
          return
        }
      }

      if (!user) {
        router.push('/admin/login')
        return
      }

      try {
        // Check if user is admin in Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        const userData = userDoc.data()

        if (!userData?.isAdmin) {
          console.log('User is not admin, redirecting to home')
          router.push('/')
          return
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
        router.push('/')
        return
      }

      setIsLoading(false)
    }

    checkAdminAccess()
  }, [user, router, pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking access...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}