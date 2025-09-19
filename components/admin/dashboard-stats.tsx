'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Users, TrendingUp, Tag } from 'lucide-react'

interface DashboardStatsProps {
  totalPosts: number
  totalCategories: number
  recentPosts: number
  popularPosts: number
}

export default function DashboardStats({
  totalPosts,
  totalCategories,
  recentPosts,
  popularPosts
}: DashboardStatsProps) {
  const stats = [
    {
      title: 'Total Posts',
      value: totalPosts,
      icon: FileText,
      color: 'text-primary'
    },
    {
      title: 'Categories',
      value: totalCategories,
      icon: Tag,
      color: 'text-secondary'
    },
    {
      title: 'Recent Posts',
      value: recentPosts,
      icon: TrendingUp,
      color: 'text-accent'
    },
    {
      title: 'Popular Posts',
      value: popularPosts,
      icon: Users,
      color: 'text-destructive'
    }
  ]

  return (
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
  )
}