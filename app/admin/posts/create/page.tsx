
'use client'

import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/admin-layout'
import PostForm from '@/components/admin/post-form'
import { useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Loader2 } from 'lucide-react'

export default function CreatePostPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      router.push('/admin/login')
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || !user.isAdmin) {
    return null
  }

  return (
    <AdminLayout user={user}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Create New Post</h1>
        <PostForm />
      </div>
    </AdminLayout>
  )
}