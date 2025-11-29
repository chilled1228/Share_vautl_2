'use client'

import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import AdminLayout from '@/components/admin/admin-layout'
import PostForm from '@/components/admin/post-form'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface User {
    uid: string
    email: string
    displayName?: string
    isAdmin: boolean
}

export default function EditPostPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [post, setPost] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // Check if user is admin
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))

                    if (!userDoc.exists() || !userDoc.data().isAdmin) {
                        await auth.signOut()
                        localStorage.removeItem('adminUser')
                        router.push('/admin/login')
                        return
                    }

                    const userData = {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        isAdmin: true
                    }

                    setUser(userData)
                    localStorage.setItem('adminUser', JSON.stringify(userData))

                    // Fetch post data
                    const postDoc = await getDoc(doc(db, 'posts', params.id))
                    if (postDoc.exists()) {
                        setPost({ id: postDoc.id, ...postDoc.data() })
                    } else {
                        console.error('Post not found')
                        router.push('/admin/posts')
                    }
                } catch (error) {
                    console.error('Auth check error:', error)
                    await auth.signOut()
                    localStorage.removeItem('adminUser')
                    router.push('/admin/login')
                }
            } else {
                localStorage.removeItem('adminUser')
                router.push('/admin/login')
            }
            setLoading(false)
        })

        return () => unsubscribe()
    }, [router, params.id])

    if (loading) {
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
