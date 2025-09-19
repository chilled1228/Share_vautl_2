'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Eye } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ActivityItem {
  id: string
  title: string
  createdAt: string
  views: number
}

interface RecentActivityProps {
  activities: ActivityItem[]
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card className="brutalist-border brutalist-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock size={20} />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No recent activity
            </p>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 bg-muted rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-foreground line-clamp-1">
                    {activity.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(activity.createdAt?.toDate?.() || new Date(activity.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye size={16} />
                  {activity.views}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}