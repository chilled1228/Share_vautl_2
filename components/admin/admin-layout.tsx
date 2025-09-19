'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Tag,
  BarChart3
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
  user?: {
    uid: string
    email: string
    displayName?: string
    isAdmin: boolean
  }
}

export default function AdminLayout({ children, user }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Posts', href: '/admin/posts', icon: FileText },
    { name: 'Categories', href: '/admin/categories', icon: Tag },
    { name: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  const handleLogout = async () => {
    try {
      // Import Firebase auth dynamically to avoid SSR issues
      const { signOut } = await import('firebase/auth')
      const { auth } = await import('@/lib/firebase')

      await signOut(auth)
      localStorage.removeItem('adminUser')
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Fallback: clear localStorage and redirect
      localStorage.removeItem('adminUser')
      router.push('/admin/login')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border">
          <div className="flex items-center justify-between p-6">
            <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-muted"
            >
              <X size={20} />
            </button>
          </div>
          <nav className="px-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:block">
        <div className="h-full bg-card border-r border-border">
          <div className="flex items-center justify-between p-6">
            <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
          </div>
          <nav className="px-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-card border-b border-border">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Welcome, </span>
                <span className="font-medium">{user?.displayName || user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}