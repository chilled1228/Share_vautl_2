"use client"

import { useState } from "react"
import { Twitter, Facebook, Linkedin, Link, Check, MessageCircle } from "lucide-react"

interface ShareButtonsProps {
  title: string
  url?: string
  className?: string
}

export default function ShareButtons({ title, url, className }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mindshift-blog.vercel.app"
  const shareUrl = url ? `${baseUrl}${url}` : typeof window !== "undefined" ? window.location.href : baseUrl
  const shareText = `${title} - Raw motivation and brutal honesty for personal growth`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy link:", err)
    }
  }

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(
      shareUrl,
    )}&hashtags=motivation,mindset,personalgrowth`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
  }

  return (
    <div className={className}>
      <h3 className="text-2xl md:text-3xl font-black mb-6 uppercase tracking-tight">SHARE THE MOTIVATION</h3>
      <div className="flex flex-wrap gap-4">
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-6 py-3 brutalist-border brutalist-shadow-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 font-bold uppercase tracking-wide touch-target"
          aria-label="Share on Twitter"
        >
          <Twitter size={20} />
          TWITTER
        </a>

        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-secondary text-secondary-foreground px-6 py-3 brutalist-border brutalist-shadow-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 font-bold uppercase tracking-wide touch-target"
          aria-label="Share on Facebook"
        >
          <Facebook size={20} />
          FACEBOOK
        </a>

        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-accent text-accent-foreground px-6 py-3 brutalist-border brutalist-shadow-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 font-bold uppercase tracking-wide touch-target"
          aria-label="Share on LinkedIn"
        >
          <Linkedin size={20} />
          LINKEDIN
        </a>

        <a
          href={shareLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-destructive text-destructive-foreground px-6 py-3 brutalist-border brutalist-shadow-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 font-bold uppercase tracking-wide touch-target"
          aria-label="Share on WhatsApp"
        >
          <MessageCircle size={20} />
          WHATSAPP
        </a>

        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-3 bg-muted text-muted-foreground px-6 py-3 brutalist-border brutalist-shadow-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 font-bold uppercase tracking-wide touch-target"
          aria-label="Copy link to clipboard"
        >
          {copied ? <Check size={20} /> : <Link size={20} />}
          {copied ? "COPIED!" : "COPY LINK"}
        </button>
      </div>

      <div className="mt-8 p-6 bg-muted brutalist-border">
        <p className="text-lg font-bold leading-relaxed text-balance">
          HELP OTHERS DISCOVER THE BRUTAL TRUTH THEY NEED TO HEAR. SHARE THIS POST AND SPREAD THE MINDSHIFT MOVEMENT.
        </p>
      </div>
    </div>
  )
}
