'use client'

import AdminRouteGuard from './AdminRouteGuard'
import { Toaster } from '@/components/ui/toaster'

interface AdminLayoutWrapperProps {
  children: React.ReactNode
}

export default function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  return (
    <AdminRouteGuard>
      {children}
      <Toaster />
    </AdminRouteGuard>
  )
}