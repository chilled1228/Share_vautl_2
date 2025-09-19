import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import DailyQuote from "@/components/daily-quote"
import QuoteGallery from "@/components/quote-gallery"
import { generateSEO } from "@/lib/seo"

export const metadata = generateSEO({
  title: "Motivational Quotes with Context & Meaning",
  description:
    "Powerful quotes from history's greatest minds with deep context and actionable insights. Daily motivation that transforms lives, not just feels good.",
  keywords: ["motivational quotes", "inspirational quotes", "quotes with meaning", "daily motivation", "wisdom quotes"],
  url: "/quotes",
})

export default function QuotesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-none uppercase tracking-tight">
            <span className="bg-primary text-primary-foreground px-4 py-2 brutalist-border brutalist-shadow inline-block transform -rotate-2 mb-4">
              QUOTES
            </span>
            <br />
            <span className="bg-secondary text-secondary-foreground px-4 py-2 brutalist-border brutalist-shadow inline-block transform rotate-1">
              THAT
            </span>
            <br />
            <span className="bg-accent text-accent-foreground px-4 py-2 brutalist-border brutalist-shadow inline-block transform -rotate-1">
              MATTER
            </span>
          </h1>
          <p className="text-2xl md:text-3xl font-bold leading-relaxed text-balance">
            NOT JUST PRETTY WORDS—WISDOM THAT TRANSFORMS LIVES.
          </p>
        </div>
      </section>

      <DailyQuote />
      <QuoteGallery />

      <Footer />
    </div>
  )
}
