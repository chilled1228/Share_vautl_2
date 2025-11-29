'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc, collection, getDocs, query, orderBy, deleteDoc } from 'firebase/firestore'
import { revalidateAfterPostChange } from '@/lib/blog-actions'
import AdminLayout from '@/components/admin/admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Search, Edit, Trash2, Eye, Upload } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface Post {
  id: string
  title: string
  excerpt: string
  category: string
  status: 'draft' | 'published'
  createdAt: any
  views: number
  authorId: string
  slug: string
}

interface User {
  uid: string
  email: string
  displayName?: string
  isAdmin: boolean
}

export default function PostsPage() {
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<Post[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

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
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || undefined,
            isAdmin: true
          }

          setUser(userData)
          localStorage.setItem('adminUser', JSON.stringify(userData))

          // Fetch posts data
          await fetchPosts()
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
  }, [router])

  const fetchPosts = async () => {
    try {
      const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
      const postsSnapshot = await getDocs(postsQuery)

      const postsData = postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Post))

      setPosts(postsData)
    } catch (error) {
      console.error('Posts fetch error:', error)
    }
  }

  const handleDelete = async (post: Post) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    try {
      await deleteDoc(doc(db, 'posts', post.id))
      // Revalidate cache on server
      await revalidateAfterPostChange(post.slug, post.category)

      // Refresh posts list
      fetchPosts()
    } catch (error) {
      console.error('Delete post error:', error)
    }
  }

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <AdminLayout user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Posts</h1>
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

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 brutalist-border"
            />
          </div>
        </div>

        <Card className="brutalist-border brutalist-shadow">
          <CardHeader>
            <CardTitle>All Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No posts found</p>
                  <Link href="/admin/posts/create">
                    <Button className="bg-primary text-primary-foreground brutalist-border brutalist-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                      <Plus size={20} className="mr-2" />
                      Create Your First Post
                    </Button>
                  </Link>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <div key={post.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">{post.title}</h3>
                          <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                            {post.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Category: {post.category}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(post.createdAt?.toDate?.() || new Date(post.createdAt), { addSuffix: true })}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Eye size={14} />
                            {post.views} views
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Link href={`/admin/posts/${post.id}/edit`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="hover:bg-muted"
                          >
                            <Edit size={16} />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="hover:bg-muted text-destructive"
                          onClick={() => handleDelete(post)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}