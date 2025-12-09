import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import * as dotenv from 'dotenv'
import * as fs from 'fs'

dotenv.config({ path: '.env.local' })

// --- Configuration ---
const FIREBASE_SERVICE_ACCOUNT = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}

if (!FIREBASE_SERVICE_ACCOUNT.projectId || !FIREBASE_SERVICE_ACCOUNT.clientEmail || !FIREBASE_SERVICE_ACCOUNT.privateKey) {
    console.error('❌ Missing Firebase credentials. Please check .env.local')
    process.exit(1)
}

// --- Initialize Clients ---
if (getApps().length === 0) {
    initializeApp({
        credential: cert(FIREBASE_SERVICE_ACCOUNT)
    })
}

const db = getFirestore()
const auth = getAuth()

async function exportData() {
    console.log('\n--- Exporting Data from Firebase ---')
    const exportData: { users: any[], posts: any[] } = {
        users: [],
        posts: []
    }

    try {
        // 1. Users
        const listUsersResult = await auth.listUsers(1000)
        const firebaseUsers = listUsersResult.users
        console.log(`Found ${firebaseUsers.length} users in Firebase`)

        exportData.users = firebaseUsers.map(user => ({
            firebase_uid: user.uid,
            email: user.email || '',
            display_name: user.displayName,
            photo_url: user.photoURL,
            is_admin: user.customClaims?.admin === true,
            created_at: user.metadata.creationTime,
            updated_at: user.metadata.lastSignInTime // Approximation
        }))

        // 2. Posts
        const snapshot = await db.collection('posts').get()
        const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        console.log(`Found ${posts.length} posts in Firebase`)

        const toDate = (ts: any) => ts && ts.toDate ? ts.toDate().toISOString() : (ts ? new Date(ts).toISOString() : null)

        exportData.posts = posts.map(post => {
            const p = post as any
            return {
                id: p.id,
                title: p.title,
                content: p.content,
                excerpt: p.excerpt,
                slug: p.slug,
                category: p.category,
                tags: p.tags || [],
                featured: p.featured || false,
                published: p.published || false,
                image_url: p.imageUrl,
                featured_image: p.featuredImage,
                author_id_firebase: p.authorId, // We will resolve this to UUID during import
                author_name: p.author,
                read_time: p.readTime,
                created_at: toDate(p.createdAt),
                updated_at: toDate(p.updatedAt),
                published_at: toDate(p.publishedAt)
            }
        })

        fs.writeFileSync('firebase_dump.json', JSON.stringify(exportData, null, 2))
        console.log(`\n✅ Data exported to firebase_dump.json (${exportData.users.length} users, ${exportData.posts.length} posts)`)

    } catch (error) {
        console.error('Error exporting data:', error)
    }
}

exportData()
