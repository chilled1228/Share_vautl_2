export function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation skeleton */}
      <div className="bg-card brutalist-border-thick brutalist-shadow mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="h-8 w-32 bg-muted brutalist-border animate-pulse"></div>
            <div className="h-8 w-24 bg-muted brutalist-border animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Hero section skeleton */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="space-y-4">
              <div className="h-20 w-64 bg-primary brutalist-border brutalist-shadow mx-auto"></div>
              <div className="h-20 w-48 bg-secondary brutalist-border brutalist-shadow mx-auto"></div>
              <div className="h-20 w-56 bg-accent brutalist-border brutalist-shadow mx-auto"></div>
            </div>
            <div className="h-6 w-96 bg-muted brutalist-border mx-auto mt-8 animate-pulse"></div>
          </div>

          {/* Featured quote skeleton */}
          <div className="bg-card brutalist-border-thick brutalist-shadow max-w-4xl mx-auto p-8 md:p-12 mb-16">
            <div className="h-12 w-12 bg-primary brutalist-border mb-6"></div>
            <div className="space-y-4">
              <div className="h-8 w-full bg-muted brutalist-border animate-pulse"></div>
              <div className="h-8 w-3/4 bg-muted brutalist-border animate-pulse"></div>
            </div>
            <div className="h-6 w-48 bg-muted brutalist-border mt-6 animate-pulse"></div>
          </div>

          {/* CTA skeleton */}
          <div className="text-center">
            <div className="h-16 w-72 bg-destructive brutalist-border-thick brutalist-shadow mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  )
}