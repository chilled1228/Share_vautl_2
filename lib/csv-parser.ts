import { BlogPost } from '@/types/blog'

export interface CSVBlogPost {
  title: string
  slug?: string
  content: string
  excerpt: string
  authorId: string
  category: string
  tags: string
  featured: string
  published: string
  imageUrl?: string
}

export interface ValidationError {
  row: number
  field: string
  message: string
  value?: any
}

export interface ParseResult {
  posts: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'readTime' | 'authorName'>[]
  errors: ValidationError[]
  warnings: string[]
}

export class CSVParser {
  private static readonly REQUIRED_FIELDS = ['title', 'content', 'excerpt', 'authorId', 'category']
  private static readonly BOOLEAN_FIELDS = ['featured', 'published']
  private static readonly ALLOWED_CATEGORIES = [
    'Motivation', 'Wisdom', 'Love & Relationships', 'Humor',
    'Daily Inspiration', 'Success', 'Life Lessons', 'Philosophy'
  ]

  static parseCSV(csvContent: string): string[][] {
    const lines = csvContent.split('\n').filter(line => line.trim())
    const result: string[][] = []

    for (const line of lines) {
      const fields: string[] = []
      let current = ''
      let inQuotes = false
      let i = 0

      while (i < line.length) {
        const char = line[i]

        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"'
            i += 2
            continue
          }
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          fields.push(current.trim())
          current = ''
        } else {
          current += char
        }
        i++
      }

      fields.push(current.trim())
      result.push(fields)
    }

    return result
  }

  static sanitizeSlug(slug: string): string {
    return slug
      .toLowerCase()
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\s/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  static generateSlug(title: string): string {
    return this.sanitizeSlug(title)
  }

  static validateSlug(slug: string): { isValid: boolean; message: string } {
    if (!slug) return { isValid: false, message: 'Slug is required' }
    if (slug.length < 3) return { isValid: false, message: 'Slug must be at least 3 characters long' }
    if (slug.length > 100) return { isValid: false, message: 'Slug must be less than 100 characters' }
    if (!/^[a-z0-9-]+$/.test(slug)) return { isValid: false, message: 'Slug can only contain lowercase letters, numbers, and hyphens' }
    if (slug.startsWith('-') || slug.endsWith('-')) return { isValid: false, message: 'Slug cannot start or end with a hyphen' }
    if (slug.includes('--')) return { isValid: false, message: 'Slug cannot contain consecutive hyphens' }
    return { isValid: true, message: '' }
  }

  static calculateReadTime(content: string): number {
    const wordsPerMinute = 200
    const wordCount = content.trim().split(/\s+/).length
    return Math.ceil(wordCount / wordsPerMinute)
  }

  static parseCSVToBlogPosts(csvContent: string, validAdminIds: string[]): ParseResult {
    const errors: ValidationError[] = []
    const warnings: string[] = []
    const posts: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'readTime' | 'authorName'>[] = []

    try {
      const rows = this.parseCSV(csvContent)

      if (rows.length === 0) {
        errors.push({ row: 0, field: 'file', message: 'CSV file is empty' })
        return { posts, errors, warnings }
      }

      const headers = rows[0].map(h => h.toLowerCase().trim())
      const expectedHeaders = ['title', 'slug', 'content', 'excerpt', 'authorid', 'category', 'tags', 'featured', 'published', 'imageurl']

      // Check for required headers
      for (const required of ['title', 'content', 'excerpt', 'authorid', 'category']) {
        if (!headers.includes(required)) {
          errors.push({ row: 0, field: required, message: `Required column '${required}' is missing` })
        }
      }

      if (errors.length > 0) {
        return { posts, errors, warnings }
      }

      // Process data rows
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        const rowData: any = {}

        // Map row data to headers
        headers.forEach((header, index) => {
          rowData[header] = row[index] ? row[index].trim() : ''
        })

        const rowErrors: ValidationError[] = []

        // Validate required fields
        for (const field of this.REQUIRED_FIELDS) {
          const fieldKey = field.toLowerCase()
          if (!rowData[fieldKey] || rowData[fieldKey] === '') {
            rowErrors.push({ row: i + 1, field, message: `${field} is required`, value: rowData[fieldKey] })
          }
        }

        // Validate authorId
        if (rowData.authorid && !validAdminIds.includes(rowData.authorid)) {
          rowErrors.push({ row: i + 1, field: 'authorId', message: 'Author ID must be a valid admin user', value: rowData.authorid })
        }

        // Validate category
        if (rowData.category && !this.ALLOWED_CATEGORIES.includes(rowData.category)) {
          rowErrors.push({ row: i + 1, field: 'category', message: `Category must be one of: ${this.ALLOWED_CATEGORIES.join(', ')}`, value: rowData.category })
        }

        // Validate and process slug
        let slug = rowData.slug || ''
        if (!slug && rowData.title) {
          slug = this.generateSlug(rowData.title)
          warnings.push(`Row ${i + 1}: Auto-generated slug '${slug}' from title`)
        }

        if (slug) {
          const slugValidation = this.validateSlug(slug)
          if (!slugValidation.isValid) {
            rowErrors.push({ row: i + 1, field: 'slug', message: slugValidation.message, value: slug })
          }
        }

        // Validate boolean fields
        for (const field of this.BOOLEAN_FIELDS) {
          const fieldKey = field.toLowerCase()
          const value = rowData[fieldKey]
          if (value && !['true', 'false', '1', '0', 'yes', 'no'].includes(value.toLowerCase())) {
            rowErrors.push({ row: i + 1, field, message: `${field} must be true/false, 1/0, or yes/no`, value })
          }
        }

        // Validate URL if provided
        if (rowData.imageurl) {
          try {
            new URL(rowData.imageurl)
          } catch {
            rowErrors.push({ row: i + 1, field: 'imageUrl', message: 'Image URL must be a valid URL', value: rowData.imageurl })
          }
        }

        // If no errors for this row, create the post object
        if (rowErrors.length === 0) {
          const tags = rowData.tags ? rowData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : []

          const post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'readTime' | 'authorName'> = {
            title: rowData.title,
            slug: slug,
            content: rowData.content,
            excerpt: rowData.excerpt,
            authorId: rowData.authorid,
            category: rowData.category,
            tags,
            featured: this.parseBoolean(rowData.featured),
            published: this.parseBoolean(rowData.published),
            imageUrl: rowData.imageurl || undefined
          }

          posts.push(post)
        } else {
          errors.push(...rowErrors)
        }
      }

    } catch (error) {
      errors.push({ row: 0, field: 'file', message: `Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}` })
    }

    return { posts, errors, warnings }
  }

  private static parseBoolean(value: string): boolean {
    if (!value) return false
    const lowerValue = value.toLowerCase()
    return ['true', '1', 'yes'].includes(lowerValue)
  }

  static generateSampleCSV(): string {
    const headers = ['title', 'slug', 'content', 'excerpt', 'authorId', 'category', 'tags', 'featured', 'published', 'imageUrl']
    const sampleRow = [
      'Sample Blog Post Title',
      'sample-blog-post-title',
      'This is the main content of the blog post. It can be quite long and contain detailed information about the topic.',
      'This is a brief excerpt that summarizes the main points of the blog post.',
      'admin-user-id-here',
      'Motivation',
      'inspiration,motivation,growth',
      'true',
      'false',
      'https://example.com/image.jpg'
    ]

    const csvRows = [
      headers.join(','),
      sampleRow.map(field => `"${field}"`).join(',')
    ]

    return csvRows.join('\n')
  }
}