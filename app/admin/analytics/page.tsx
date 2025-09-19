'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Eye, TrendingUp, Users, FileText, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface AnalyticsData {
  totalPosts: number
  totalViews: number
  totalCategories: number
  popularPosts: Array<{
    id: string
    title: string
    views: number
    category: string
    createdAt: string
  }>
  recentActivity: Array<{
    id: string
    title: string
    createdAt: string
    views: number
  }>
}

interface User {
  uid: string
  email: string
  displayName?: string
  isAdmin: boolean
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchAnalyticsData()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken')
    const userData = localStorage.getItem('adminUser')

    if (!token || !userData) {
      router.push('/admin/login')
      return
    }

    try {
      setUser(JSON.parse(userData))
    } catch (error) {
      router.push('/admin/login')
    }
  }

  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        router.push('/admin/login')
        return
      }

      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminUser')
          router.push('/admin/login')
          return
        }
        throw new Error('Failed to fetch analytics data')
      }

      const data = await response.json()
      if (data.success) {
        setAnalyticsData(data.data)
      }
    } catch (error) {
      console.error('Analytics data error:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalViews = (popularPosts: any[]) => {
    return popularPosts.reduce((total, post) => total + (post.views || 0), 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || !analyticsData) {
    return null
  }

  const totalViews = calculateTotalViews(analyticsData.popularPosts)

  const stats = [
    {
      title: 'Total Posts',
      value: analyticsData.totalPosts,
      icon: FileText,
      color: 'text-primary'
    },
    {
      title: 'Total Views',
      value: totalViews,
      icon: Eye,
      color: 'text-secondary'
    },
    {
      title: 'Categories',
      value: analyticsData.totalCategories,
      icon: Users,
      color: 'text-accent'
    },
    {
      title: 'Recent Posts',
      value: analyticsData.recentPosts,
      icon: Calendar,
      color: 'text-destructive'
    }
  ]

  return (
    <AdminLayout user={user}>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Analytics</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={stat.title} className="brutalist-border brutalist-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="brutalist-border brutalist-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp size={20} />
                Most Popular Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.popularPosts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No posts yet
                  </p>
                ) : (
                  analyticsData.popularPosts.slice(0, 5).map((post, index) => (
                    <div
                      key={post.id}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary">#{index + 1}</Badge>
                          <h3 className="font-medium text-foreground line-clamp-1">
                            {post.title}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {post.category} • {formatDistanceToNow(post.createdAt?.toDate?.() || new Date(post.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Eye size={16} />
                        {post.views}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="brutalist-border brutalist-shadow">
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Content Engagement</span>
                    <Badge variant="outline">Good</Badge>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {analyticsData.totalPosts > 0 ? ((totalViews / analyticsData.totalPosts).toFixed(1)) : 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Average views per post</p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Content Frequency</span>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <div className="text-2xl font-bold text-secondary">
                    {analyticsData.recentPosts}
                  </div>
                  <p className="text-xs text-muted-foreground">Posts in last 7 days</p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Content Diversity</span>
                    <Badge variant="outline">Healthy</Badge>
                  </div>
                  <div className="text-2xl font-bold text-accent">
                    {analyticsData.totalCategories}
                  </div>
                  <p className="text-xs text-muted-foreground">Active categories</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}