
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { revalidateAfterPostChange } from '@/lib/blog-actions'
import AdminLayout from '@/components/admin/admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Plus, Search, Edit, Trash2, Eye, Upload } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { BlogService } from '@/lib/blog-service'
import { useAuth } from '@/lib/auth-context'

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

export default function PostsPage() {
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<Post[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading: authLoading } = useAuth()

  useEffect(() => {
    // Redirect if not admin (AuthContext handles user state, but we enforce admin check/redirect)
    if (!authLoading && (!user || !user.isAdmin)) {
      router.push('/admin/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsData = await BlogService.getAllPosts()

        // Map to local Post interface if needed, or update interface
        // Note: BlogService returns BlogPost, we need to map published status etc.
        const mappedPosts: Post[] = postsData.map(p => ({
          id: p.id,
          title: p.title,
          excerpt: p.excerpt,
          category: p.category,
          status: p.published ? 'published' : 'draft',
          createdAt: p.createdAt,
          views: (p as any).views || 0,
          authorId: p.authorId,
          slug: p.slug
        }))

        setPosts(mappedPosts)
      } catch (error) {
        console.error('Posts fetch error:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch posts',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    if (user && user.isAdmin) {
      fetchPosts()
    }
  }, [user, toast])

  const handleDelete = async (post: Post) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    try {
      await BlogService.deletePost(post.id)
      // Revalidate cache on server
      await revalidateAfterPostChange(post.slug, post.category)

      toast({
        title: 'Success',
        description: 'Post deleted successfully'
      })

      // Refresh posts list
      const updatedPosts = await BlogService.getAllPosts()
      const mapped = updatedPosts.map(p => ({
        id: p.id,
        title: p.title,
        excerpt: p.excerpt,
        category: p.category,
        status: p.published ? 'published' : 'draft',
        createdAt: p.createdAt,
        views: (p as any).views || 0,
        authorId: p.authorId,
        slug: p.slug
      } as Post))
      setPosts(mapped)
    } catch (error) {
      console.error('Delete post error:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete post',
        variant: 'destructive'
      })
    }
  }

  const handleBulkDelete = async () => {
    if (selectedPosts.size === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select posts to delete',
        variant: 'destructive'
      })
      return
    }

    const confirmMessage = `Are you sure you want to delete ${selectedPosts.size} post${selectedPosts.size !== 1 ? 's' : ''}? This action cannot be undone.`

    if (!confirm(confirmMessage)) {
      return
    }

    setIsDeleting(true)

    try {
      const postIds = Array.from(selectedPosts)

      // Get post details for cache revalidation
      const postsToDelete = posts.filter(p => postIds.includes(p.id))

      console.log(`Starting bulk delete of ${postIds.length} posts...`)

      // Delete posts using bulk delete service
      await BlogService.bulkDeletePosts(postIds)

      console.log(`Successfully deleted ${postIds.length} posts`)

      // Batch revalidate cache for deleted posts
      try {
        await Promise.all(
          postsToDelete.map(post =>
            revalidateAfterPostChange(post.slug, post.category).catch(err => {
              console.error(`Failed to revalidate ${post.slug}:`, err)
              // Don't fail if revalidation fails
              return Promise.resolve()
            })
          )
        )
        console.log('Cache revalidation completed')
      } catch (revalidationError) {
        console.error('Batch revalidation error:', revalidationError)
        // Continue even if revalidation fails
      }

      toast({
        title: 'Success',
        description: `Successfully deleted ${selectedPosts.size} post${selectedPosts.size !== 1 ? 's' : ''}`
      })

      // Clear selection and refresh
      setSelectedPosts(new Set())
      const updatedPosts = await BlogService.getAllPosts()
      const mapped = updatedPosts.map(p => ({
        id: p.id,
        title: p.title,
        excerpt: p.excerpt,
        category: p.category,
        status: p.published ? 'published' : 'draft',
        createdAt: p.createdAt,
        views: (p as any).views || 0,
        authorId: p.authorId,
        slug: p.slug
      } as Post))
      setPosts(mapped)
    } catch (error) {
      console.error('Bulk delete error:', error)

      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      toast({
        title: 'Delete Failed',
        description: `Error: ${errorMessage}. Please refresh and try again.`,
        variant: 'destructive'
      })

      // Refresh to show current state
      setSelectedPosts(new Set())
      // Trigger fetch again logic...
    } finally {
      setIsDeleting(false)
    }
  }

  const togglePostSelection = (postId: string) => {
    const newSelection = new Set(selectedPosts)
    if (newSelection.has(postId)) {
      newSelection.delete(postId)
    } else {
      newSelection.add(postId)
    }
    setSelectedPosts(newSelection)
  }

  const toggleSelectAll = () => {
    if (selectedPosts.size === filteredPosts.length) {
      setSelectedPosts(new Set())
    } else {
      setSelectedPosts(new Set(filteredPosts.map(p => p.id)))
    }
  }

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const allSelected = filteredPosts.length > 0 && selectedPosts.size === filteredPosts.length
  const someSelected = selectedPosts.size > 0 && selectedPosts.size < filteredPosts.length

  if (authLoading || loading) {
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
          {selectedPosts.size > 0 && (
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="brutalist-border"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={20} className="mr-2" />
                  Delete Selected ({selectedPosts.size})
                </>
              )}
            </Button>
          )}
        </div>

        <Card className="brutalist-border brutalist-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Posts</CardTitle>
              {filteredPosts.length > 0 && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleSelectAll}
                    className={someSelected ? 'data-[state=checked]:bg-primary/50' : ''}
                  />
                  <span className="text-sm text-muted-foreground">
                    Select All ({filteredPosts.length})
                  </span>
                </div>
              )}
            </div>
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
                      <div className="flex items-start gap-3 flex-1">
                        <Checkbox
                          checked={selectedPosts.has(post.id)}
                          onCheckedChange={() => togglePostSelection(post.id)}
                          className="mt-1"
                        />
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
                            <span>{formatDistanceToNow(post.createdAt, { addSuffix: true })}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Eye size={14} />
                              {post.views} views
                            </span>
                          </div>
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