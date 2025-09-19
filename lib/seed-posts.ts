import { doc, setDoc, collection, addDoc } from 'firebase/firestore'
import { db } from './firebase'

// Add sample blog posts for testing
export async function seedSamplePosts() {
  const samplePosts = [
    {
      title: "Welcome to ShareVault",
      slug: "welcome-to-sharevault",
      content: `
# Welcome to ShareVault

This is your first blog post on ShareVault! 

ShareVault is a modern blogging platform built with Next.js, Firebase, and TypeScript. It provides a seamless experience for content creators and readers alike.

## Features

- **Modern UI**: Clean, responsive design
- **Real-time Updates**: Powered by Firebase
- **Admin Panel**: Easy content management
- **SEO Optimized**: Built for search engines

Get started by creating your first post and sharing your thoughts with the world!
      `,
      excerpt: "Welcome to ShareVault - your modern blogging platform",
      authorName: "Admin User",
      category: "Announcements",
      published: true,
      featured: true,
      imageUrl: "",
      tags: ["welcome", "sharevault", "announcement"],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "Getting Started with Blogging",
      slug: "getting-started-with-blogging",
      content: `
# Getting Started with Blogging

Blogging is a powerful way to share your knowledge, connect with others, and build your personal brand.

## Why Blog?

- Share your expertise
- Build authority in your field
- Connect with like-minded people
- Document your journey
- Create opportunities

## Best Practices

1. **Write regularly**: Consistency is key
2. **Provide value**: Help your readers
3. **Be authentic**: Share your unique perspective
4. **Engage with readers**: Build a community

Start your blogging journey today!
      `,
      excerpt: "Learn the basics of blogging and why you should start today",
      authorName: "Admin User",
      category: "Tips",
      published: true,
      featured: false,
      imageUrl: "",
      tags: ["blogging", "tips", "getting-started"],
      createdAt: new Date(Date.now() - 86400000), // 1 day ago
      updatedAt: new Date(Date.now() - 86400000)
    },
    {
      title: "The Future of Web Development",
      slug: "future-of-web-development",
      content: `
# The Future of Web Development

The web development landscape is constantly evolving. Let's explore what's coming next.

## Emerging Technologies

- **AI Integration**: AI-powered development tools
- **WebAssembly**: Near-native performance in the browser
- **Edge Computing**: Bringing computation closer to users
- **Progressive Web Apps**: Blurring the line between web and native

## What This Means for Developers

Stay curious, keep learning, and embrace change. The future is bright for those who adapt!
      `,
      excerpt: "Exploring upcoming trends and technologies in web development",
      authorName: "Admin User",
      category: "Technology",
      published: true,
      featured: true,
      imageUrl: "",
      tags: ["web-development", "technology", "future"],
      createdAt: new Date(Date.now() - 172800000), // 2 days ago
      updatedAt: new Date(Date.now() - 172800000)
    }
  ]

  try {
    const postsCollection = collection(db, 'posts')
    
    for (const post of samplePosts) {
      await addDoc(postsCollection, post)
    }
    
    console.log('Sample posts seeded successfully')
  } catch (error) {
    console.error('Error seeding sample posts:', error)
  }
}

// For testing - you can temporarily add this to a page to run once
// seedSamplePosts()