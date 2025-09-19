'use client'

import { useEffect, useState } from 'react'
import { Copy, Share2 } from 'lucide-react'
import { ExtractedQuote } from '@/lib/content-processor'

interface QuoteActionsInjectorProps {
  quotes: ExtractedQuote[]
}

export default function QuoteActionsInjector({ quotes }: QuoteActionsInjectorProps) {
  const [mounted, setMounted] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const copyQuote = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      showToast('Quote copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy text: ', err)
      fallbackCopyTextToClipboard(text)
    }
  }

  const shareQuote = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Inspiring Quote from ShareVault',
          text: `${text} - ShareVault`,
          url: window.location.href
        })
      } catch (err) {
        console.error('Error sharing:', err)
        fallbackShare(text)
      }
    } else {
      fallbackShare(text)
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

  useEffect(() => {
    if (!mounted) return

    const injectQuoteActions = () => {
      quotes.forEach((quote) => {
        const placeholder = document.getElementById(quote.id)
        if (placeholder && !placeholder.hasChildNodes()) {
          // Create quote actions HTML directly
          const actionsHtml = `
            <div class="quote-actions-container mt-4 flex gap-3 justify-center">
              <button
                onclick="window.quoteActions && window.quoteActions.copy('${quote.text.replace(/'/g, "\\'").replace(/"/g, '\\"')}')"
                class="bg-primary text-primary-foreground px-4 py-2 brutalist-border brutalist-shadow-sm btn-gradient-hover hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 font-bold uppercase tracking-wide text-sm touch-target inline-flex items-center gap-2"
                aria-label="Copy quote"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 5H6C5.44772 5 5 5.44772 5 6V18C5 18.5523 5.44772 19 6 19H16C16.5523 19 17 18.5523 17 18V16M8 5V3C8 2.44772 8.44772 2 9 2H19C19.5523 2 20 2.44772 20 3V13C20 13.5523 19.5523 14 19 14H17M8 5H9C9.55228 5 10 5.44772 10 6V14C10 14.5523 9.55228 15 9 15H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                COPY
              </button>
              <button
                onclick="window.quoteActions && window.quoteActions.share('${quote.text.replace(/'/g, "\\'").replace(/"/g, '\\"')}')"
                class="bg-secondary text-secondary-foreground px-4 py-2 brutalist-border brutalist-shadow-sm btn-gradient-hover hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 font-bold uppercase tracking-wide text-sm touch-target inline-flex items-center gap-2"
                aria-label="Share quote"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49M21 5C21 6.65685 19.6569 8 18 8C16.3431 8 15 6.65685 15 5C15 3.34315 16.3431 2 18 2C19.6569 2 21 3.34315 21 5ZM9 12C9 13.6569 7.65685 15 6 15C4.34315 15 3 13.6569 3 12C3 10.3431 4.34315 9 6 9C7.65685 9 9 10.3431 9 12ZM21 19C21 20.6569 19.6569 22 18 22C16.3431 22 15 20.6569 15 19C15 17.3431 16.3431 16 18 16C19.6569 16 21 17.3431 21 19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                SHARE
              </button>
            </div>
          `
          placeholder.innerHTML = actionsHtml
        }
      })
    }

    // Set up global functions for button clicks
    window.quoteActions = {
      copy: copyQuote,
      share: shareQuote,
      showToast: showToast
    }

    // Try to inject immediately and also after content loads
    injectQuoteActions()
    const timeoutId = setTimeout(injectQuoteActions, 100)
    const loadTimeoutId = setTimeout(injectQuoteActions, 1000)

    return () => {
      clearTimeout(timeoutId)
      clearTimeout(loadTimeoutId)
      delete window.quoteActions
    }
  }, [mounted, quotes])

  return (
    <>
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

// Add global type declaration
declare global {
  interface Window {
    quoteActions?: {
      copy: (text: string) => Promise<void>
      share: (text: string) => Promise<void>
      showToast: (message: string) => void
    }
  }
}