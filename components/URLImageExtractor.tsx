'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Image as ImageIcon, ExternalLink, Check } from 'lucide-react'

interface URLImageExtractorProps {
  onImageSelect: (imageUrl: string) => void
  currentImageUrl?: string
}

export default function URLImageExtractor({ onImageSelect, currentImageUrl }: URLImageExtractorProps) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [featuredImage, setFeaturedImage] = useState<string | null>(null)

  const handleExtractImages = async () => {
    if (!url) return

    setLoading(true)
    setError('')
    setImages([])
    setFeaturedImage(null)

    try {
      const response = await fetch('/api/extract-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract images')
      }

      setImages(data.images || [])
      setFeaturedImage(data.featuredImage || null)

    } catch (err) {
      console.error('Error extracting images:', err)
      setError(err instanceof Error ? err.message : 'Failed to extract images')
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = (imageUrl: string) => {
    onImageSelect(imageUrl)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="url">Extract Images from URL</Label>
          <Input
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/article"
            className="brutalist-border"
          />
        </div>
        <Button
          onClick={handleExtractImages}
          disabled={loading || !url}
          className="mt-6 bg-primary text-primary-foreground brutalist-border brutalist-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImageIcon className="h-4 w-4" />
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {featuredImage && (
        <Card className="brutalist-border">
          <CardHeader>
            <CardTitle className="text-sm">Featured Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative group">
              <img
                src={featuredImage}
                alt="Featured image"
                className="w-full h-48 object-cover rounded-lg border"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                <Button
                  onClick={() => handleImageSelect(featuredImage)}
                  className="bg-white text-black hover:bg-gray-100"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Select
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {images.length > 0 && (
        <Card className="brutalist-border">
          <CardHeader>
            <CardTitle className="text-sm">Available Images ({images.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <img
                    src={imageUrl}
                    alt={`Extracted image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                    <Button
                      onClick={() => handleImageSelect(imageUrl)}
                      size="sm"
                      className="bg-white text-black hover:bg-gray-100"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Select
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {currentImageUrl && (
        <Card className="brutalist-border">
          <CardHeader>
            <CardTitle className="text-sm">Current Featured Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <img
                src={currentImageUrl}
                alt="Current featured image"
                className="w-full h-48 object-cover rounded-lg border"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <div className="absolute top-2 right-2">
                <a
                  href={currentImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-black p-2 rounded-full hover:bg-gray-100"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}