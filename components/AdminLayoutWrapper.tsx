'use client'

import { AuthProvider } from '@/lib/auth-context'
import AdminRouteGuard from './AdminRouteGuard'

interface AdminLayoutWrapperProps {
  children: React.ReactNode
}

export default function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  return (
    <AuthProvider>
      <AdminRouteGuard>
        {children}
      </AdminRouteGuard>
    </AuthProvider>
  )
}