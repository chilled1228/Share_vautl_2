'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import AdminLayout from '@/components/admin/admin-layout'
import BulkPostUpload from '@/components/admin/bulk-post-upload'
import { Loader2 } from 'lucide-react'

export default function BulkUploadPage() {
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const router = useRouter()

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
            setLoading(false)
        })

        return () => unsubscribe()
    }, [router])

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <AdminLayout user={user}>
            <BulkPostUpload user={user} />
        </AdminLayout>
    )
}
