
'use client'

import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/admin-layout'
import PostForm from '@/components/admin/post-form'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { BlogService } from '@/lib/blog-service'
import { useToast } from '@/hooks/use-toast'

export default function EditPostPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const { user, isLoading: authLoading } = useAuth()
    const [post, setPost] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()

    useEffect(() => {
        if (!authLoading) {
            if (!user || !user.isAdmin) {
                router.push('/admin/login')
            } else {
                fetchPost()
            }
        }
    }, [user, authLoading, router, params.id])

    const fetchPost = async () => {
        try {
            const fetchedPost = await BlogService.getPostById(params.id)
            if (fetchedPost) {
                setPost(fetchedPost)
            } else {
                console.error('Post not found')
                toast({
                    title: 'Error',
                    description: 'Post not found',
                    variant: 'destructive'
                })
                router.push('/admin/posts')
            }
        } catch (error) {
            console.error('Error fetching post:', error)
            toast({
                title: 'Error',
                description: 'Failed to fetch post details',
                variant: 'destructive'
            })
            router.push('/admin/posts')
        } finally {
            setLoading(false)
        }
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!user || !post) {
        return null
    }

    return (
        <AdminLayout user={user}>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Edit Post</h1>
                <PostForm initialData={post} postId={post.id} isEditing={true} />
            </div>
        </AdminLayout>
    )
}
