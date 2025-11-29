export function BlogPostsSkeleton() {
    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tight mb-4">ALL POSTS</h2>
                    <div className="h-6 w-96 max-w-full bg-muted brutalist-border mx-auto animate-pulse"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <article
                            key={i}
                            className={`bg-card brutalist-border brutalist-shadow transform ${i % 2 === 0 ? "rotate-1" : "-rotate-1"
                                }`}
                        >
                            <div className="h-48 bg-muted brutalist-border animate-pulse"></div>
                            <div className="p-6">
                                <div className="h-6 w-24 bg-primary brutalist-border mb-4"></div>
                                <div className="space-y-2 mb-3">
                                    <div className="h-6 w-full bg-muted brutalist-border animate-pulse"></div>
                                    <div className="h-6 w-3/4 bg-muted brutalist-border animate-pulse"></div>
                                </div>
                                <div className="space-y-2 mb-4">
                                    <div className="h-4 w-full bg-muted brutalist-border animate-pulse"></div>
                                    <div className="h-4 w-full bg-muted brutalist-border animate-pulse"></div>
                                    <div className="h-4 w-2/3 bg-muted brutalist-border animate-pulse"></div>
                                </div>
                                <div className="h-4 w-32 bg-muted brutalist-border animate-pulse"></div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}
