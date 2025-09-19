import { BlogPost } from '@/types/blog'

// Mock data for development
const mockPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'future-web-development-trends-2025',
    title: "The Future of Web Development: Trends to Watch in 2025",
    content: `Web development is evolving at an unprecedented pace. In 2025, we're seeing several key trends that are reshaping how we build applications:

1. **AI-Powered Development**: Tools like GitHub Copilot are becoming essential for developers, providing intelligent code suggestions and automating repetitive tasks.

2. **WebAssembly (WASM) Adoption**: More applications are leveraging WASM for near-native performance in the browser, especially for complex computations and gaming.

3. **Serverless Architecture**: The shift towards serverless continues, with platforms like Vercel, Netlify, and Firebase Functions making it easier to build scalable applications without managing servers.`,
    excerpt: "Dive deep into the latest web development trends shaping 2025, from AI-powered coding to WebAssembly and serverless architecture.",
    authorId: "demo-user-1",
    authorName: "Sarah Johnson",
    category: "Web Development",
    tags: ["trends", "AI", "WASM", "serverless"],
    featured: true,
    published: true,
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop&crop=entropy",
    readTime: 8,
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15')
  },
  {
    id: '2',
    slug: 'mastering-react-server-components-guide',
    title: "Mastering React Server Components: A Complete Guide",
    content: `React Server Components (RSC) represent a paradigm shift in how we build React applications. Let's explore the key concepts:

## What are Server Components?

Server Components are a new type of component that runs exclusively on the server. They offer several benefits:

- **Zero Bundle Size**: Server components aren't included in the client-side JavaScript bundle
- **Direct Database Access**: They can directly access databases and file systems
- **Better SEO**: Content is rendered on the server, improving search engine optimization
- **Improved Performance**: Reduced client-side JavaScript leads to faster load times`,
    excerpt: "Learn everything about React Server Components, from basic concepts to advanced patterns and best practices for modern web development.",
    authorId: "demo-user-2", 
    authorName: "Alex Chen",
    category: "React",
    tags: ["React", "Server Components", "JavaScript", "Performance"],
    featured: true,
    published: true,
    imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop&crop=entropy",
    readTime: 12,
    createdAt: new Date('2025-01-14'),
    updatedAt: new Date('2025-01-14')
  },
  {
    id: '3',
    slug: 'building-accessible-web-applications-guidelines',
    title: "Building Accessible Web Applications: Essential Guidelines",
    content: `Web accessibility isn't just a requirement—it's a fundamental aspect of creating inclusive digital experiences. Here's how to build truly accessible applications:

## Semantic HTML

Always use appropriate HTML elements for their intended purpose:

\`\`\`html
<!-- Good -->
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/home">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>
\`\`\`

## Keyboard Navigation

Ensure all interactive elements are keyboard accessible:
- Tab order should be logical
- Focus indicators should be visible
- Provide keyboard shortcuts where helpful`,
    excerpt: "Discover essential web accessibility guidelines and practical techniques to create inclusive digital experiences for all users.",
    authorId: "demo-user-3",
    authorName: "Emily White", 
    category: "Accessibility",
    tags: ["accessibility", "a11y", "WCAG", "inclusive design"],
    featured: true,
    published: true,
    imageUrl: "https://images.unsplash.com/photo-1559028006-448665bd7c7f?w=800&h=600&fit=crop&crop=entropy",
    readTime: 10,
    createdAt: new Date('2025-01-13'),
    updatedAt: new Date('2025-01-13')
  },
  {
    id: '4',
    slug: 'css-grid-vs-flexbox-layout-systems',
    title: "CSS Grid vs Flexbox: When to Use Which Layout System",
    content: `Understanding when to use CSS Grid versus Flexbox is crucial for modern web layouts. Let's break down the differences:

## CSS Grid: Two-Dimensional Layouts

Use Grid when you need to control both rows and columns:

\`\`\`css
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto;
  gap: 1rem;
}
\`\`\`

**Best for:**
- Page layouts
- Complex grid systems
- Overlapping elements
- Precise placement of items

## Flexbox: One-Dimensional Layouts

Use Flexbox for arranging items in a single direction:

\`\`\`css
.flex-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
\`\`\`

**Best for:**
- Navigation bars
- Form layouts
- Centering items
- Responsive components`,
    excerpt: "A comprehensive guide comparing CSS Grid and Flexbox, helping you choose the right layout system for your web design projects.",
    authorId: "demo-user-1",
    authorName: "Sarah Johnson",
    category: "CSS",
    tags: ["CSS", "Grid", "Flexbox", "layout", "design"],
    featured: false,
    published: true,
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=entropy",
    readTime: 7,
    createdAt: new Date('2025-01-12'),
    updatedAt: new Date('2025-01-12')
  },
  {
    id: '5',
    slug: 'typescript-best-practices-large-applications',
    title: "TypeScript Best Practices for Large Applications",
    content: `TypeScript transforms JavaScript development, but using it effectively requires understanding best practices:

## Type Safety First

Always prefer specific types over generic ones:

\`\`\`typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}
\`\`\`

## Advanced Type Patterns

### Utility Types
\`\`\`typescript
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
}

type ProductPreview = Pick<Product, 'id' | 'name' | 'price'>;
type ProductUpdate = Partial<Product>;
\`\`\`

### Generic Types
\`\`\`typescript
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}
\`\`\`

## Error Handling

Create typed error handling:

\`\`\`typescript
class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
\`\`\``,
    excerpt: "Learn advanced TypeScript patterns and best practices for building large-scale, maintainable applications with confidence.",
    authorId: "demo-user-4",
    authorName: "David Kim",
    category: "TypeScript",
    tags: ["TypeScript", "best practices", "large applications", "patterns"],
    featured: false,
    published: true,
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop&crop=entropy",
    readTime: 15,
    createdAt: new Date('2025-01-11'),
    updatedAt: new Date('2025-01-11')
  },
  {
    id: '6',
    slug: 'performance-optimization-modern-web-techniques',
    title: "Performance Optimization: Modern Web Techniques",
    content: `Web performance directly impacts user experience and SEO. Here are essential optimization techniques:

## Loading Performance

### Lazy Loading
\`\`\`javascript
// React.lazy for component lazy loading
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// Image lazy loading
<img src="image.jpg" loading="lazy" alt="Description" />
\`\`\`

### Code Splitting
\`\`\`javascript
// Dynamic imports
function loadModule() {
  return import('./heavy-module.js');
}
\`\`\`

## Resource Optimization

### Image Optimization
- Use next-gen formats (WebP, AVIF)
- Implement responsive images
- Compress images without quality loss

### Caching Strategies
Implement service worker caching for offline functionality and faster load times.

## Runtime Performance

### Debouncing and Throttling
Prevent performance issues with frequent events like search input and scroll events.

### Virtual Scrolling
For large lists, implement virtual scrolling to only render visible items.

## Monitoring and Analytics

Track performance metrics:
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms  
- **CLS (Cumulative Layout Shift)**: < 0.1
- **FCP (First Contentful Paint)**: < 1.8s

Use tools like Lighthouse, Web Vitals, and Chrome DevTools for performance analysis.`,
    excerpt: "Essential performance optimization techniques for modern web applications, from lazy loading to runtime optimizations and monitoring.",
    authorId: "demo-user-2",
    authorName: "Alex Chen",
    category: "Performance",
    tags: ["performance", "optimization", "web vitals", "UX"],
    featured: false,
    published: true,
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&crop=entropy",
    readTime: 11,
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-10')
  }
]

