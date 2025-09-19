'use client'

import { useState } from 'react'
import { Copy, Share2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QuoteActionsProps {
  text: string
  author?: string
}

export default function QuoteActions({ text, author }: QuoteActionsProps) {
  const [copied, setCopied] = useState(false)

  const quoteText = author ? `"${text}" - ${author}` : `"${text}"`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(quoteText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Inspiring Quote',
          text: quoteText,
          url: window.location.href
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      // Fallback to copy if Web Share API is not available
      handleCopy()
    }
  }

  return (
    <div className="flex gap-2 mt-4 opacity-80 hover:opacity-100 transition-opacity">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="flex items-center gap-2 bg-background/80 hover:bg-background border-2 border-border brutalist-shadow-sm"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
        {copied ? 'Copied!' : 'Copy'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        className="flex items-center gap-2 bg-background/80 hover:bg-background border-2 border-border brutalist-shadow-sm"
      >
        <Share2 size={16} />
        Share
      </Button>
    </div>
  )
}