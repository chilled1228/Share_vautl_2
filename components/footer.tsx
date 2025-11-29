import Link from "next/link"
import { Twitter, Instagram, Facebook, Mail } from "lucide-react"

export default function Footer() {
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
                  href="/contact"
                  className="text-lg font-bold hover:text-destructive transition-colors uppercase tracking-wide"
                >
                  CONTACT
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-2xl font-black mb-6 uppercase tracking-tight">TOPICS</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/#all-posts"
                  className="text-lg font-bold hover:text-accent transition-colors uppercase tracking-wide"
                >
                  ALL POSTS
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
                <Link
                  href="/about"
                  className="text-lg font-bold hover:text-primary transition-colors uppercase tracking-wide"
                >
                  ABOUT
                </Link>
              </li>
              <li>
              </li>
            </ul>
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
            <Link
              href="/dmca"
              className="text-lg font-bold hover:text-destructive transition-colors uppercase tracking-wide"
            >
              DMCA
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
