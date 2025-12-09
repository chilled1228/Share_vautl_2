import { getAdminDb } from '../lib/firebase-admin';
import * as fs from 'fs';
import { resolve } from 'path';

// Manually load env vars from .env.local
const envPath = resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            // Remove quotes if present
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }
            process.env[key] = value;
        }
    });
}

async function verifyCron() {
    console.log('Starting verification...');

    // Ensure we are in a valid state
    if (!process.env.CRON_SECRET) {
        throw new Error('CRON_SECRET not found in environment');
    }

    const db = getAdminDb();
    const collectionRef = db.collection('posts');

    // 1. Setup: Clean up any previous test posts
    console.log('Cleaning up old test posts...');
    const oldTests = await collectionRef
        .where('slug', '>=', 'auto-publish-test-')
        .where('slug', '<', 'auto-publish-test-\uf8ff')
        .get();

    if (!oldTests.empty) {
        const batch = db.batch();
        oldTests.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        console.log(`Cleaned up ${oldTests.size} old test posts.`);
    }

    // 2. Create a draft post
    const testId = Date.now().toString();
    const testSlug = `auto-publish-test-${testId}`;
    const draftPost = {
        title: `Auto-Publish Test Post ${testId}`,
        slug: testSlug,
        published: false,
        createdAt: new Date('2023-01-01T00:00:00Z'), // Old date
        updatedAt: new Date(),
        content: 'Test content for auto-publish verification.',
        excerpt: 'Test excerpt',
        category: 'Testing',
        authorName: 'Test Bot'
    };

    const docRef = await collectionRef.add(draftPost);
    console.log(`Created draft post with ID: ${docRef.id} and Slug: ${testSlug}`);

    try {
        // 3. Trigger the cron endpoint
        const cronSecret = process.env.CRON_SECRET;
        const cronUrl = 'http://localhost:3000/api/cron/auto-publish';

        console.log(`Triggering cron endpoint at ${cronUrl}...`);

        // Use dynamic import for node-fetch if global fetch is not available, 
        // or just assume node 18+ (which is likely for nextjs 13/14)
        const response = await fetch(cronUrl, {
            method: 'GET', // Vercel Cron usually does GET
            headers: {
                'Authorization': `Bearer ${cronSecret}`
            }
        });

        console.log(`Cron response status: ${response.status}`);
        const result = await response.json();
        console.log('Cron response body:', JSON.stringify(result, null, 2));

        if (response.status !== 200) {
            throw new Error(`Cron failed with status ${response.status}`);
        }

        // 4. Verify post status
        // Wait a brief moment to ensure DB consistency (though Firestore is usually fast)
        await new Promise(resolve => setTimeout(resolve, 1000));

        const updatedDoc = await collectionRef.doc(docRef.id).get();
        const data = updatedDoc.data();

        if (data?.published === true) {
            console.log('✅ SUCCESS: Post was published!');
            console.log('Published At:', data.publishedAt ? data.publishedAt.toDate() : 'N/A');
        } else {
            console.error('❌ FAILURE: Post was NOT published.');
            console.log('Current data:', JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error('Error during verification:', error);
    } finally {
        // 5. Cleanup
        try {
            // Double check it exists before deleting
            const check = await collectionRef.doc(docRef.id).get();
            if (check.exists) {
                await collectionRef.doc(docRef.id).delete();
                console.log('Cleaned up test post.');
            }
        } catch (e) {
            console.error('Error during cleanup:', e);
        }
    }
}

verifyCron().catch(console.error);
