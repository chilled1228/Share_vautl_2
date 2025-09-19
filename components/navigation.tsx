"use client"

import Link from "next/link"
import MobileMenu from "./mobile-menu"

export default function Navigation() {
  return (
    <nav className="brutalist-border-thick bg-card sticky top-0 z-50 brutalist-shadow">
      <div className="container-mobile">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="bg-primary text-primary-foreground px-3 py-2 sm:px-6 sm:py-3 brutalist-border brutalist-shadow-sm">
              <span className="text-lg sm:text-2xl font-black tracking-tighter">MINDSHIFT</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              href="/"
              className="bg-accent text-accent-foreground px-4 py-2 lg:px-6 lg:py-3 brutalist-border brutalist-shadow-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 font-bold uppercase tracking-wide text-sm lg:text-base touch-target"
            >
              HOME
            </Link>
            <Link
              href="/quotes"
              className="bg-primary text-primary-foreground px-4 py-2 lg:px-6 lg:py-3 brutalist-border brutalist-shadow-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 font-bold uppercase tracking-wide text-sm lg:text-base touch-target"
            >
              QUOTES
            </Link>
            <Link
              href="/about"
              className="bg-muted text-muted-foreground px-4 py-2 lg:px-6 lg:py-3 brutalist-border brutalist-shadow-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 font-bold uppercase tracking-wide text-sm lg:text-base touch-target"
            >
              ABOUT
            </Link>
          </div>

          {/* Mobile Menu */}
          <MobileMenu />
        </div>
      </div>
    </nav>
  )
}
