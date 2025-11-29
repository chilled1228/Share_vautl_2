export function FeaturedPostsSkeleton() {
    return (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-black mb-12 text-center">
                    <span className="bg-destructive text-destructive-foreground px-6 py-3 brutalist-border brutalist-shadow inline-block transform -rotate-1">
                        FEATURED MOTIVATION
                    </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map((i) => (
                        <article key={i} className="bg-card brutalist-border brutalist-shadow p-6 h-full">
                            <div className="mb-4 h-48 bg-muted brutalist-border animate-pulse"></div>
                            <div className="h-6 w-24 bg-primary brutalist-border mb-3"></div>
                            <div className="space-y-2 mb-3">
                                <div className="h-6 w-full bg-muted brutalist-border animate-pulse"></div>
                                <div className="h-6 w-3/4 bg-muted brutalist-border animate-pulse"></div>
                            </div>
                            <div className="space-y-2 mb-4">
                                <div className="h-4 w-full bg-muted brutalist-border animate-pulse"></div>
                                <div className="h-4 w-full bg-muted brutalist-border animate-pulse"></div>
                                <div className="h-4 w-2/3 bg-muted brutalist-border animate-pulse"></div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-20 bg-primary brutalist-border"></div>
                                <div className="h-4 w-24 bg-muted brutalist-border animate-pulse"></div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}
