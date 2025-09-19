// Simple script to add sample data via Firebase Admin SDK
const admin = require('firebase-admin');

// Initialize with default credentials (will use the CLI authentication)
admin.initializeApp({
  projectId: 'shair-vault'
});

const db = admin.firestore();

const samplePost = {
  id: "funny-quotes-collection",
  title: "50 Funny Quotes That Will Instantly Make You Smile",
  slug: "50-funny-quotes-that-will-instantly-make-you-smile",
  excerpt: "Need a good laugh? These hilarious quotes from comedians, writers, and celebrities will brighten your day instantly.",
  content: `# 50 Funny Quotes That Will Instantly Make You Smile

Life is too important to be taken seriously all the time. Sometimes we all need a good laugh to brighten our day and put things in perspective.

## Classic Comedy Gold

1. "I haven't spoken to my wife in years. I didn't want to interrupt her." - Rodney Dangerfield

2. "The trouble with having an open mind, of course, is that people will insist on coming along and trying to put things in it." - Terry Pratchett

3. "I'm not superstitious, but I am a little stitious." - Michael Scott

4. "Behind every great man is a woman rolling her eyes." - Jim Carrey

5. "Common sense is like deodorant. The people who need it most never use it." - Bill Murray

These quotes remind us that laughter truly is the best medicine!`,
  author: "The Quote Team",
  publishedAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-15")),
  updatedAt: admin.firestore.Timestamp.fromDate(new Date("2024-01-15")),
  category: "Humor",
  tags: ["funny", "quotes", "humor", "comedy", "inspiration"],
  featured: true,
  status: "published",
  readTime: 8,
  likes: 245,
  views: 1500,
  featuredImage: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800"
};

async function addSampleData() {
  try {
    console.log('Adding sample blog data...');
    
    // Add the sample post
    await db.collection('posts').doc(samplePost.id).set(samplePost);
    console.log('✅ Added sample blog post');
    
    // Add a sample category
    await db.collection('categories').doc('humor').set({
      id: "humor",
      name: "Humor",
      description: "Funny quotes and jokes to brighten your day",
      slug: "humor",
      postCount: 1
    });
    console.log('✅ Added sample category');
    
    // Add site stats
    await db.collection('site-stats').doc('general').set({
      totalPosts: 1,
      totalCategories: 1,
      totalViews: 1500,
      totalLikes: 245,
      lastUpdated: admin.firestore.Timestamp.now()
    });
    console.log('✅ Added site statistics');
    
    console.log('🎉 Sample data added successfully!');
    
  } catch (error) {
    console.error('Error adding sample data:', error);
  }
}

addSampleData();