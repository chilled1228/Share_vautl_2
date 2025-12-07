import Navigation from "@/components/navigation"
import Link from "next/link"
import { ArrowRight, Home, Quote, Search } from "lucide-react"
import dynamic from "next/dynamic"
import type { Metadata } from "next"

// Lazy load footer since it's below the fold
const DynamicFooter = dynamic(() => import("@/components/dynamic-footer"), {
    loading: () => <div className="h-64 bg-muted animate-pulse" />,
    ssr: false
})

export const metadata: Metadata = {
    title: "404 - Page Not Found | ShareVault",
    description: "The page you're looking for doesn't exist. But don't worry—there's plenty more motivation to explore!",
    robots: {
        index: false,
        follow: true,
    },
}

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navigation />

            {/* Main 404 Content */}
            <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">

                    {/* Giant 404 */}
                    <div className="mb-8">
                        <span className="inline-block bg-primary text-primary-foreground px-8 py-4 sm:px-12 sm:py-6 brutalist-border-thick brutalist-shadow transform -rotate-2">
                            <span className="text-7xl sm:text-9xl md:text-[180px] font-black leading-none tracking-tighter">
                                404
                            </span>
                        </span>
                    </div>

                    {/* Page Not Found Subtitle */}
                    <div className="mb-12">
                        <span className="inline-block bg-secondary text-secondary-foreground px-6 py-3 sm:px-8 sm:py-4 brutalist-border brutalist-shadow transform rotate-1">
                            <span className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight">
                                PAGE NOT FOUND
                            </span>
                        </span>
                    </div>

                    {/* Motivational Quote Card */}
                    <div className="bg-card brutalist-border-thick brutalist-shadow max-w-2xl mx-auto p-6 sm:p-8 md:p-10 mb-12 transform rotate-1">
                        <Quote size={36} className="text-primary mb-4 mx-auto" />
                        <blockquote className="text-xl sm:text-2xl md:text-3xl font-black leading-tight mb-4 text-balance">
                            "THE ONLY IMPOSSIBLE JOURNEY IS THE ONE YOU NEVER BEGIN... BUT THIS PAGE TRULY DOESN'T EXIST."
                        </blockquote>
                        <cite className="text-base sm:text-lg font-bold text-muted-foreground uppercase tracking-wide">
                            — SHAREVAULT
                        </cite>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center gap-3 bg-destructive text-destructive-foreground px-8 py-4 sm:px-10 sm:py-5 brutalist-border-thick brutalist-shadow hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all duration-200 text-lg sm:text-xl font-black uppercase tracking-wide touch-target"
                        >
                            <Home size={24} />
                            GO BACK HOME
                        </Link>
                        <Link
                            href="/#all-posts"
                            className="inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-4 sm:px-10 sm:py-5 brutalist-border-thick brutalist-shadow hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all duration-200 text-lg sm:text-xl font-black uppercase tracking-wide touch-target"
                        >
                            <Search size={24} />
                            EXPLORE POSTS
                            <ArrowRight size={24} />
                        </Link>
                    </div>

                    {/* Quick Navigation */}
                    <div className="bg-muted brutalist-border p-6 sm:p-8 max-w-2xl mx-auto">
                        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-6">
                            MAYBE YOU'RE LOOKING FOR:
                        </h2>
                        <div className="flex flex-wrap gap-3 justify-center">
                            <Link
                                href="/"
                                className="bg-accent text-accent-foreground px-4 py-2 sm:px-6 sm:py-3 brutalist-border brutalist-shadow-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 font-bold uppercase tracking-wide text-sm sm:text-base touch-target"
                            >
                                HOME
                            </Link>
                            <Link
                                href="/quotes"
                                className="bg-primary text-primary-foreground px-4 py-2 sm:px-6 sm:py-3 brutalist-border brutalist-shadow-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 font-bold uppercase tracking-wide text-sm sm:text-base touch-target"
                            >
                                QUOTES
                            </Link>
                            <Link
                                href="/about"
                                className="bg-secondary text-secondary-foreground px-4 py-2 sm:px-6 sm:py-3 brutalist-border brutalist-shadow-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 font-bold uppercase tracking-wide text-sm sm:text-base touch-target"
                            >
                                ABOUT
                            </Link>
                            <Link
                                href="/contact"
                                className="bg-destructive text-destructive-foreground px-4 py-2 sm:px-6 sm:py-3 brutalist-border brutalist-shadow-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 font-bold uppercase tracking-wide text-sm sm:text-base touch-target"
                            >
                                CONTACT
                            </Link>
                        </div>
                    </div>

                </div>
            </main>

            <DynamicFooter />
        </div>
    )
}
