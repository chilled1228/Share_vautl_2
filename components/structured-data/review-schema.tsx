interface ReviewItem {
  reviewRating: {
    ratingValue: number
    bestRating?: number
    worstRating?: number
  }
  author: {
    name: string
    type?: "Person" | "Organization"
  }
  reviewBody: string
  datePublished?: string
  publisher?: {
    name: string
    type?: "Person" | "Organization"
  }
}

interface ReviewSchemaProps {
  itemReviewed: {
    name: string
    type: "Product" | "Service" | "Book" | "Movie" | "LocalBusiness" | "Organization"
    image?: string
    description?: string
    url?: string
    brand?: string
  }
  reviews: ReviewItem[]
  aggregateRating?: {
    ratingValue: number
    reviewCount: number
    bestRating?: number
    worstRating?: number
  }
}

export default function ReviewSchema({
  itemReviewed,
  reviews,
  aggregateRating
}: ReviewSchemaProps) {
  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": itemReviewed.type,
    "name": itemReviewed.name,
    ...(itemReviewed.image && { "image": itemReviewed.image }),
    ...(itemReviewed.description && { "description": itemReviewed.description }),
    ...(itemReviewed.url && { "url": itemReviewed.url }),
    ...(itemReviewed.brand && { "brand": itemReviewed.brand }),
    "review": reviews.map(review => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.reviewRating.ratingValue,
        "bestRating": review.reviewRating.bestRating || 5,
        "worstRating": review.reviewRating.worstRating || 1
      },
      "author": {
        "@type": review.author.type || "Person",
        "name": review.author.name
      },
      "reviewBody": review.reviewBody,
      ...(review.datePublished && { "datePublished": review.datePublished }),
      ...(review.publisher && { "publisher": {
        "@type": review.publisher.type || "Organization",
        "name": review.publisher.name
      }})
    })),
    ...(aggregateRating && { "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": aggregateRating.ratingValue,
      "reviewCount": aggregateRating.reviewCount,
      "bestRating": aggregateRating.bestRating || 5,
      "worstRating": aggregateRating.worstRating || 1
    }})
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
    />
  )
}