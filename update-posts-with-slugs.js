const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDgWeA0_sJQc_v6FuGtoaoQJFIauxk7E6M",
  authDomain: "shair-vault.firebaseapp.com",
  projectId: "shair-vault",
  storageBucket: "shair-vault.firebasestorage.app",
  messagingSenderId: "863120395488",
  appId: "1:863120395488:web:a18e5ce3c2fdd2a19ed485",
  measurementId: "G-SPBEWFX3FP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function updatePostsWithSlugs() {
  try {
    console.log('🔄 Updating existing posts with slug fields...');
    
    const querySnapshot = await getDocs(collection(db, 'posts'));
    
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      const slug = createSlug(data.title);
      
      await updateDoc(doc(db, 'posts', docSnap.id), {
        slug: slug
      });
      
      console.log(`✅ Updated "${data.title}" with slug: "${slug}"`);
    }
    
    console.log('🎉 Successfully updated all posts with slugs!');
    
  } catch (error) {
    console.error('❌ Error updating posts:', error);
  }
}

updatePostsWithSlugs();