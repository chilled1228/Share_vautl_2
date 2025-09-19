'use client'

import AdminRouteGuard from './AdminRouteGuard'

interface AdminLayoutWrapperProps {
  children: React.ReactNode
}

export default function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  return <AdminRouteGuard>{children}</AdminRouteGuard>
}