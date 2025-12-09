
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/admin-layout'
import BulkPostUpload from '@/components/admin/bulk-post-upload'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function BulkUploadPage() {
    const { user, isLoading: authLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!authLoading && (!user || !user.isAdmin)) {
            router.push('/admin/login')
        }
    }, [user, authLoading, router])

    if (authLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!user || !user.isAdmin) {
        return null
    }

    return (
        <AdminLayout user={user}>
            <BulkPostUpload user={user} />
        </AdminLayout>
    )
}
