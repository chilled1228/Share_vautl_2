export default function Loading() {
    return (
        <div className="min-h-screen bg-background">
            {/* Navigation skeleton */}
            <nav className="bg-card brutalist-border-thick brutalist-shadow mb-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="h-8 w-32 bg-muted brutalist-border animate-pulse"></div>
                        <div className="h-10 w-24 bg-muted brutalist-border animate-pulse"></div>
                    </div>
                </div>
            </nav>

            {/* Hero Section Skeleton */}
            <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="space-y-4">
                            <div className="h-20 w-64 bg-primary brutalist-border brutalist-shadow mx-auto transform -rotate-2"></div>
                            <div className="h-20 w-48 bg-secondary brutalist-border brutalist-shadow mx-auto transform rotate-1"></div>
                            <div className="h-20 w-56 bg-accent brutalist-border brutalist-shadow mx-auto transform -rotate-1"></div>
                        </div>
                        <div className="h-8 w-full max-w-4xl bg-muted brutalist-border mx-auto mt-8 animate-pulse"></div>
                        <div className="h-8 w-3/4 max-w-4xl bg-muted brutalist-border mx-auto mt-4 animate-pulse"></div>
                    </div>

                    {/* Featured quote skeleton */}
                    <div className="bg-card brutalist-border-thick brutalist-shadow max-w-4xl mx-auto p-8 md:p-12 mb-16 transform rotate-1">
                        <div className="h-12 w-12 bg-primary brutalist-border mb-6"></div>
                        <div className="space-y-4">
                            <div className="h-10 w-full bg-muted brutalist-border animate-pulse"></div>
                            <div className="h-10 w-3/4 bg-muted brutalist-border animate-pulse"></div>
                        </div>
                        <div className="h-6 w-48 bg-muted brutalist-border mt-6 animate-pulse"></div>
                    </div>

                    {/* CTA skeleton */}
                    <div className="text-center">
                        <div className="h-16 w-80 bg-destructive brutalist-border-thick brutalist-shadow mx-auto"></div>
                    </div>
                </div>
            </section>

            {/* Featured Posts Section Skeleton */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="h-14 w-96 bg-destructive brutalist-border brutalist-shadow mx-auto transform -rotate-1"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-card brutalist-border brutalist-shadow p-6">
                                <div className="h-48 bg-muted brutalist-border mb-4 animate-pulse"></div>
                                <div className="h-6 w-24 bg-primary brutalist-border mb-3"></div>
                                <div className="h-6 w-full bg-muted brutalist-border mb-2 animate-pulse"></div>
                                <div className="h-6 w-3/4 bg-muted brutalist-border mb-3 animate-pulse"></div>
                                <div className="h-4 w-full bg-muted brutalist-border mb-2 animate-pulse"></div>
                                <div className="h-4 w-full bg-muted brutalist-border mb-2 animate-pulse"></div>
                                <div className="h-4 w-2/3 bg-muted brutalist-border mb-4 animate-pulse"></div>
                                <div className="h-4 w-32 bg-muted brutalist-border animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* All Posts Section Skeleton */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="h-12 w-64 bg-muted brutalist-border mx-auto mb-4 animate-pulse"></div>
                        <div className="h-6 w-96 bg-muted brutalist-border mx-auto animate-pulse"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className={`bg-card brutalist-border brutalist-shadow transform ${i % 2 === 0 ? 'rotate-1' : '-rotate-1'}`}>
                                <div className="h-48 bg-muted brutalist-border animate-pulse"></div>
                                <div className="p-6">
                                    <div className="h-6 w-24 bg-primary brutalist-border mb-4"></div>
                                    <div className="h-6 w-full bg-muted brutalist-border mb-2 animate-pulse"></div>
                                    <div className="h-6 w-3/4 bg-muted brutalist-border mb-4 animate-pulse"></div>
                                    <div className="h-4 w-full bg-muted brutalist-border mb-2 animate-pulse"></div>
                                    <div className="h-4 w-full bg-muted brutalist-border mb-2 animate-pulse"></div>
                                    <div className="h-4 w-2/3 bg-muted brutalist-border mb-4 animate-pulse"></div>
                                    <div className="h-4 w-32 bg-muted brutalist-border animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
