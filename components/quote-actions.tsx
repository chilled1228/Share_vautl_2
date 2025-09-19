'use client'

import { useState } from 'react'
import { Copy, Share2 } from 'lucide-react'

interface QuoteActionsProps {
  quote: string
  className?: string
}

export default function QuoteActions({ quote, className = '' }: QuoteActionsProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const copyQuote = async () => {
    try {
      await navigator.clipboard.writeText(quote)
      showToast('Quote copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy text: ', err)
      fallbackCopyTextToClipboard(quote)
    }
  }

  const shareQuote = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Inspiring Quote from ShareVault',
          text: `${quote} - ShareVault`,
          url: window.location.href
        })
      } catch (err) {
        console.error('Error sharing:', err)
        fallbackShare(quote)
      }
    } else {
      fallbackShare(quote)
    }
  }

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.top = '0'
    textArea.style.left = '0'
    textArea.style.position = 'fixed'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      const successful = document.execCommand('copy')
      if (successful) {
        showToast('Quote copied to clipboard!')
      } else {
        showToast('Failed to copy quote')
      }
    } catch (err) {
      console.error('Fallback: Unable to copy', err)
      showToast('Copy failed')
    }

    document.body.removeChild(textArea)
  }

  const fallbackShare = (text: string) => {
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${text} - ShareVault`)}&url=${encodeURIComponent(window.location.href)}`
    window.open(shareUrl, '_blank')
  }

  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(null), 3000)
  }

  return (
    <>
      <div className={`quote-actions-container mt-4 flex gap-3 justify-center ${className}`}>
        <button
          onClick={copyQuote}
          className="bg-primary text-primary-foreground px-4 py-2 brutalist-border brutalist-shadow-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 font-bold uppercase tracking-wide text-sm touch-target inline-flex items-center gap-2"
          aria-label="Copy quote"
        >
          <Copy size={16} />
          COPY
        </button>
        <button
          onClick={shareQuote}
          className="bg-secondary text-secondary-foreground px-4 py-2 brutalist-border brutalist-shadow-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 font-bold uppercase tracking-wide text-sm touch-target inline-flex items-center gap-2"
          aria-label="Share quote"
        >
          <Share2 size={16} />
          SHARE
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className="fixed top-4 right-4 bg-primary text-primary-foreground px-4 py-3 brutalist-border brutalist-shadow font-bold uppercase text-sm z-50"
          style={{
            backgroundColor: '#1a0b2e',
            color: 'white',
            border: '3px solid #000',
            boxShadow: '4px 4px 0 #000'
          }}
        >
          {toastMessage}
        </div>
      )}
    </>
  )
}