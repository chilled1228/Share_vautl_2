'use client'

import { useState, useRef } from 'react'
import { Upload, Download, FileText, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

interface ValidationError {
  row: number
  field: string
  message: string
  value?: any
}

interface UploadResult {
  success: boolean
  message?: string
  errors?: ValidationError[]
  warnings?: string[]
  createdPosts?: Array<{ id: string; title: string; slug: string }>
  validPosts?: number
  totalRows?: number
  successfulCreations?: number
}

export default function BulkUpload() {
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [validating, setValidating] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [showValidation, setShowValidation] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null)
      setShowValidation(false)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const droppedFile = event.dataTransfer.files[0]
    if (droppedFile && droppedFile.name.toLowerCase().endsWith('.csv')) {
      setFile(droppedFile)
      setResult(null)
      setShowValidation(false)
    }
  }

  const getCurrentUser = () => {
    if (!user) return null
    return user
  }

  const validateCSV = async () => {
    if (!file) return

    setValidating(true)
    setResult(null)

    try {
      const currentUser = getCurrentUser()
      if (!currentUser) {
        setResult({ success: false, errors: [{ row: 0, field: 'auth', message: 'Authentication required' }] })
        return
      }

      const formData = new FormData()
      formData.append('csvFile', file)
      formData.append('validateOnly', 'true')

      const response = await fetch('/api/admin/bulk-upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      setResult(data)
      setShowValidation(true)
    } catch (error) {
      setResult({
        success: false,
        errors: [{ row: 0, field: 'network', message: 'Failed to validate CSV. Please try again.' }]
      })
    } finally {
      setValidating(false)
    }
  }

  const uploadCSV = async () => {
    if (!file) return

    setUploading(true)
    setResult(null)

    try {
      const currentUser = getCurrentUser()
      if (!currentUser) {
        setResult({ success: false, errors: [{ row: 0, field: 'auth', message: 'Authentication required' }] })
        return
      }

      // First parse the CSV
      const formData = new FormData()
      formData.append('csvFile', file)
      formData.append('validateOnly', 'false')

      const response = await fetch('/api/admin/bulk-upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!data.success) {
        setResult(data)
        return
      }

      // Now create posts using BlogService
      const { BlogService } = await import('@/lib/blog-service')
      const createdPosts = []
      const creationErrors = []

      for (let i = 0; i < data.posts.length; i++) {
        const post = data.posts[i]
        try {
          // Use current user as author if authorId is placeholder
          const authorId = post.authorId === 'admin-user-id' ? currentUser.uid : post.authorId
          const authorName = currentUser.displayName || currentUser.email || 'Admin'

          const postWithMeta = {
            ...post,
            authorId,
            authorName,
            readTime: Math.ceil(post.content.split(/\s+/).length / 200) // Calculate read time
          }

          const postId = await BlogService.createPost(postWithMeta)
          createdPosts.push({ id: postId, title: post.title, slug: post.slug })
        } catch (error) {
          creationErrors.push({
            row: i + 2,
            field: 'creation',
            message: `Failed to create post: ${error instanceof Error ? error.message : 'Unknown error'}`,
            value: post.title
          })
        }
      }

      if (creationErrors.length > 0) {
        setResult({
          success: false,
          errors: creationErrors,
          warnings: data.warnings,
          createdPosts,
          totalRows: data.posts.length,
          successfulCreations: createdPosts.length
        })
      } else {
        setResult({
          success: true,
          message: `Successfully created ${createdPosts.length} blog posts`,
          warnings: data.warnings,
          createdPosts,
          totalRows: data.posts.length,
          successfulCreations: createdPosts.length
        })

        // Clear form on success
        setFile(null)
        setShowValidation(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }

    } catch (error) {
      setResult({
        success: false,
        errors: [{ row: 0, field: 'network', message: 'Failed to upload CSV. Please try again.' }]
      })
    } finally {
      setUploading(false)
    }
  }

  const downloadSample = async () => {
    try {
      const response = await fetch('/api/admin/bulk-upload', {
        method: 'GET'
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'sample-blog-posts.csv'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Failed to download sample CSV')
      }
    } catch (error) {
      alert('Failed to download sample CSV')
    }
  }

  const clearFile = () => {
    setFile(null)
    setResult(null)
    setShowValidation(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-semibold text-gray-900">Bulk Blog Post Upload</h2>
        <p className="text-sm text-gray-600 mt-1">
          Upload multiple blog posts at once using a CSV file
        </p>
      </div>

      {/* Sample Download */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-900">Download Sample CSV</h3>
            <p className="text-sm text-blue-700 mt-1">
              Get a sample CSV file with the correct format and column headers
            </p>
            <button
              onClick={downloadSample}
              className="mt-2 inline-flex items-center px-3 py-1.5 border border-blue-300 rounded-md text-sm text-blue-700 bg-white hover:bg-blue-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Sample
            </button>
          </div>
        </div>
      </div>

      {/* File Upload */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Upload CSV File
        </label>

        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-2">
            Drag and drop your CSV file here, or click to select
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
            id="csv-upload"
          />
          <label
            htmlFor="csv-upload"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
          >
            Select CSV File
          </label>
        </div>

        {file && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-900">{file.name}</span>
                <span className="text-xs text-gray-500">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <button
                onClick={clearFile}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {file && (
        <div className="flex space-x-4">
          <button
            onClick={validateCSV}
            disabled={validating || uploading}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {validating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            {validating ? 'Validating...' : 'Validate CSV'}
          </button>

          {showValidation && result?.success && (
            <button
              onClick={uploadCSV}
              disabled={uploading || validating}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {uploading ? 'Uploading...' : 'Create Posts'}
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Success Message */}
          {result.success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-green-900">
                    {result.message || 'Operation completed successfully'}
                  </h3>
                  {result.createdPosts && result.createdPosts.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-green-700">
                        Created {result.createdPosts.length} blog posts:
                      </p>
                      <ul className="list-disc list-inside text-sm text-green-700 mt-1">
                        {result.createdPosts.slice(0, 5).map((post, index) => (
                          <li key={index}>{post.title}</li>
                        ))}
                        {result.createdPosts.length > 5 && (
                          <li>... and {result.createdPosts.length - 5} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                  {result.validPosts && (
                    <p className="text-sm text-green-700 mt-1">
                      Validated {result.validPosts} posts successfully
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Warnings */}
          {result.warnings && result.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-yellow-900">Warnings</h3>
                  <ul className="list-disc list-inside text-sm text-yellow-700 mt-1">
                    {result.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Errors */}
          {result.errors && result.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-900">
                    Validation Errors ({result.errors.length})
                  </h3>
                  <div className="mt-2 max-h-60 overflow-y-auto">
                    <ul className="space-y-1 text-sm text-red-700">
                      {result.errors.map((error, index) => (
                        <li key={index} className="flex">
                          <span className="font-medium min-w-0 mr-2">
                            {error.row > 0 ? `Row ${error.row}:` : 'File:'}
                          </span>
                          <span className="flex-1">
                            <span className="font-medium">{error.field}</span> - {error.message}
                            {error.value && (
                              <span className="text-red-600"> (Value: "{error.value}")</span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CSV Format Guide */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">CSV Format Requirements</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Required columns:</strong> title, content, excerpt, authorId, category</p>
          <p><strong>Optional columns:</strong> slug, tags, featured, published, imageUrl</p>
          <p><strong>Valid categories:</strong> Motivation, Wisdom, Love & Relationships, Humor, Daily Inspiration, Success, Life Lessons, Philosophy</p>
          <p><strong>Boolean values:</strong> true/false, 1/0, yes/no</p>
          <p><strong>Tags format:</strong> Comma-separated values (e.g., "motivation,inspiration,growth")</p>
          <p><strong>File size limit:</strong> 5MB maximum</p>
        </div>
      </div>
    </div>
  )
}