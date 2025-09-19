const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = {
  "type": "service_account",
  "project_id": "shair-vault",
  // Note: You'll need to download the service account key from Firebase Console
  // and replace this with your actual service account credentials
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://shair-vault-default-rtdb.firebaseio.com"
});

const db = admin.firestore();

const blogPosts = [
  {
    id: "funny-quotes-collection",
    title: "50 Funny Quotes That Will Instantly Make You Smile",
    slug: "50-funny-quotes-that-will-instantly-make-you-smile",
    excerpt: "Need a good laugh? These hilarious quotes from comedians, writers, and celebrities will brighten your day instantly.",
    content: `# 50 Funny Quotes That Will Instantly Make You Smile

Life is too important to be taken seriously all the time. Sometimes we all need a good laugh to brighten our day and put things in perspective. Here's a collection of 50 hilarious quotes that are guaranteed to make you smile.

## Classic Comedy Gold

1. "I haven't spoken to my wife in years. I didn't want to interrupt her." - Rodney Dangerfield

2. "The trouble with having an open mind, of course, is that people will insist on coming along and trying to put things in it." - Terry Pratchett

3. "I'm not superstitious, but I am a little stitious." - Michael Scott

4. "Behind every great man is a woman rolling her eyes." - Jim Carrey

5. "I told my wife the truth. I told her I was seeing a psychiatrist. Then she told me the truth: that she was seeing a psychiatrist, two plumbers, and a bartender." - Rodney Dangerfield

## Witty Observations

6. "The only way to survive a Monday is to pretend it's Friday." - Unknown

7. "Common sense is like deodorant. The people who need it most never use it." - Bill Murray

8. "I'm not arguing, I'm just explaining why I'm right." - Unknown

9. "Money can't buy happiness, but it can buy ice cream, which is pretty much the same thing." - Unknown

10. "I love deadlines. I like the whooshing sound they make as they fly by." - Douglas Adams

## More Hilarious Quotes

*[Continue with 40 more funny quotes covering topics like relationships, work, life, and everything in between]*

These quotes remind us that laughter truly is the best medicine. Share them with friends, family, or anyone who needs a good chuckle today!`,
    authorId: "quote-team-001",
    authorName: "The Quote Team",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    category: "Humor",
    tags: ["funny", "quotes", "humor", "comedy", "inspiration"],
    featured: true,
    published: true,
    readTime: 8,
    imageUrl: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800"
  },
  {
    id: "motivational-quotes-success",
    title: "25 Motivational Quotes to Fuel Your Success Journey",
    slug: "25-motivational-quotes-to-fuel-your-success-journey",
    excerpt: "Discover powerful quotes from successful entrepreneurs and leaders that will inspire you to achieve your goals.",
    content: `# 25 Motivational Quotes to Fuel Your Success Journey

Success isn't just about reaching your destination—it's about the journey, the lessons learned, and the person you become along the way. Here are 25 powerful quotes to motivate and inspire you.

## Quotes from Successful Entrepreneurs

1. "The way to get started is to quit talking and begin doing." - Walt Disney

2. "Innovation distinguishes between a leader and a follower." - Steve Jobs

3. "Don't be afraid to give up the good to go for the great." - John D. Rockefeller

4. "Success is not final, failure is not fatal: it is the courage to continue that counts." - Winston Churchill

5. "The only impossible journey is the one you never begin." - Tony Robbins

*[Continue with 20 more motivational quotes]*

Remember, success is not a destination but a continuous journey of growth and achievement.`,
    authorId: "success-mentor-001",
    authorName: "Success Mentor",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
    category: "Motivation",
    tags: ["motivation", "success", "inspiration", "quotes", "entrepreneurship"],
    featured: false,
    published: true,
    readTime: 5,
    imageUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800"
  },
  {
    id: "love-relationship-quotes",
    title: "Beautiful Love Quotes for Every Relationship Stage",
    slug: "beautiful-love-quotes-for-every-relationship-stage",
    excerpt: "From first love to lasting partnerships, these romantic quotes capture the essence of love in all its forms.",
    content: `# Beautiful Love Quotes for Every Relationship Stage

Love is a universal language that speaks to the heart. Whether you're in the honeymoon phase or celebrating decades together, these quotes capture the beauty of love.

## New Love

1. "Being deeply loved by someone gives you strength, while loving someone deeply gives you courage." - Lao Tzu

2. "I have waited for this opportunity for more than half a century, to repeat to you once again my vow of eternal fidelity and everlasting love." - Gabriel García Márquez

*[Continue with more love quotes for different stages]*

Love is not just a feeling—it's a choice we make every day.`,
    authorId: "romance-writer-001",
    authorName: "Romance Writer",
    createdAt: new Date("2024-01-08"),
    updatedAt: new Date("2024-01-08"),
    category: "Love & Relationships",
    tags: ["love", "relationships", "romance", "quotes", "dating"],
    featured: false,
    published: true,
    readTime: 6,
    imageUrl: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800"
  },
  {
    id: "wisdom-life-lessons",
    title: "Life Lessons: 30 Quotes of Wisdom from Great Minds",
    slug: "life-lessons-30-quotes-of-wisdom-from-great-minds",
    excerpt: "Timeless wisdom from philosophers, writers, and thinkers that will change how you see life.",
    content: `# Life Lessons: 30 Quotes of Wisdom from Great Minds

Throughout history, great minds have shared profound insights about life, happiness, and human nature. These quotes offer timeless wisdom for modern living.

## Ancient Wisdom

1. "The unexamined life is not worth living." - Socrates

2. "Happiness is not something ready made. It comes from your own actions." - Dalai Lama

*[Continue with more wisdom quotes]*

True wisdom comes not from age, but from experience and reflection.`,
    authorId: "philosophy-student-001",
    authorName: "Philosophy Student",
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-05"),
    category: "Wisdom",
    tags: ["wisdom", "philosophy", "life-lessons", "quotes", "inspiration"],
    featured: true,
    published: true,
    readTime: 7,
    imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800"
  },
  {
    id: "daily-inspiration-quotes",
    title: "Start Your Day Right: 20 Daily Inspiration Quotes",
    slug: "start-your-day-right-20-daily-inspiration-quotes",
    excerpt: "Begin each morning with positive energy using these uplifting quotes designed to inspire your daily routine.",
    content: `# Start Your Day Right: 20 Daily Inspiration Quotes

How you start your morning sets the tone for your entire day. These inspirational quotes will help you begin each day with purpose and positivity.

## Morning Motivation

1. "Today is a new beginning. Embrace it with open arms and a grateful heart."

2. "Every morning is a chance to rewrite your story. Make it a good one."

*[Continue with more daily inspiration quotes]*

Remember, each new day is a gift—that's why they call it the present.`,
    authorId: "daily-dose-team-001",
    authorName: "Daily Dose Team",
    createdAt: new Date("2024-01-03"),
    updatedAt: new Date("2024-01-03"),
    category: "Daily Inspiration",
    tags: ["daily", "inspiration", "morning", "quotes", "motivation"],
    featured: false,
    published: true,
    readTime: 4,
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"
  }
];

