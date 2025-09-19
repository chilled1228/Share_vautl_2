'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Save, X } from 'lucide-react'

interface PostFormData {
  title: string
  content: string
  excerpt: string
  category: string
  status: 'draft' | 'published'
  featuredImage: string
  metaTitle: string
  metaDescription: string
  tags: string
}

interface PostFormProps {
  initialData?: Partial<PostFormData>
  postId?: string
  isEditing?: boolean
}

export default function PostForm({ initialData, postId, isEditing = false }: PostFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState<PostFormData>({
    title: initialData?.title || '',
    content: initialData?.content || '',
    excerpt: initialData?.excerpt || '',
    category: initialData?.category || '',
    status: initialData?.status || 'draft',
    featuredImage: initialData?.featuredImage || '',
    metaTitle: initialData?.metaTitle || '',
    metaDescription: initialData?.metaDescription || '',
    tags: initialData?.tags || ''
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))

          if (!userDoc.exists() || !userDoc.data().isAdmin) {
            await auth.signOut()
            localStorage.removeItem('adminUser')
            router.push('/admin/login')
            return
          }

          setUser(firebaseUser)
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
    })

    return () => unsubscribe()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!user) {
        throw new Error('User not authenticated')
      }

      const postData = {
        ...formData,
        authorId: user.uid,
        authorEmail: user.email,
        authorName: user.displayName || user.email,
        slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        published: formData.status === 'published',
        views: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      if (isEditing && postId) {
        // Update existing post
        await setDoc(doc(db, 'posts', postId), postData, { merge: true })
      } else {
        // Create new post
        await addDoc(collection(db, 'posts'), postData)
      }

      router.push('/admin/posts')
    } catch (err) {
      console.error('Save post error:', err)
      setError(err instanceof Error ? err.message : 'Failed to save post')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof PostFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="brutalist-border brutalist-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {isEditing ? 'Edit Post' : 'Create New Post'}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="brutalist-border"
            >
              <X size={20} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                className="brutalist-border"
                placeholder="Enter post title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                required
                className="brutalist-border"
                placeholder="Enter category"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger className="brutalist-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="featuredImage">Featured Image URL</Label>
              <Input
                id="featuredImage"
                value={formData.featuredImage}
                onChange={(e) => handleInputChange('featuredImage', e.target.value)}
                className="brutalist-border"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => handleInputChange('excerpt', e.target.value)}
              rows={3}
              className="brutalist-border"
              placeholder="Brief description of the post"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={12}
              required
              className="brutalist-border"
              placeholder="Write your post content here..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="metaTitle">Meta Title</Label>
              <Input
                id="metaTitle"
                value={formData.metaTitle}
                onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                className="brutalist-border"
                placeholder="SEO title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                value={formData.metaDescription}
                onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                rows={2}
                className="brutalist-border"
                placeholder="SEO description"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              className="brutalist-border"
              placeholder="tag1, tag2, tag3"
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary text-primary-foreground brutalist-border brutalist-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} className="mr-2" />
                  {isEditing ? 'Update Post' : 'Create Post'}
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="brutalist-border"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}