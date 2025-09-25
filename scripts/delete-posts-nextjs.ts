// Next.js script to delete specific posts from Firebase
import { BlogService } from '../lib/blog-service'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'

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

export async function deleteSpecificPosts() {
  try {
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
        return cleanTitle.includes(cleanDeleteTitle) ||
               cleanTitle.includes(deleteTitle.toLowerCase().replace(/\s+/g, ' '));
      });

      if (shouldDelete) {
        foundPosts.push({ id: doc.id, title });
        postsToDeleteIds.push(doc.id);
        console.log(`🗑️  Found post to delete: "${title}" (ID: ${doc.id})`);
      }
    }

    if (postsToDeleteIds.length === 0) {
      console.log('ℹ️  No matching posts found to delete.');
      return { deleted: 0, posts: [] };
    }

    console.log(`\n⚠️  About to delete ${postsToDeleteIds.length} posts:`);
    foundPosts.forEach(post => console.log(`   - ${post.title}`));

    // Use the existing bulk delete method
    await BlogService.bulkDeletePosts(postsToDeleteIds);

    console.log(`\n✅ Successfully deleted ${postsToDeleteIds.length} posts!`);

    return {
      deleted: postsToDeleteIds.length,
      posts: foundPosts
    };

  } catch (error) {
    console.error('❌ Error deleting posts:', error);
    throw error;
  }
}

// If running directly
if (require.main === module) {
  deleteSpecificPosts()
    .then(result => {
      console.log(`\n🎉 Deletion complete! Removed ${result.deleted} posts.`);
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Deletion failed:', error);
      process.exit(1);
    });
}