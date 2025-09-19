'use client'

import QuoteActions from './quote-actions'
import { ExtractedQuote } from '@/lib/content-processor'

interface QuoteActionsContainerProps {
  quotes: ExtractedQuote[]
}

export default function QuoteActionsContainer({ quotes }: QuoteActionsContainerProps) {
  return (
    <>
      {quotes.map((quote) => (
        <QuoteActions
          key={quote.id}
          quote={quote.text}
          className="mt-4 flex gap-3 justify-center"
        />
      ))}
    </>
  )
}