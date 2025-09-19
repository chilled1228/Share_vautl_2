export interface BlogPost {
  id: string
  title: string
  content: string
  excerpt: string
  slug: string
  category: string
  tags?: string[]
  featured: boolean
  published: boolean
  imageUrl?: string
  authorId: string
  author?: string
  createdAt: Date
  updatedAt: Date
  readTime?: string
}

export interface MediaFile {
  id: string
  name: string
  url: string
  type: string
  size: number
  path: string
  uploadedBy: string
  uploadedAt: Date
}