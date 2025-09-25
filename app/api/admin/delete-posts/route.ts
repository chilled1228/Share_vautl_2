import { NextRequest, NextResponse } from 'next/server'
import { collection, getDocs, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { BlogService } from '@/lib/blog-service'

// Posts to delete (based on your list)
const postsToDelete = [
  "Taylor Swift Song Lyrics Quotes",
  "Therapy Quotes",
  "Tired Quotes",
  "Titanic Quotes",
  "Tolkien Quotes",
  "Tuesday Quotes Positive",
  "Vision Board Quotes",
  "Walt Whitman America Quotes",
  "Water Quotes",
  "Wayne Dyer Quotes",
  "Ways To Introduce A Quote",
  "Quotes On Suicide",
  "Quotes On Twilight",
  "Quotes Red Colour",
  "Quotes Regarding Silence",
  "Rap-Quotes.Com",
  "Rip Quotes",
  "Roses And Quotes",
  "Run On Quotes",
  "Saint Quotes",
  "Sapiens Quotes With Page Numbers",
  "Self Love In The Bible Quotes",
  "Song Of Achilles Quotes",
  "Spinal Cord Tattoo Quotes"
];

export async function POST(request: NextRequest) {
  try {
    const { preview = false } = await request.json();

    console.log('🔍 Searching for posts to delete...');

    // Get all posts
    const allPostsQuery = query(collection(db, 'posts'));
    const allPostsSnapshot = await getDocs(allPostsQuery);

    console.log(`📊 Total posts in database: ${allPostsSnapshot.docs.length}`);

    const postsToDeleteIds: string[] = [];
    const foundPosts: { id: string; title: string }[] = [];

    // Find posts that match our deletion list
    for (const doc of allPostsSnapshot.docs) {
      const data = doc.data();
      const title = data.title || '';

      // Check if this post's title contains any of our target phrases
      const shouldDelete = postsToDelete.some(deleteTitle => {
        const cleanTitle = title.toLowerCase();
        const cleanDeleteTitle = deleteTitle.toLowerCase();
        return cleanTitle.includes(cleanDeleteTitle);
      });

      if (shouldDelete) {
        foundPosts.push({ id: doc.id, title });
        postsToDeleteIds.push(doc.id);
        console.log(`🗑️  Found post to delete: "${title}" (ID: ${doc.id})`);
      }
    }

    if (postsToDeleteIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No matching posts found to delete.',
        deleted: 0,
        posts: []
      });
    }

    console.log(`\n⚠️  Found ${postsToDeleteIds.length} posts to delete:`);
    foundPosts.forEach(post => console.log(`   - ${post.title}`));

    if (preview) {
      return NextResponse.json({
        success: true,
        message: `Preview: Found ${postsToDeleteIds.length} posts that would be deleted`,
        deleted: 0,
        posts: foundPosts,
        preview: true
      });
    }

    // Actually delete the posts using bulk delete
    await BlogService.bulkDeletePosts(postsToDeleteIds);

    console.log(`\n✅ Successfully deleted ${postsToDeleteIds.length} posts!`);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${postsToDeleteIds.length} posts`,
      deleted: postsToDeleteIds.length,
      posts: foundPosts
    });

  } catch (error) {
    console.error('❌ Error deleting posts:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete posts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}