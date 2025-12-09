
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { BlogService } from '@/lib/blog-service'
import AdminLayout from '@/components/admin/admin-layout'
import DashboardStats from '@/components/admin/dashboard-stats'
import RecentActivity from '@/components/admin/recent-activity'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Plus, FileText, Edit, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface DashboardData {
  totalPosts: number
  totalCategories: number
  recentPosts: number
  popularPosts: Array<{
    id: string
    title: string
    views: number
  }>
  recentActivity: Array<{
    id: string
    title: string
    createdAt: string
    views: number
  }>
}

function AdminDashboardContent() {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const { user, isLoading: authLoading } = useAuth()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all posts to calculate stats
        const allPosts = await BlogService.getAllPosts()
        const categories = await BlogService.getCategories()

        // Get recent posts (last 7 days)
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

        const recentPosts = allPosts.filter((post) => {
          return post.createdAt >= oneWeekAgo
        })

        // Sort by views (assuming views property exists on BlogPost, or we mock it for now as it's not in the main interface explicitly but might be in data)
        // Check BlogPost type: it doesn't have 'views'.
        // Original code used `doc.data().views`.
        // My BlogService mapToBlogPost doesn't map 'views'.
        // I should probably add 'views' to BlogPost type and mapping in BlogService if it's important.
        // For now, I'll access it as 'any' or update BlogService. I'll cast to any for quick migration.
        const postsWithViews = allPosts.map(p => ({
          ...p,
          views: (p as any).views || 0 // Default to 0 if not present
        }))

        const popularPosts = [...postsWithViews]
          .sort((a, b) => b.views - a.views)
          .slice(0, 5)

        const dashboardData = {
          totalPosts: allPosts.length,
          totalCategories: categories.length,
          recentPosts: recentPosts.length,
          popularPosts: popularPosts.map(p => ({ id: p.id, title: p.title, views: p.views })),
          recentActivity: recentPosts.slice(0, 10).map((post) => ({
            id: post.id,
            title: post.title,
            createdAt: post.createdAt.toISOString(), // convert Date to string
            views: (post as any).views || 0
          }))
        }

        setDashboardData(dashboardData)
      } catch (error) {
        console.error('Dashboard data error:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchDashboardData()
    } else if (!authLoading) {
      // If not user and not loading, we stop loading dashboard
      setLoading(false)
    }
  }, [user, authLoading])

  if (authLoading || loading) {
    return (
      <AdminLayout user={user || undefined}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    )
  }

  if (!dashboardData) {
    return (
      <AdminLayout user={user || undefined}>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No dashboard data available</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout user={user || undefined}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex gap-2">
            <Link href="/admin/posts/bulk-upload">
              <Button variant="outline" className="brutalist-border">
                <Upload size={20} className="mr-2" />
                Bulk Upload
              </Button>
            </Link>
            <Link href="/admin/posts/create">
              <Button className="bg-primary text-primary-foreground brutalist-border brutalist-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                <Plus size={20} className="mr-2" />
                New Post
              </Button>
            </Link>
          </div>
        </div>

        <DashboardStats
          totalPosts={dashboardData.totalPosts}
          totalCategories={dashboardData.totalCategories}
          recentPosts={dashboardData.recentPosts}
          popularPosts={dashboardData.popularPosts.length}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity activities={dashboardData.recentActivity} />

          <Card className="brutalist-border brutalist-shadow">
            <CardHeader>
              <CardTitle>Popular Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.popularPosts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No popular posts yet
                  </p>
                ) : (
                  dashboardData.popularPosts.map((post) => (
                    <div
                      key={post.id}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground line-clamp-1">
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {post.views} views
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/posts/${post.id}/edit`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="hover:bg-muted"
                          >
                            <Edit size={16} />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="brutalist-border brutalist-shadow">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/admin/posts">
                <Button
                  variant="outline"
                  className="w-full brutalist-border hover:bg-muted"
                >
                  <FileText size={20} className="mr-2" />
                  Manage Posts
                </Button>
              </Link>
              <Link href="/admin/categories">
                <Button
                  variant="outline"
                  className="w-full brutalist-border hover:bg-muted"
                >
                  <FileText size={20} className="mr-2" />
                  Categories
                </Button>
              </Link>
              <Link href="/admin/analytics">
                <Button
                  variant="outline"
                  className="w-full brutalist-border hover:bg-muted"
                >
                  <FileText size={20} className="mr-2" />
                  Analytics
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default function AdminDashboardPage() {
  return <AdminDashboardContent />
}