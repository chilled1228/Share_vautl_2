'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Loader2 } from 'lucide-react'
import { BlogPost } from '@/types/blog'

interface BlogPostsSectionProps {
  initialPosts: BlogPost[]
  totalPosts: number
}

// Helper function to get color for category
function getCategoryColor(index: number): string {
  const colors = ["bg-primary", "bg-secondary", "bg-accent", "bg-destructive"]
  return colors[index % colors.length]
}

export default function BlogPostsSection({ initialPosts, totalPosts }: BlogPostsSectionProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialPosts.length < totalPosts)

  const loadMorePosts = async () => {
    if (loading || !hasMore) return

    setLoading(true)
    try {
      const response = await fetch(`/api/posts?offset=${posts.length}&limit=12`)
      if (!response.ok) throw new Error('Failed to fetch posts')

      const data = await response.json()
      const newPosts = data.posts || []

      setPosts(prev => [...prev, ...newPosts])
      setHasMore(posts.length + newPosts.length < totalPosts)
    } catch (error) {
      console.error('Error loading more posts:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tight mb-4">ALL POSTS</h2>
          <p className="text-xl font-bold text-muted-foreground">
            {totalPosts} POWERFUL POSTS TO TRANSFORM YOUR MINDSET
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {posts.map((post, index) => (
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
                <span className="bg-foreground text-background px-3 py-1 brutalist-border text-sm font-bold uppercase tracking-wide">
                  {post.category}
                </span>
                <h3 className="text-xl font-black mt-3 mb-2 uppercase tracking-tight text-balance line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-base font-bold mb-4 leading-relaxed text-balance line-clamp-3">
                  {post.excerpt}
                </p>
                <Link
                  href={`/${post.slug}`}
                  className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-wide hover:text-secondary transition-colors"
                >
                  READ MORE <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {hasMore && (
          <div className="text-center mt-16">
            <button
              onClick={loadMorePosts}
              disabled={loading}
              className="inline-flex items-center gap-4 bg-destructive text-destructive-foreground px-12 py-6 brutalist-border-thick brutalist-shadow hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all duration-200 text-xl font-black uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  LOADING...
                </>
              ) : (
                <>
                  LOAD MORE POSTS
                  <ArrowRight size={24} />
                </>
              )}
            </button>
          </div>
        )}

        {!hasMore && posts.length > 12 && (
          <div className="text-center mt-16">
            <p className="text-xl font-bold text-muted-foreground">
              🎉 YOU'VE SEEN ALL {totalPosts} POSTS! KEEP CHECKING BACK FOR MORE MOTIVATION.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}