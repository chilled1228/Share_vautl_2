'use client'

import { useEffect, useState } from 'react'
import QuoteActions from './quote-actions'
import { ExtractedQuote } from '@/lib/content-processor'

interface QuoteActionsRendererProps {
  quotes: ExtractedQuote[]
}

export default function QuoteActionsRenderer({ quotes }: QuoteActionsRendererProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <>
      {quotes.map((quote) => (
        <QuoteActionsInjector key={quote.id} quote={quote} />
      ))}
    </>
  )
}

function QuoteActionsInjector({ quote }: { quote: ExtractedQuote }) {
  useEffect(() => {
    const injectQuoteActions = () => {
      const placeholder = document.getElementById(quote.id)
      if (placeholder && !placeholder.hasChildNodes()) {
        const actionContainer = document.createElement('div')

        // Create a React root and render the QuoteActions component
        const root = document.createElement('div')
        placeholder.appendChild(root)

        // Simple innerHTML approach for now (can be upgraded to React portal later)
        actionContainer.innerHTML = `
          <div class="quote-actions-container mt-4 flex gap-3 justify-center">
            <button
              onclick="window.copyQuote && window.copyQuote(\`${quote.text.replace(/'/g, "\\'")}\`)"
              class="bg-primary text-primary-foreground px-4 py-2 brutalist-border brutalist-shadow-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 font-bold uppercase tracking-wide text-sm touch-target inline-flex items-center gap-2"
              aria-label="Copy quote"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5H6C5.44772 5 5 5.44772 5 6V18C5 18.5523 5.44772 19 6 19H16C16.5523 19 17 18.5523 17 18V16M8 5V3C8 2.44772 8.44772 2 9 2H19C19.5523 2 20 2.44772 20 3V13C20 13.5523 19.5523 14 19 14H17M8 5H9C9.55228 5 10 5.44772 10 6V14C10 14.5523 9.55228 15 9 15H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              COPY
            </button>
            <button
              onclick="window.shareQuote && window.shareQuote(\`${quote.text.replace(/'/g, "\\'")}\`)"
              class="bg-secondary text-secondary-foreground px-4 py-2 brutalist-border brutalist-shadow-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 font-bold uppercase tracking-wide text-sm touch-target inline-flex items-center gap-2"
              aria-label="Share quote"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49M21 5C21 6.65685 19.6569 8 18 8C16.3431 8 15 6.65685 15 5C15 3.34315 16.3431 2 18 2C19.6569 2 21 3.34315 21 5ZM9 12C9 13.6569 7.65685 15 6 15C4.34315 15 3 13.6569 3 12C3 10.3431 4.34315 9 6 9C7.65685 9 9 10.3431 9 12ZM21 19C21 20.6569 19.6569 22 18 22C16.3431 22 15 20.6569 15 19C15 17.3431 16.3431 16 18 16C19.6569 16 21 17.3431 21 19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              SHARE
            </button>
          </div>
        `

        placeholder.appendChild(actionContainer)
      }
    }

    // Try to inject immediately and also after a short delay for dynamic content
    injectQuoteActions()
    const timeoutId = setTimeout(injectQuoteActions, 100)

    return () => clearTimeout(timeoutId)
  }, [quote.id, quote.text])

  return null
}