
import { NextResponse } from 'next/server'
import { BlogService } from '@/lib/blog-service'
import { revalidateAfterPostChange } from '@/lib/blog-actions'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Vercel Cron secret validation
function isValidCronRequest(request: Request) {
    const cronSecret = process.env.CRON_SECRET
    if (!cronSecret) {
        console.error('[Auto-Publish] CRON_SECRET not configured')
        return false
    }

    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${cronSecret}`) {
        console.error('[Auto-Publish] Unauthorized request')
        return false
    }
    return true
}

// Force dynamic since this is a cron job and shouldn't be statically optimized/executed during build
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        // Validate request
        if (!isValidCronRequest(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 1. Get oldest draft post using Admin Client to bypass RLS
        const postToPublish = await BlogService.getOldestDraftPost(supabaseAdmin)

        if (!postToPublish) {
            console.log('[Auto-Publish] No draft posts available')
            return NextResponse.json({
                success: true,
                message: 'No draft posts to publish'
            })
        }

        // 2. Publish the post using Admin Client
        console.log(`Publishing post: ${postToPublish.title} (${postToPublish.id})`)

        await BlogService.publishPost(postToPublish.id, supabaseAdmin)

        // 3. Revalidate cache
        const slug = postToPublish.slug || ''
        const category = postToPublish.category || 'Uncategorized'
        await revalidateAfterPostChange(slug, category)

        return NextResponse.json({
            success: true,
            publishedPost: postToPublish.title,
            id: postToPublish.id
        })

    } catch (error) {
        console.error('Auto-publish cron error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
