import { memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { BlogPost } from '@/types/blog'

interface BlogPostCardProps {
  post: BlogPost
  index: number
}

// Helper function to get color for category
function getCategoryColor(index: number): string {
  const colors = ["bg-primary", "bg-secondary", "bg-accent", "bg-destructive"]
  return colors[index % colors.length]
}

const BlogPostCard = memo(function BlogPostCard({ post, index }: BlogPostCardProps) {
  return (
    <article
      className={`bg-card brutalist-border brutalist-shadow transform ${index % 2 === 0 ? "rotate-1" : "-rotate-1"
        } hover:rotate-0 transition-transform duration-300`}
    >
      {post.imageUrl ? (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            className="object-cover"
            loading="lazy"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        </div>
      ) : (
        <div className="h-48 bg-muted flex items-center justify-center">
          <span className="text-4xl font-black text-muted-foreground">?</span>
        </div>
      )}

      <div className="p-6">
        {post.category && (
          <div
            className={`inline-block px-3 py-1 text-sm font-black uppercase tracking-wide text-foreground brutalist-border mb-4 ${getCategoryColor(
              index
            )}`}
          >
            {post.category}
          </div>
        )}

        <h3 className="text-xl font-black mb-3 leading-tight line-clamp-2">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="text-muted-foreground font-bold mb-4 line-clamp-3">
            {post.excerpt}
          </p>
        )}

        <Link
          href={`/${post.slug}`}
          className="inline-flex items-center gap-2 font-black uppercase tracking-wide text-primary hover:text-primary/80 transition-colors"
        >
          READ MORE
          <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  )
})

export default BlogPostCard