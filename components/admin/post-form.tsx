
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { revalidateAfterPostChange } from '@/lib/blog-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Save, X } from 'lucide-react'
import URLImageExtractor from '@/components/URLImageExtractor'
import { BlogService } from '@/lib/blog-service'
import { useAuth } from '@/lib/auth-context'

interface PostFormData {
  title: string
  content: string
  excerpt: string
  category: string
  status: 'draft' | 'published'
  imageUrl: string
  tags: string
}

interface PostFormProps {
  initialData?: Partial<Omit<PostFormData, 'tags'> & { tags: string | string[], published?: boolean }>
  postId?: string
  isEditing?: boolean
}

export default function PostForm({ initialData, postId, isEditing = false }: PostFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()

  // Helper to process initial tags
  const getInitialTags = (tags?: string | string[]) => {
    if (!tags) return ''
    if (Array.isArray(tags)) return tags.join(', ')
    return tags
  }

  const [formData, setFormData] = useState<PostFormData>({
    title: initialData?.title || '',
    content: initialData?.content || '',
    excerpt: initialData?.excerpt || '',
    category: initialData?.category || '',
    status: initialData?.status || (initialData?.published ? 'published' : 'draft'),
    imageUrl: initialData?.imageUrl || '',
    tags: getInitialTags(initialData?.tags)
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!user) {
        throw new Error('User not authenticated')
      }

      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
      const isPublished = formData.status === 'published'

      if (isEditing && postId) {
        // Update existing post
        await BlogService.updatePost(postId, {
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt,
          category: formData.category,
          published: isPublished,
          imageUrl: formData.imageUrl,
          tags: tagsArray,
          slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), // update slug if title changed? Maybe optional.
          // Be careful updating slug as it breaks links. 
          // Original code updated slug on every save.
          updatedAt: new Date()
        })

        // Use updated slug for revalidation if needed
        const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        await revalidateAfterPostChange(slug, formData.category)

      } else {
        // Create new post
        await BlogService.createPost({
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt,
          category: formData.category,
          published: isPublished,
          imageUrl: formData.imageUrl,
          tags: tagsArray,
          slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          authorId: user.uid, // user.uid from AuthContext
          author: user.displayName || user.email || 'Admin', // Author name
          featured: false,
          featuredImage: formData.imageUrl, // Map imageUrl to featuredImage too? Original code used imageUrl
          publishedAt: isPublished ? new Date() : undefined,
          readTime: Math.ceil(formData.content.split(/\s+/).length / 200).toString() // Estimate read time
        })

        const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        await revalidateAfterPostChange(slug, formData.category)
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
              <Label htmlFor="imageUrl">Featured Image URL</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                className="brutalist-border"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className="space-y-4">
            <URLImageExtractor
              onImageSelect={(imageUrl) => handleInputChange('imageUrl', imageUrl)}
              currentImageUrl={formData.imageUrl}
            />
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