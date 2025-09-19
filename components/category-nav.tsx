'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

interface Category {
  name: string
  count: number
  slug: string
}

export default function CategoryNav() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data.categories.slice(0, 6)) // Show top 6 categories
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading || categories.length === 0) {
    return null
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-secondary text-secondary-foreground px-4 py-2 lg:px-6 lg:py-3 brutalist-border brutalist-shadow-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 font-bold uppercase tracking-wide text-sm lg:text-base touch-target inline-flex items-center gap-2"
      >
        CATEGORIES
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 bg-card brutalist-border brutalist-shadow z-20 min-w-[250px] transform">
            <div className="p-4">
              <h3 className="text-lg font-black mb-4 uppercase tracking-tight">EXPLORE TOPICS</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/category/${category.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="block p-3 hover:bg-muted brutalist-border transition-colors group"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold uppercase tracking-wide text-sm group-hover:text-primary">
                        {category.name}
                      </span>
                      <span className="text-xs font-bold text-muted-foreground bg-background px-2 py-1 brutalist-border">
                        {category.count}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t-2 border-border">
                <Link
                  href="/#all-posts"
                  onClick={() => setIsOpen(false)}
                  className="block text-center bg-primary text-primary-foreground px-4 py-2 brutalist-border text-sm font-bold uppercase tracking-wide hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150"
                >
                  VIEW ALL POSTS
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}