export class MockBlogService {
  static async getPosts(limitCount = 10): Promise<BlogPost[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockPosts.slice(0, limitCount)
  }

  static async getFeaturedPosts(): Promise<BlogPost[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockPosts.filter(post => post.featured)
  }

  static async getPostById(id: string): Promise<BlogPost | null> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return mockPosts.find(post => post.id === id) || null
  }

  static async getPostsByCategory(category: string): Promise<BlogPost[]> {
    await new Promise(resolve => setTimeout(resolve, 400))
    return mockPosts.filter(post => post.category === category)
  }

  static async createPost(post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 800))
    const newId = (mockPosts.length + 1).toString()
    const newPost: BlogPost = {
      ...post,
      id: newId,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    mockPosts.push(newPost)
    return newId
  }

  static async updatePost(id: string, updates: Partial<BlogPost>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 600))
    const postIndex = mockPosts.findIndex(post => post.id === id)
    if (postIndex !== -1) {
      mockPosts[postIndex] = {
        ...mockPosts[postIndex],
        ...updates,
        updatedAt: new Date()
      }
    }
  }

  static async deletePost(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400))
    const postIndex = mockPosts.findIndex(post => post.id === id)
    if (postIndex !== -1) {
      mockPosts.splice(postIndex, 1)
    }
  }
}