const categories = [
  {
    id: "humor",
    name: "Humor",
    description: "Funny quotes and jokes to brighten your day",
    slug: "humor",
    postCount: 1
  },
  {
    id: "motivation",
    name: "Motivation",
    description: "Inspirational quotes to fuel your success",
    slug: "motivation",
    postCount: 1
  },
  {
    id: "love-relationships",
    name: "Love & Relationships",
    description: "Romantic quotes for every relationship stage",
    slug: "love-relationships",
    postCount: 1
  },
  {
    id: "wisdom",
    name: "Wisdom",
    description: "Timeless wisdom from great thinkers",
    slug: "wisdom",
    postCount: 1
  },
  {
    id: "daily-inspiration",
    name: "Daily Inspiration",
    description: "Daily doses of inspiration and positivity",
    slug: "daily-inspiration",
    postCount: 1
  }
];

async function seedData() {
  try {
    console.log('Starting to seed blog data...');
    
    // Add blog posts
    for (const post of blogPosts) {
      await db.collection('posts').doc(post.id).set(post);
      console.log(`Added blog post: ${post.title}`);
    }
    
    // Add categories
    for (const category of categories) {
      await db.collection('categories').doc(category.id).set(category);
      console.log(`Added category: ${category.name}`);
    }
    
    // Add some site stats
    await db.collection('site-stats').doc('general').set({
      totalPosts: blogPosts.length,
      totalCategories: categories.length,
      totalViews: blogPosts.reduce((sum, post) => sum + post.views, 0),
      totalLikes: blogPosts.reduce((sum, post) => sum + post.likes, 0),
      lastUpdated: new Date()
    });
    
    console.log('Successfully seeded all blog data!');
    console.log(`Added ${blogPosts.length} blog posts`);
    console.log(`Added ${categories.length} categories`);
    
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  seedData().then(() => {
    console.log('Seeding completed!');
    process.exit(0);
  }).catch(error => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
}

module.exports = { seedData, blogPosts, categories };