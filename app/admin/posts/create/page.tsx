'use client'

import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import AdminLayout from '@/components/admin/admin-layout'
import PostForm from '@/components/admin/post-form'
import { useEffect, useState } from 'react'

interface User {
  uid: string
  email: string
  displayName?: string
  isAdmin: boolean
}

export default function CreatePostPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Check if user is admin
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))

          if (!userDoc.exists() || !userDoc.data().isAdmin) {
            await auth.signOut()
            localStorage.removeItem('adminUser')
            router.push('/admin/login')
            return
          }

          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            isAdmin: true
          }

          setUser(userData)
          localStorage.setItem('adminUser', JSON.stringify(userData))
        } catch (error) {
          console.error('Auth check error:', error)
          await auth.signOut()
          localStorage.removeItem('adminUser')
          router.push('/admin/login')
        }
      } else {
        localStorage.removeItem('adminUser')
        router.push('/admin/login')
      }
    })

    return () => unsubscribe()
  }, [router])

  if (!user) {
    return null
  }

  return (
    <AdminLayout user={user}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Create New Post</h1>
        <PostForm />
      </div>
    </AdminLayout>
  )
}