import { collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import { BlogPost, MediaFile } from '@/types/blog'
import { errorHandler } from '@/lib/error-handler'

export class BlogService {
  static async createPost(post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'posts'), {
      ...post,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    return docRef.id
  }

  static async getPosts(limitCount?: number): Promise<BlogPost[]> {
    let q;
    if (limitCount) {
      q = query(
        collection(db, 'posts'),
        where('published', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
    } else {
      q = query(
        collection(db, 'posts'),
        where('published', '==', true),
        orderBy('createdAt', 'desc')
      )
    }
    const querySnapshot = await getDocs(q)
    console.log(`✅ [BlogService.getPosts] Retrieved ${querySnapshot.docs.length} posts from Firebase`, {
      limitCount,
      hasLimit: !!limitCount,
      totalDocs: querySnapshot.docs.length
    })
    return querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
      } as BlogPost
    })
  }

  static async getAllPosts(limitCount?: number): Promise<BlogPost[]> {
    try {
      let q;
      if (limitCount) {
        q = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        )
      } else {
        q = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc')
        )
      }
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
        } as BlogPost
      })
    } catch (error) {
      errorHandler.error('Error in getAllPosts', error as Error, {
        component: 'BlogService',
        action: 'getAllPosts',
        metadata: { limitCount }
      })
      throw error
    }
  }

  static async getFeaturedPosts(limitCount = 3): Promise<BlogPost[]> {
    const q = query(
      collection(db, 'posts'),
      where('featured', '==', true),
      where('published', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
      } as BlogPost
    })
  }

  static async getPostById(id: string): Promise<BlogPost | null> {
    const docRef = doc(db, 'posts', id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
      } as BlogPost
    }
    return null
  }

  static async getPostBySlug(slug: string): Promise<BlogPost | null> {
    const q = query(
      collection(db, 'posts'),
      where('slug', '==', slug),
      where('published', '==', true),
      limit(1)
    )
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
      } as BlogPost
    }
    return null
  }

  static async updatePost(id: string, updates: Partial<BlogPost>): Promise<void> {
    const docRef = doc(db, 'posts', id)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    })
  }

  static async deletePost(id: string): Promise<void> {
    const docRef = doc(db, 'posts', id)
    await deleteDoc(docRef)
  }

  static async uploadMedia(file: File, userId: string): Promise<MediaFile> {
    const storageRef = ref(storage, `sharevault/${userId}/${Date.now()}_${file.name}`)
    const snapshot = await uploadBytes(storageRef, file)
    const url = await getDownloadURL(snapshot.ref)
    
    return {
      id: snapshot.metadata.fullPath,
      name: file.name,
      url: url,
      type: file.type,
      size: file.size,
      path: snapshot.metadata.fullPath,
      uploadedBy: userId,
      uploadedAt: new Date()
    }
  }

  static async deleteMedia(path: string): Promise<void> {
    const storageRef = ref(storage, path)
    await deleteObject(storageRef)
  }

  static async getPostsByCategory(category: string, limitCount?: number): Promise<BlogPost[]> {
    const q = query(
      collection(db, 'posts'),
      where('published', '==', true),
      orderBy('createdAt', 'desc'),
    )
    const querySnapshot = await getDocs(q)
    const allPosts = querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
      } as BlogPost
    })

    const filteredPosts = allPosts.filter(post => 
      post.category.toLowerCase() === category.toLowerCase()
    );

    return limitCount ? filteredPosts.slice(0, limitCount) : filteredPosts;
  }

  // Get all unique categories from published posts
  static async getCategories(): Promise<string[]> {
    const q = query(
      collection(db, 'posts'),
      where('published', '==', true)
    )
    const querySnapshot = await getDocs(q)
    const categories = new Set<string>()
    
    querySnapshot.docs.forEach(doc => {
      const data = doc.data()
      if (data.category) {
        categories.add(data.category)
      }
    })
    
    return Array.from(categories).sort()
  }

  // Get draft posts (for admin)
  static async getDraftPosts(limitCount?: number): Promise<BlogPost[]> {
    let q;
    if (limitCount) {
      q = query(
        collection(db, 'posts'),
        where('published', '==', false),
        orderBy('updatedAt', 'desc'),
        limit(limitCount)
      )
    } else {
      q = query(
        collection(db, 'posts'),
        where('published', '==', false),
        orderBy('updatedAt', 'desc')
      )
    }
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
      } as BlogPost
    })
  }

  // Publish a draft post
  static async publishPost(id: string): Promise<void> {
    const docRef = doc(db, 'posts', id)
    await updateDoc(docRef, {
      published: true,
      updatedAt: new Date()
    })
  }

  // Unpublish a post (make it draft)
  static async unpublishPost(id: string): Promise<void> {
    const docRef = doc(db, 'posts', id)
    await updateDoc(docRef, {
      published: false,
      updatedAt: new Date()
    })
  }

  // Check if slug already exists
  static async isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, 'posts'),
        where('slug', '==', slug),
        limit(1)
      )
      const querySnapshot = await getDocs(q)

      // If no documents found, slug is unique
      if (querySnapshot.empty) return true

      // If we're editing a post, exclude it from the check
      if (excludeId) {
        const existingDoc = querySnapshot.docs[0]
        return existingDoc.id === excludeId
      }

      // Slug already exists
      return false
    } catch (error) {
      errorHandler.error('Error checking slug uniqueness', error as Error, {
        component: 'BlogService',
        action: 'isSlugUnique',
        metadata: { slug, excludeId }
      })
      // If there's an error, allow the slug (fail safe)
      return true
    }
  }

  // Bulk delete posts
  static async bulkDeletePosts(postIds: string[]): Promise<void> {
    try {
      const deletePromises = postIds.map(id => {
        const docRef = doc(db, 'posts', id)
        return deleteDoc(docRef)
      })

      await Promise.all(deletePromises)
    } catch (error) {
      errorHandler.error('Error bulk deleting posts', error as Error, {
        component: 'BlogService',
        action: 'bulkDeletePosts',
        metadata: { postIds, count: postIds.length }
      })
      throw error
    }
  }
}