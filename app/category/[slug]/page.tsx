import Navigation from "@/components/navigation"
import DynamicFooter from "@/components/dynamic-footer"
import CategoryPostsSection from "@/components/category-posts-section"
import BreadcrumbSchema from "@/components/structured-data/breadcrumb-schema"
import { generateSEO } from "@/lib/seo"
import { BlogService } from "@/lib/blog-service"
import Link from "next/link"
import { ArrowLeft, Quote } from "lucide-react"
import { notFound } from "next/navigation"

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

// Category motivational quotes
const categoryQuotes: Record<string, {quote: string, author: string}> = {
  motivation: {
    quote: "MOTIVATION IS WHAT GETS YOU STARTED. HABIT IS WHAT KEEPS YOU GOING.",
    author: "JIM RYUN"
  },
  inspiration: {
    quote: "THE ONLY IMPOSSIBLE JOURNEY IS THE ONE YOU NEVER BEGIN.",
    author: "TONY ROBBINS"
  },
  "personal-growth": {
    quote: "THE ONLY PERSON YOU ARE DESTINED TO BECOME IS THE PERSON YOU DECIDE TO BE.",
    author: "RALPH WALDO EMERSON"
  },
  mindset: {
    quote: "WHETHER YOU THINK YOU CAN OR YOU THINK YOU CAN'T, YOU'RE RIGHT.",
    author: "HENRY FORD"
  },
  success: {
    quote: "SUCCESS IS NOT FINAL, FAILURE IS NOT FATAL: IT IS THE COURAGE TO CONTINUE THAT COUNTS.",
    author: "WINSTON CHURCHILL"
  },
  discipline: {
    quote: "DISCIPLINE IS THE BRIDGE BETWEEN GOALS AND ACCOMPLISHMENT.",
    author: "JIM ROHN"
  },
  "life-wisdom": {
    quote: "THE UNEXAMINED LIFE IS NOT WORTH LIVING.",
    author: "SOCRATES"
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params

  // Convert slug to category name
  const category = slug.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ')

  try {
    // Get initial posts and total count
    const initialPosts = await BlogService.getPostsByCategoryWithPagination(category, 0, 12)
    const totalPosts = await BlogService.getCategoryPostsCount(category)

    // If no posts found, check if category exists at all
    if (totalPosts === 0) {
      const allCategories = await BlogService.getCategories()
      const categoryExists = allCategories.some(cat =>
        cat.toLowerCase() === category.toLowerCase()
      )

      if (!categoryExists) {
        notFound()
      }
    }

    // Get category quote or use default
    const categoryQuote = categoryQuotes[slug] || {
      quote: "TRANSFORM YOUR MINDSET, TRANSFORM YOUR LIFE.",
      author: "SHAREVAULT"
    }

    return (
      <div className="min-h-screen bg-background">
        <BreadcrumbSchema
          items={[
            { name: "Home", item: process.env.NEXT_PUBLIC_SITE_URL || "https://www.sharevault.in" },
            { name: "Categories", item: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.sharevault.in"}/#categories` },
            { name: category, item: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.sharevault.in"}/category/${slug}` }
          ]}
        />

        <Navigation />

        {/* Header */}
        <header className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-wide hover:text-secondary transition-colors mb-8"
            >
              <ArrowLeft size={20} />
              BACK TO HOME
            </Link>

            <div className="text-center mb-16">
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 leading-none">
                <span className="bg-primary text-primary-foreground px-4 py-2 brutalist-border brutalist-shadow inline-block transform -rotate-2 mb-4">
                  {category.split(' ')[0]}
                </span>
                {category.split(' ').length > 1 && (
                  <>
                    <br />
                    <span className="bg-secondary text-secondary-foreground px-4 py-2 brutalist-border brutalist-shadow inline-block transform rotate-1">
                      {category.split(' ').slice(1).join(' ')}
                    </span>
                  </>
                )}
              </h1>
              <p className="text-2xl md:text-3xl font-bold max-w-4xl mx-auto leading-relaxed text-balance">
                DISCOVER POWERFUL {category.toUpperCase()} CONTENT THAT WILL TRANSFORM YOUR MINDSET
              </p>
            </div>

            {/* Category Quote */}
            <div className="bg-card brutalist-border-thick brutalist-shadow max-w-4xl mx-auto p-8 md:p-12 mb-16 transform rotate-1">
              <Quote size={48} className="text-primary mb-6" />
              <blockquote className="text-2xl md:text-3xl font-black leading-tight mb-6 text-balance">
                "{categoryQuote.quote}"
              </blockquote>
              <cite className="text-xl font-bold text-muted-foreground uppercase tracking-wide">
                — {categoryQuote.author}
              </cite>
            </div>

            {/* Stats */}
            <div className="bg-muted brutalist-border brutalist-shadow max-w-2xl mx-auto p-6 md:p-8 transform -rotate-1">
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-black text-primary mb-2">
                  {totalPosts}
                </div>
                <div className="text-xl font-bold uppercase tracking-wide">
                  {totalPosts === 1 ? 'POST' : 'POSTS'} AVAILABLE
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Category Posts */}
        <CategoryPostsSection
          initialPosts={initialPosts}
          totalPosts={totalPosts}
          category={category}
          categorySlug={slug}
        />

        <DynamicFooter />
      </div>
    )
  } catch (error) {
    console.error('Error loading category page:', error)
    notFound()
  }
}

export async function generateStaticParams() {
  try {
    const categories = await BlogService.getCategoriesWithCounts()
    return categories.map((category) => ({
      slug: category.slug,
    }))
  } catch (error) {
    console.error('Error generating static params for categories:', error)
    return []
  }
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params

  try {
    const category = slug.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')

    const totalPosts = await BlogService.getCategoryPostsCount(category)

    if (totalPosts === 0) {
      return {
        title: "Category Not Found",
      }
    }

    return generateSEO({
      title: `${category} Posts - Motivational Content`,
      description: `Discover ${totalPosts} powerful ${category.toLowerCase()} posts with raw motivation and brutal honesty. Transform your mindset with actionable insights.`,
      keywords: [category.toLowerCase(), "motivation", "inspiration", "personal growth", "mindset"],
      url: `/category/${slug}`,
    })
  } catch (error) {
    console.error('Error generating metadata for category:', error)
    return {
      title: "Category Not Found",
    }
  }
}