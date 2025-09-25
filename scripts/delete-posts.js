// Delete specific posts from Firebase
const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need to set your credentials)
const serviceAccount = require('../path-to-your-service-account-key.json'); // Update this path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Posts to delete (based on your list)
const postsToDelete = [
  "37+ Taylor Swift Song Lyrics Quotes",
  "50+ Therapy Quotes",
  "40+ Tired Quotes",
  "39+ Titanic Quotes",
  "43+ Tolkien Quotes",
  "35+ Tuesday Quotes Positive",
  "39+ Vision Board Quotes",
  "39+ Walt Whitman America Quotes",
  "48+ Water Quotes",
  "43+ Wayne Dyer Quotes",
  "43+ Ways To Introduce A Quote",
  "39+ Quotes On Suicide",
  "42+ Quotes On Twilight",
  "41+ Quotes Red Colour",
  "37+ Quotes Regarding Silence",
  "41+ Rap-Quotes.Com",
  "46+ Rip Quotes",
  "40+ Roses And Quotes",
  "49+ Run On Quotes",
  "49+ Saint Quotes",
  "37+ Sapiens Quotes With Page Numbers",
  "35+ Self Love In The Bible Quotes",
  "50+ Song Of Achilles Quotes",
  "40+ Spinal Cord Tattoo Quotes"
];

async function deletePostsByTitle() {
  try {
    console.log('🔍 Searching for posts to delete...');

    const batch = db.batch();
    let deleteCount = 0;
    const foundPosts = [];

    // Get all posts
    const allPostsSnapshot = await db.collection('posts').get();
    console.log(`📊 Total posts in database: ${allPostsSnapshot.docs.length}`);

    // Find posts that match our deletion list
    for (const doc of allPostsSnapshot.docs) {
      const data = doc.data();
      const title = data.title;

      // Check if this post's title matches any in our delete list
      const shouldDelete = postsToDelete.some(deleteTitle =>
        title && title.toLowerCase().includes(deleteTitle.toLowerCase().substring(3)) // Remove "XX+ " prefix
      );

      if (shouldDelete) {
        foundPosts.push({ id: doc.id, title });
        batch.delete(doc.ref);
        deleteCount++;
        console.log(`🗑️  Found post to delete: "${title}" (ID: ${doc.id})`);
      }
    }

    if (deleteCount === 0) {
      console.log('ℹ️  No matching posts found to delete.');
      return;
    }

    console.log(`\n⚠️  About to delete ${deleteCount} posts:`);
    foundPosts.forEach(post => console.log(`   - ${post.title}`));

    // Uncomment the next line to actually perform the deletion
    // await batch.commit();

    console.log(`\n✅ Deleted ${deleteCount} posts successfully!`);
    console.log('🔄 Note: Uncomment batch.commit() line to actually delete the posts.');

  } catch (error) {
    console.error('❌ Error deleting posts:', error);
  } finally {
    process.exit();
  }
}

// Run the deletion script
deletePostsByTitle();