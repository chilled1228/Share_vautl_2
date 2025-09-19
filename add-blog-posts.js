const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, setDoc, doc } = require('firebase/firestore');

// Firebase config from your .env.local
const firebaseConfig = {
  apiKey: "AIzaSyDgWeA0_sJQc_v6FuGtoaoQJFIauxk7E6M",
  authDomain: "shair-vault.firebaseapp.com",
  projectId: "shair-vault",
  storageBucket: "shair-vault.firebasestorage.app",
  messagingSenderId: "863120395488",
  appId: "1:863120395488:web:a18e5ce3c2fdd2a19ed485",
  measurementId: "G-SPBEWFX3FP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const blogPosts = [
  {
    title: "50 Funny Quotes That Will Instantly Make You Smile",
    content: `# 50 Funny Quotes That Will Instantly Make You Smile

Life is too important to be taken seriously all the time. Sometimes we all need a good laugh to brighten our day and put things in perspective. Here's a collection of 50 hilarious quotes that are guaranteed to make you smile.

## Classic Comedy Gold

**1.** "I haven't spoken to my wife in years. I didn't want to interrupt her." - *Rodney Dangerfield*

**2.** "The trouble with having an open mind, of course, is that people will insist on coming along and trying to put things in it." - *Terry Pratchett*

**3.** "I'm not superstitious, but I am a little stitious." - *Michael Scott*

**4.** "Behind every great man is a woman rolling her eyes." - *Jim Carrey*

**5.** "I told my wife the truth. I told her I was seeing a psychiatrist. Then she told me the truth: that she was seeing a psychiatrist, two plumbers, and a bartender." - *Rodney Dangerfield*

## Witty Observations About Life

**6.** "The only way to survive a Monday is to pretend it's Friday." - *Unknown*

**7.** "Common sense is like deodorant. The people who need it most never use it." - *Bill Murray*

**8.** "I'm not arguing, I'm just explaining why I'm right." - *Unknown*

**9.** "Money can't buy happiness, but it can buy ice cream, which is pretty much the same thing." - *Unknown*

**10.** "I love deadlines. I like the whooshing sound they make as they fly by." - *Douglas Adams*

## Relationship Humor

**11.** "My wife and I were happy for twenty years. Then we met." - *Rodney Dangerfield*

**12.** "Marriage is like a deck of cards. In the beginning all you need is two hearts and a diamond. By the end, you wish you had a club and a spade." - *Unknown*

**13.** "I love being married. It's so great to find one special person you want to annoy for the rest of your life." - *Rita Rudner*

These quotes remind us that laughter truly is the best medicine. Share them with friends, family, or anyone who needs a good chuckle today!`,
    excerpt: "Need a good laugh? These hilarious quotes from comedians, writers, and celebrities will brighten your day instantly.",
    authorId: "quote-team",
    authorName: "The Quote Team",
    category: "Humor",
    tags: ["funny", "quotes", "humor", "comedy", "inspiration"],
    featured: true,
    published: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    imageUrl: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80",
    readTime: 8
  },
  {
    title: "25 Motivational Quotes to Fuel Your Success Journey",
    content: `# 25 Motivational Quotes to Fuel Your Success Journey

Success isn't just about reaching your destination—it's about the journey, the lessons learned, and the person you become along the way. Here are 25 powerful quotes to motivate and inspire you on your path to success.

## Quotes from Successful Entrepreneurs

**1.** "The way to get started is to quit talking and begin doing." - *Walt Disney*

**2.** "Innovation distinguishes between a leader and a follower." - *Steve Jobs*

**3.** "Don't be afraid to give up the good to go for the great." - *John D. Rockefeller*

**4.** "Success is not final, failure is not fatal: it is the courage to continue that counts." - *Winston Churchill*

**5.** "The only impossible journey is the one you never begin." - *Tony Robbins*

## Mindset and Persistence

**6.** "Whether you think you can or you think you can't, you're right." - *Henry Ford*

**7.** "Success is walking from failure to failure with no loss of enthusiasm." - *Winston Churchill*

**8.** "The difference between ordinary and extraordinary is that little extra." - *Jimmy Johnson*

**9.** "Don't watch the clock; do what it does. Keep going." - *Sam Levenson*

**10.** "Success is not how high you have climbed, but how you make a positive difference to the world." - *Roy T. Bennett*

Remember, success is not a destination but a continuous journey of growth, learning, and achievement. Every step forward, no matter how small, brings you closer to your goals.`,
    excerpt: "Discover powerful quotes from successful entrepreneurs and leaders that will inspire you to achieve your goals and overcome any obstacle.",
    authorId: "success-mentor",
    authorName: "Success Mentor",
    category: "Motivation",
    tags: ["motivation", "success", "inspiration", "quotes", "entrepreneurship"],
    featured: false,
    published: true,
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
    imageUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80",
    readTime: 6
  },
  {
    title: "Beautiful Love Quotes for Every Relationship Stage",
    content: `# Beautiful Love Quotes for Every Relationship Stage

Love is a universal language that speaks to the heart. Whether you're in the honeymoon phase, navigating challenges, or celebrating decades together, these quotes capture the essence of love in all its beautiful forms.

## New Love & Romance

**1.** "Being deeply loved by someone gives you strength, while loving someone deeply gives you courage." - *Lao Tzu*

**2.** "I have waited for this opportunity for more than half a century, to repeat to you once again my vow of eternal fidelity and everlasting love." - *Gabriel García Márquez*

**3.** "The best thing to hold onto in life is each other." - *Audrey Hepburn*

**4.** "Love is not about how many days, months, or years you have been together. Love is about how much you love each other every single day." - *Unknown*

## Lasting Partnership

**5.** "A successful marriage requires falling in love many times, always with the same person." - *Mignon McLaughlin*

**6.** "Love is friendship that has caught fire." - *Ann Landers*

**7.** "The greatest happiness of life is the conviction that we are loved; loved for ourselves, or rather, loved in spite of ourselves." - *Victor Hugo*

**8.** "Love is not just looking at each other, it's looking in the same direction." - *Antoine de Saint-Exupéry*

Love is not just a feeling—it's a choice we make every day. It's about commitment, understanding, and growing together through all of life's seasons.`,
    excerpt: "From first love to lasting partnerships, these romantic quotes capture the essence of love in all its forms and stages.",
    authorId: "romance-writer",
    authorName: "Romance Writer",
    category: "Love & Relationships",
    tags: ["love", "relationships", "romance", "quotes", "dating"],
    featured: true,
    published: true,
    createdAt: new Date("2024-01-08"),
    updatedAt: new Date("2024-01-08"),
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
    readTime: 5
  },
  {
    title: "Life Lessons: 30 Quotes of Wisdom from Great Minds",
    content: `# Life Lessons: 30 Quotes of Wisdom from Great Minds

Throughout history, great minds have shared profound insights about life, happiness, and human nature. These timeless quotes offer wisdom that can guide us through both challenging and joyful moments.

## Ancient Wisdom

**1.** "The unexamined life is not worth living." - *Socrates*

**2.** "Happiness is not something ready made. It comes from your own actions." - *Dalai Lama*

**3.** "We are what we repeatedly do. Excellence, then, is not an act, but a habit." - *Aristotle*

**4.** "The only true wisdom is in knowing you know nothing." - *Socrates*

## Modern Insights

**5.** "Life is what happens to you while you're busy making other plans." - *John Lennon*

**6.** "Be yourself; everyone else is already taken." - *Oscar Wilde*

**7.** "In three words I can sum up everything I've learned about life: it goes on." - *Robert Frost*

**8.** "The purpose of our lives is to be happy." - *Dalai Lama*

## Lessons on Growth

**9.** "Yesterday is history, tomorrow is a mystery, today is a gift, which is why we call it the present." - *Bill Keane*

**10.** "Life isn't about finding yourself. Life is about creating yourself." - *George Bernard Shaw*

True wisdom comes not from age alone, but from experience, reflection, and the willingness to learn from both our successes and our mistakes.`,
    excerpt: "Timeless wisdom from philosophers, writers, and thinkers that will change how you see life and inspire personal growth.",
    authorId: "philosophy-student",
    authorName: "Philosophy Student",
    category: "Wisdom",
    tags: ["wisdom", "philosophy", "life-lessons", "quotes", "inspiration"],
    featured: false,
    published: true,
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-05"),
    imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
    readTime: 7
  },
  {
    title: "Start Your Day Right: 20 Daily Inspiration Quotes",
    content: `# Start Your Day Right: 20 Daily Inspiration Quotes

How you start your morning sets the tone for your entire day. These inspirational quotes will help you begin each day with purpose, positivity, and the energy to tackle whatever comes your way.

## Morning Motivation

**1.** "Today is a new beginning. Embrace it with open arms and a grateful heart." - *Unknown*

**2.** "Every morning is a chance to rewrite your story. Make it a good one." - *Unknown*

**3.** "The morning was full of sunlight and hope." - *Kate Chopin*

**4.** "Each morning we are born again. What we do today is what matters most." - *Buddha*

## Positive Mindset

**5.** "Wake up with determination. Go to bed with satisfaction." - *Unknown*

**6.** "Today is full of possible. It's not about what you can't do, but what you can do." - *Unknown*

**7.** "Every day is a fresh start. Take a deep breath, smile and start again." - *Unknown*

**8.** "Morning is an important time of day because how you spend your morning can often tell you what kind of day you are going to have." - *Lemony Snicket*

## Daily Wisdom

**9.** "The best preparation for tomorrow is doing your best today." - *H. Jackson Brown Jr.*

**10.** "Don't count the days, make the days count." - *Muhammad Ali*

Remember, each new day is a gift—that's why they call it the present. Make the most of every moment and start each morning with intention and gratitude.`,
    excerpt: "Begin each morning with positive energy using these uplifting quotes designed to inspire your daily routine and mindset.",
    authorId: "daily-dose-team",
    authorName: "Daily Dose Team",
    category: "Daily Inspiration",
    tags: ["daily", "inspiration", "morning", "quotes", "motivation"],
    featured: false,
    published: true,
    createdAt: new Date("2024-01-03"),
    updatedAt: new Date("2024-01-03"),
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    readTime: 4
  }
];

async function addBlogPosts() {
  try {
    console.log('🚀 Starting to add blog posts to Firestore...');
    
    for (const post of blogPosts) {
      const docRef = await addDoc(collection(db, 'posts'), post);
      console.log(`✅ Added blog post: "${post.title}" with ID: ${docRef.id}`);
    }
    
    console.log('🎉 Successfully added all blog posts!');
    console.log(`📊 Total posts added: ${blogPosts.length}`);
    
  } catch (error) {
    console.error('❌ Error adding blog posts:', error);
  }
}

addBlogPosts();