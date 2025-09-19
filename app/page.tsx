import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import Link from "next/link"
import { ArrowRight, Quote, Target, Zap } from "lucide-react"
import { BlogService } from "@/lib/blog-service"

// Helper function to get color for category
function getCategoryColor(index: number): string {
  const colors = ["bg-primary", "bg-secondary", "bg-accent", "bg-destructive"]
  return colors[index % colors.length]
}

export default async function HomePage() {
  // Fetch latest blog posts
  const latestPosts = await BlogService.getPosts(3)
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 leading-none">
              <span className="bg-primary text-primary-foreground px-4 py-2 brutalist-border brutalist-shadow inline-block transform -rotate-2 mb-4">
                SHIFT
              </span>
              <br />
              <span className="bg-secondary text-secondary-foreground px-4 py-2 brutalist-border brutalist-shadow inline-block transform rotate-1">
                YOUR
              </span>
              <br />
              <span className="bg-accent text-accent-foreground px-4 py-2 brutalist-border brutalist-shadow inline-block transform -rotate-1">
                MIND
              </span>
            </h1>
            <p className="text-2xl md:text-3xl font-bold max-w-4xl mx-auto leading-relaxed text-balance">
              RAW MOTIVATION. BRUTAL HONESTY. UNFILTERED INSPIRATION FOR THOSE WHO REFUSE TO SETTLE.
            </p>
          </div>

          {/* Featured Quote */}
          <div className="bg-card brutalist-border-thick brutalist-shadow max-w-4xl mx-auto p-8 md:p-12 mb-16 transform rotate-1">
            <Quote size={48} className="text-primary mb-6" />
            <blockquote className="text-3xl md:text-4xl font-black leading-tight mb-6 text-balance">
              "THE ONLY IMPOSSIBLE JOURNEY IS THE ONE YOU NEVER BEGIN."
            </blockquote>
            <cite className="text-xl font-bold text-muted-foreground uppercase tracking-wide">— TONY ROBBINS</cite>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-4 bg-destructive text-destructive-foreground px-12 py-6 brutalist-border-thick brutalist-shadow hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all duration-200 text-2xl font-black uppercase tracking-wide"
            >
              START YOUR JOURNEY
              <ArrowRight size={32} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-black text-center mb-16 uppercase tracking-tight">WHAT YOU GET</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card brutalist-border brutalist-shadow p-8 transform -rotate-1">
              <Quote size={48} className="text-primary mb-6" />
              <h3 className="text-3xl font-black mb-4 uppercase tracking-tight">POWERFUL QUOTES</h3>
              <p className="text-lg font-bold leading-relaxed">
                Curated wisdom from the greatest minds. No fluff, just pure motivation that hits different.
              </p>
            </div>

            <div className="bg-card brutalist-border brutalist-shadow p-8 transform rotate-1">
              <Target size={48} className="text-secondary mb-6" />
              <h3 className="text-3xl font-black mb-4 uppercase tracking-tight">DEEP CONTEXT</h3>
              <p className="text-lg font-bold leading-relaxed">
                Every quote comes with the story behind it. Understand the why, not just the what.
              </p>
            </div>

            <div className="bg-card brutalist-border brutalist-shadow p-8 transform -rotate-1">
              <Zap size={48} className="text-accent mb-6" />
              <h3 className="text-3xl font-black mb-4 uppercase tracking-tight">ACTIONABLE INSIGHTS</h3>
              <p className="text-lg font-bold leading-relaxed">
                Turn inspiration into action. Practical steps to implement what you learn.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Posts Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tight">LATEST DROPS</h2>
            <Link
              href="/blog"
              className="bg-primary text-primary-foreground px-8 py-4 brutalist-border brutalist-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 font-bold uppercase tracking-wide"
            >
              VIEW ALL
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestPosts.map((post, index) => (
              <article
                key={post.id}
                className={`bg-card brutalist-border brutalist-shadow transform ${
                  index % 2 === 0 ? "rotate-1" : "-rotate-1"
                } hover:rotate-0 transition-transform duration-300`}
              >
                {post.imageUrl ? (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className={`h-48 ${getCategoryColor(index)} flex items-center justify-center`}>
                    <span className="text-white text-lg font-black uppercase tracking-wide opacity-50">
                      {post.category}
                    </span>
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-2xl font-black mb-3 uppercase tracking-tight text-balance">
                    {post.title}
                  </h3>
                  <p className="text-lg font-bold mb-4 leading-relaxed text-balance">
                    {post.excerpt}
                  </p>
                  <Link
                    href={`/${post.slug}`}
                    className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-wide hover:text-secondary transition-colors"
                  >
                    READ MORE <ArrowRight size={20} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
