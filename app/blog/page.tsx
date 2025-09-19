import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import Link from "next/link"
import { ArrowRight, Calendar, Clock } from "lucide-react"
import { generateSEO } from "@/lib/seo"
import { BlogService } from "@/lib/blog-service"
import { BlogPost } from "@/types/blog"

export const metadata = generateSEO({
  title: "Blog - Raw Motivation & Brutal Truth",
  description:
    "Unfiltered motivation and actionable insights for personal growth. Read powerful quotes with context and practical steps to transform your mindset.",
  keywords: ["motivational blog", "personal development blog", "mindset articles", "success tips"],
  url: "/blog",
})

// Helper function to format date
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

// Helper function to calculate read time
function calculateReadTime(content: string): string {
  const wordsPerMinute = 200
  const wordCount = content.split(' ').length
  const minutes = Math.ceil(wordCount / wordsPerMinute)
  return `${minutes} min read`
}

// Helper function to get color for category
function getCategoryColor(index: number): string {
  const colors = ["bg-primary", "bg-secondary", "bg-accent", "bg-destructive"]
  return colors[index % colors.length]
}

export default async function BlogPage() {
  // Fetch posts from Firebase
  const [featuredPosts, allPosts] = await Promise.all([
    BlogService.getFeaturedPosts(3),
    BlogService.getPosts()
  ])

  // Filter out featured posts from all posts to get regular posts
  const featuredIds = new Set(featuredPosts.map(post => post.id))
  const regularPosts = allPosts.filter(post => !featuredIds.has(post.id))

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-none uppercase tracking-tight">
            <span className="bg-primary text-primary-foreground px-4 py-2 brutalist-border brutalist-shadow inline-block transform -rotate-2 mb-4">
              BRUTAL
            </span>
            <br />
            <span className="bg-secondary text-secondary-foreground px-4 py-2 brutalist-border brutalist-shadow inline-block transform rotate-1">
              TRUTH
            </span>
          </h1>
          <p className="text-2xl md:text-3xl font-bold max-w-4xl mx-auto leading-relaxed text-balance">
            NO SUGAR-COATING. NO FEEL-GOOD FLUFF. JUST RAW MOTIVATION THAT WORKS.
          </p>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-12 uppercase tracking-tight">FEATURED DROPS</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {featuredPosts.map((post, index) => (
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
                  <div className="flex items-center gap-4 mb-4">
                    <span className="bg-foreground text-background px-3 py-1 brutalist-border text-sm font-bold uppercase tracking-wide">
                      {post.category}
                    </span>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar size={16} />
                      <span className="text-sm font-bold">{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-black mb-3 uppercase tracking-tight text-balance">{post.title}</h3>
                  <p className="text-lg font-bold mb-4 leading-relaxed text-balance">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock size={16} />
                      <span className="text-sm font-bold">{post.readTime || calculateReadTime(post.content)}</span>
                    </div>
                    <Link
                      href={`/${post.slug}`}
                      className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-wide hover:text-secondary transition-colors"
                    >
                      READ <ArrowRight size={20} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* All Posts */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-12 uppercase tracking-tight">ALL POSTS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {regularPosts.map((post, index) => (
              <article
                key={post.id}
                className={`bg-card brutalist-border brutalist-shadow p-6 transform ${
                  index % 2 === 0 ? "rotate-1" : "-rotate-1"
                } hover:rotate-0 transition-transform duration-300`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="bg-foreground text-background px-3 py-1 brutalist-border text-sm font-bold uppercase tracking-wide">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar size={16} />
                    <span className="text-sm font-bold">{formatDate(post.createdAt)}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-black mb-3 uppercase tracking-tight text-balance">{post.title}</h3>
                <p className="text-lg font-bold mb-4 leading-relaxed text-balance">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock size={16} />
                    <span className="text-sm font-bold">{post.readTime || calculateReadTime(post.content)}</span>
                  </div>
                  <Link
                    href={`/${post.slug}`}
                    className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-wide hover:text-secondary transition-colors"
                  >
                    READ <ArrowRight size={20} />
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
