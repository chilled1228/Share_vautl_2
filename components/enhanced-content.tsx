'use client'

import { useEffect, useRef } from 'react'
import QuoteActions from './quote-actions'
import { createRoot } from 'react-dom/client'

interface EnhancedContentProps {
  content: string
  className?: string
}

export default function EnhancedContent({ content, className = '' }: EnhancedContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!contentRef.current) return

    // Find all blockquotes and add quote actions
    const blockquotes = contentRef.current.querySelectorAll('blockquote')

    blockquotes.forEach((blockquote) => {
      // Skip if already has actions
      if (blockquote.querySelector('.quote-actions-container')) return

      const text = blockquote.textContent || ''

      // Create container for the actions
      const actionsContainer = document.createElement('div')
      actionsContainer.className = 'quote-actions-container'
      blockquote.appendChild(actionsContainer)

      // Render React component into the container
      const root = createRoot(actionsContainer)
      root.render(<QuoteActions text={text} />)
    })
  }, [content])

  return (
    <div
      ref={contentRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}