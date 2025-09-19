import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import QuoteCard from "@/components/quote-card"
import ShareButtons from "@/components/share-buttons"
import { ArticleStructuredData } from "@/components/structured-data"
import BreadcrumbSchema from "@/components/structured-data/breadcrumb-schema"
import PersonSchema from "@/components/structured-data/person-schema"
import QuoteActionsInjector from "@/components/quote-actions-injector"
import { generateSEO } from "@/lib/seo"
import { BlogService } from "@/lib/blog-service"
import { parseContentServer } from "@/lib/content-processor"
import { PerformanceMonitor } from "@/lib/performance"
import { BlogPost } from "@/types/blog"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, User } from "lucide-react"
import { notFound } from "next/navigation"

// Helper function to safely convert any date to ISO string
function toISOStringSafe(date: any): string {
  if (!date) return new Date().toISOString()
  if (typeof date.toISOString === 'function') return date.toISOString()
  if (typeof date.toDate === 'function') return date.toDate().toISOString()
  if (date._seconds) return new Date(date._seconds * 1000).toISOString()
  return new Date().toISOString()
}

// Helper function to format date
function formatDate(date: any): string {
  const isoString = toISOStringSafe(date)
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(isoString))
}

// Helper function to calculate read time
function calculateReadTime(content: string): string {
  const wordsPerMinute = 200
  const wordCount = content.split(' ').length
  const minutes = Math.ceil(wordCount / wordsPerMinute)
  return `${minutes} min read`
}


interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  PerformanceMonitor.startTimer(`post-page-${(await params).slug}`)
  const { slug } = await params

  // Fetch post from Firebase by slug
  const post = await PerformanceMonitor.measureFirebaseOperation(
    `post-fetch-${slug}`,
    () => BlogService.getPostBySlug(slug)
  )

  if (!post) {
    PerformanceMonitor.endTimer(`post-page-${slug}`)
    notFound()
  }

  // Parse content for display (use server-side version)
  const parsedContent = parseContentServer(post.content)

  // Fetch related posts separately
  const relatedPosts = await PerformanceMonitor.measureFirebaseOperation(
    `related-posts-fetch-${slug}`,
    () => BlogService.getRelatedPostsOptimized(post.category, slug, 3)
  )

  return (
    <div className="min-h-screen bg-background">
      <ArticleStructuredData
        title={post.title}
        description={post.excerpt}
        author={post.author || "SHAREVAULT TEAM"}
        publishedTime={toISOStringSafe(post.createdAt)}
        url={`/${slug}`}
        category={post.category}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", item: process.env.NEXT_PUBLIC_SITE_URL || "https://www.sharevault.in" },
          { name: post.title, item: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.sharevault.in"}/${slug}` }
        ]}
      />
      <PersonSchema
        name={post.author || "SHAREVAULT TEAM"}
        jobTitle="Content Creator"
        company="ShareVault"
        url={`${process.env.NEXT_PUBLIC_SITE_URL || "https://www.sharevault.in"}/author/${(post.author || "mindshift-team").toLowerCase().replace(/\s+/g, '-')}`}
        description="Motivation and inspiration content creator focused on personal growth and mindset development"
      />

      <Navigation />

      {/* Header */}
      <header className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-wide hover:text-secondary transition-colors mb-8"
          >
            <ArrowLeft size={20} />
            BACK TO HOME
          </Link>

          <div className="mb-8">
            <span className="bg-foreground text-background px-4 py-2 brutalist-border text-sm font-bold uppercase tracking-wide">
              {post.category}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight uppercase tracking-tight text-balance">
            {post.title}
          </h1>

          <p className="text-xl md:text-2xl font-bold mb-8 leading-relaxed text-balance">{post.excerpt}</p>

          <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <User size={16} />
              <span className="font-bold">{post.author || "SHAREVAULT TEAM"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span className="font-bold">{formatDate(post.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span className="font-bold">{post.readTime || calculateReadTime(post.content)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <article className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Intro */}
          <div className="bg-muted brutalist-border brutalist-shadow p-8 mb-12 transform rotate-1">
            <p className="text-xl font-bold leading-relaxed">{parsedContent.intro}</p>
          </div>

          {/* Main Content */}
          <div className="space-y-12">
            <section>
              <div
                className="prose prose-lg max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-p:font-bold prose-p:leading-relaxed prose-blockquote:bg-muted prose-blockquote:p-6 prose-blockquote:brutalist-border prose-blockquote:brutalist-shadow prose-blockquote:font-black prose-blockquote:text-xl prose-blockquote:not-italic prose-blockquote:transform prose-blockquote:rotate-[0.5deg] prose-blockquote:my-8"
                dangerouslySetInnerHTML={{ __html: parsedContent.fullContent }}
              />
            </section>
          </div>

          {/* Quote Actions Injector */}
          <QuoteActionsInjector quotes={parsedContent.quotes} />

          {/* Share */}
          <div className="mt-16 pt-8 border-t-4 border-border">
            <ShareButtons title={post.title} url={`/${slug}`} />
          </div>

          {/* Related Posts */}
          <section className="mt-16">
            <h2 className="text-3xl md:text-4xl font-black mb-8 uppercase tracking-tight">KEEP READING</h2>
            <RelatedPosts relatedPosts={relatedPosts} />
          </section>
        </div>
      </article>

      <Footer />
    </div>
  )

  // End performance timer
  PerformanceMonitor.endTimer(`post-page-${slug}`)
}

// Optimized Related Posts Component - now uses pre-fetched data
function RelatedPosts({ relatedPosts }: { relatedPosts: BlogPost[] }) {
  if (relatedPosts.length === 0) {
    return null
  }

  return <RelatedPostsGrid posts={relatedPosts.slice(0, 2)} />
}

// Related Posts Grid Component
function RelatedPostsGrid({ posts }: { posts: BlogPost[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {posts.map((relatedPost) => (
        <Link
          key={relatedPost.id}
          href={`/${relatedPost.slug}`}
          className="bg-card brutalist-border brutalist-shadow p-6 transform hover:rotate-0 transition-transform duration-300 block"
        >
          <span className="bg-foreground text-background px-3 py-1 brutalist-border text-sm font-bold uppercase tracking-wide">
            {relatedPost.category}
          </span>
          <h3 className="text-xl font-black mt-4 mb-2 uppercase tracking-tight text-balance">
            {relatedPost.title}
          </h3>
          <p className="text-base font-bold leading-relaxed text-balance">{relatedPost.excerpt}</p>
        </Link>
      ))}
    </div>
  )
}

// Enable ISR for faster performance
export const revalidate = 3600 // Revalidate every hour

export async function generateStaticParams() {
  PerformanceMonitor.startTimer('generate-static-params')
  try {
    // Get all published posts to generate static params
    const posts = await PerformanceMonitor.measureFirebaseOperation(
      'static-params-fetch',
      () => BlogService.getPosts()
    )
    console.log(`✅ [generateStaticParams] Generated static params for ${posts.length} posts`)
    PerformanceMonitor.endTimer('generate-static-params')
    return posts.map((post) => ({
      slug: post.slug,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    PerformanceMonitor.endTimer('generate-static-params')
    return []
  }
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  PerformanceMonitor.startTimer(`generate-metadata-${(await params).slug}`)
  const { slug } = await params

  try {
    const post = await PerformanceMonitor.measureFirebaseOperation(
      `metadata-fetch-${slug}`,
      () => BlogService.getPostBySlug(slug)
    )

    if (!post) {
      PerformanceMonitor.endTimer(`generate-metadata-${slug}`)
      return {
        title: "Post Not Found",
      }
    }

    const metadata = generateSEO({
      title: post.title,
      description: post.excerpt,
      keywords: post.tags || [post.category.toLowerCase()],
      author: post.author || "SHAREVAULT TEAM",
      publishedTime: toISOStringSafe(post.createdAt),
      section: post.category,
      tags: post.tags || [post.category.toLowerCase()],
      url: `/${slug}`,
    })

    PerformanceMonitor.endTimer(`generate-metadata-${slug}`)
    return metadata
  } catch (error) {
    console.error('Error generating metadata:', error)
    PerformanceMonitor.endTimer(`generate-metadata-${slug}`)
    return {
      title: "Post Not Found",
    }
  }
}