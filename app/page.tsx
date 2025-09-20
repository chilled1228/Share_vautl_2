import Navigation from "@/components/navigation"
import Link from "next/link"
import { ArrowRight, Quote } from "lucide-react"
import { BlogService } from "@/lib/blog-service"
import BlogPostsSection from "@/components/blog-posts-section"
import dynamic from "next/dynamic"

// Lazy load footer since it's below the fold
const DynamicFooter = dynamic(() => import("@/components/dynamic-footer"), {
  loading: () => <div className="h-64 bg-muted animate-pulse" />,
  ssr: false
})

// Helper function to get color for category
function getCategoryColor(index: number): string {
  const colors = ["bg-primary", "bg-secondary", "bg-accent", "bg-destructive"]
  return colors[index % colors.length]
}

export default async function HomePage() {
  // Fetch featured posts, initial blog posts and total count
  const featuredPosts = await BlogService.getFeaturedPosts(3)
  const initialPosts = await BlogService.getPosts(12)
  const totalPosts = await BlogService.getTotalPostsCount()
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
            <a
              href="#all-posts"
              className="inline-flex items-center gap-4 bg-destructive text-destructive-foreground px-12 py-6 brutalist-border-thick brutalist-shadow hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all duration-200 text-2xl font-black uppercase tracking-wide"
            >
              START YOUR JOURNEY
              <ArrowRight size={32} />
            </a>
          </div>
        </div>
      </section>

      {/* Featured Posts Section */}
      {featuredPosts.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black mb-12 text-center">
              <span className="bg-destructive text-destructive-foreground px-6 py-3 brutalist-border brutalist-shadow inline-block transform -rotate-1">
                FEATURED MOTIVATION
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post, index) => (
                <Link key={post.id} href={`/${post.slug}`} className="group">
                  <article className="bg-card brutalist-border brutalist-shadow p-6 h-full hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200">
                    {post.imageUrl && (
                      <div className="mb-4 overflow-hidden">
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    )}
                    <div className={`inline-block px-3 py-1 text-sm font-bold mb-3 brutalist-border ${getCategoryColor(index)}`}>
                      {post.category}
                    </div>
                    <h3 className="text-xl font-black mb-3 group-hover:text-primary transition-colors line-clamp-3">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="bg-primary text-primary-foreground px-2 py-1 text-xs font-bold brutalist-border">
                        FEATURED
                      </span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Blog Posts */}
      <div id="all-posts">
        <BlogPostsSection initialPosts={initialPosts} totalPosts={totalPosts} />
      </div>

      <DynamicFooter />
    </div>
  )
}
