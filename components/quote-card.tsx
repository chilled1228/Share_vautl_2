import { Quote } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuoteCardProps {
  quote: string
  author: string
  context?: string
  className?: string
  variant?: "default" | "large" | "compact"
}

export default function QuoteCard({ quote, author, context, className, variant = "default" }: QuoteCardProps) {
  const variants = {
    default: {
      container: "p-8 md:p-12",
      quote: "text-2xl md:text-3xl",
      author: "text-lg md:text-xl",
      context: "text-base md:text-lg",
      icon: 48,
    },
    large: {
      container: "p-12 md:p-16",
      quote: "text-3xl md:text-5xl",
      author: "text-xl md:text-2xl",
      context: "text-lg md:text-xl",
      icon: 64,
    },
    compact: {
      container: "p-6",
      quote: "text-lg md:text-xl",
      author: "text-base md:text-lg",
      context: "text-sm md:text-base",
      icon: 32,
    },
  }

  const v = variants[variant]

  return (
    <div className={cn("bg-card brutalist-border-thick brutalist-shadow transform -rotate-1", className)}>
      <div className={v.container}>
        <Quote size={v.icon} className="text-primary mb-6" />
        <blockquote className={cn("font-black leading-tight mb-6 text-balance uppercase tracking-tight", v.quote)}>
          "{quote}"
        </blockquote>
        <cite className={cn("font-bold text-muted-foreground uppercase tracking-wide block mb-4", v.author)}>
          — {author}
        </cite>
        {context && (
          <div className="bg-muted brutalist-border p-4 md:p-6 mt-6">
            <p className={cn("font-bold leading-relaxed text-balance", v.context)}>{context}</p>
          </div>
        )}
      </div>
    </div>
  )
}
