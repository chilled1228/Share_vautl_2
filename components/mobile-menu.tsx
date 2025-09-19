"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileMenuProps {
  className?: string
}

export default function MobileMenu({ className }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Close menu when route changes
  useEffect(() => {
    const handleRouteChange = () => setIsOpen(false)
    // Listen for route changes if using Next.js router
    return () => {
      // Cleanup if needed
    }
  }, [])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const [categories, setCategories] = useState<Array<{name: string, slug: string, count: number}>>([])

  // Fetch categories for mobile menu
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data.categories.slice(0, 4)) // Show top 4 in mobile
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    fetchCategories()
  }, [])

  const menuItems = [
    { href: "/", label: "HOME" },
    { href: "/quotes", label: "QUOTES" },
    { href: "/about", label: "ABOUT" },
  ]

  return (
    <div className={cn("md:hidden", className)}>
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary text-primary-foreground p-3 brutalist-border brutalist-shadow-sm touch-target"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} aria-hidden="true" />}

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-card brutalist-border-thick z-50 transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="p-6">
          {/* Close Button */}
          <div className="flex justify-end mb-8">
            <button
              onClick={() => setIsOpen(false)}
              className="bg-destructive text-destructive-foreground p-3 brutalist-border brutalist-shadow-sm touch-target"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="space-y-4">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block bg-accent text-accent-foreground px-6 py-4 brutalist-border brutalist-shadow-sm font-bold uppercase tracking-wide touch-target hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150"
              >
                {item.label}
              </Link>
            ))}

            {/* Categories Section */}
            {categories.length > 0 && (
              <div className="pt-4">
                <h3 className="text-lg font-black mb-3 uppercase tracking-tight px-2">CATEGORIES</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <Link
                      key={category.slug}
                      href={`/category/${category.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="block bg-secondary text-secondary-foreground px-6 py-3 brutalist-border brutalist-shadow-sm font-bold uppercase tracking-wide touch-target hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 text-sm"
                    >
                      <div className="flex justify-between items-center">
                        <span>{category.name}</span>
                        <span className="text-xs bg-background text-foreground px-2 py-1 brutalist-border">
                          {category.count}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </nav>

          {/* Mobile CTA */}
          <div className="mt-12 p-6 bg-primary text-primary-foreground brutalist-border brutalist-shadow">
            <h3 className="text-xl font-black mb-4 uppercase tracking-tight">READY TO SHIFT?</h3>
            <p className="text-sm font-bold leading-relaxed mb-4">
              Join thousands who refuse to settle for mediocrity.
            </p>
            <a
              href="#all-posts"
              onClick={() => setIsOpen(false)}
              className="inline-block bg-secondary text-secondary-foreground px-4 py-2 brutalist-border text-sm font-bold uppercase tracking-wide touch-target"
            >
              START NOW
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
