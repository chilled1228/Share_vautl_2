'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import { Twitter, Instagram, Facebook, Mail } from "lucide-react"

interface Category {
  name: string
  count: number
  slug: string
}

export default function DynamicFooter() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data.categories.slice(0, 5)) // Show top 5 categories
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return (
    <footer className="bg-foreground text-background mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="bg-primary text-primary-foreground px-6 py-3 brutalist-border brutalist-shadow-sm inline-block mb-6">
              <span className="text-3xl font-black tracking-tighter">SHAREVAULT</span>
            </div>
            <p className="text-xl font-bold mb-6 leading-relaxed">
              RAW MOTIVATION.
              <br />
              UNFILTERED INSPIRATION.
              <br />
              BRUTAL HONESTY FOR GROWTH.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="bg-accent text-accent-foreground p-3 brutalist-border brutalist-shadow-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150"
              >
                <Twitter size={24} />
              </a>
              <a
                href="#"
                className="bg-secondary text-secondary-foreground p-3 brutalist-border brutalist-shadow-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150"
              >
                <Instagram size={24} />
              </a>
              <a
                href="#"
                className="bg-primary text-primary-foreground p-3 brutalist-border brutalist-shadow-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150"
              >
                <Facebook size={24} />
              </a>
              <a
                href="#"
                className="bg-destructive text-destructive-foreground p-3 brutalist-border brutalist-shadow-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150"
              >
                <Mail size={24} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-2xl font-black mb-6 uppercase tracking-tight">NAVIGATE</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-lg font-bold hover:text-accent transition-colors uppercase tracking-wide"
                >
                  HOME
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-lg font-bold hover:text-primary transition-colors uppercase tracking-wide"
                >
                  ABOUT
                </Link>
              </li>
              <li>
                <Link
                  href="/quotes"
                  className="text-lg font-bold hover:text-secondary transition-colors uppercase tracking-wide"
                >
                  QUOTES
                </Link>
              </li>
              <li>
                <a
                  href="#all-posts"
                  className="text-lg font-bold hover:text-destructive transition-colors uppercase tracking-wide"
                >
                  ALL POSTS
                </a>
              </li>
            </ul>
          </div>

          {/* Dynamic Categories */}
          <div>
            <h3 className="text-2xl font-black mb-6 uppercase tracking-tight">TOP TOPICS</h3>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-muted animate-pulse h-6 brutalist-border"></div>
                ))}
              </div>
            ) : (
              <ul className="space-y-3">
                {categories.map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={`/category/${category.slug}`}
                      className="text-lg font-bold hover:text-accent transition-colors uppercase tracking-wide flex justify-between items-center group"
                    >
                      <span className="group-hover:text-accent">{category.name}</span>
                      <span className="text-xs font-bold text-muted-foreground bg-background px-2 py-1 brutalist-border">
                        {category.count}
                      </span>
                    </Link>
                  </li>
                ))}
                {categories.length > 0 && (
                  <li className="pt-2">
                    <Link
                      href="/#all-posts"
                      className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-wide"
                    >
                      VIEW ALL CATEGORIES →
                    </Link>
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t-4 border-background mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-lg font-bold uppercase tracking-wide mb-4 md:mb-0">
            © 2025 SHAREVAULT. ALL RIGHTS RESERVED.
          </p>
          <div className="flex space-x-6">
            <Link
              href="/privacy"
              className="text-lg font-bold hover:text-accent transition-colors uppercase tracking-wide"
            >
              PRIVACY
            </Link>
            <Link
              href="/terms"
              className="text-lg font-bold hover:text-secondary transition-colors uppercase tracking-wide"
            >
              TERMS
            </Link>
            <Link
              href="/disclaimer"
              className="text-lg font-bold hover:text-primary transition-colors uppercase tracking-wide"
            >
              DISCLAIMER
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}