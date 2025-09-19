// Enhanced admin setup script
// Run with: node setup-admin-enhanced.js

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, serverTimestamp, getDoc, collection, getDocs, query, where } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDgWeA0_sJQc_v6FuGtoaoQJFIauxk7E6M",
  authDomain: "shair-vault.firebaseapp.com",
  projectId: "shair-vault",
  storageBucket: "shair-vault.firebasestorage.app",
  messagingSenderId: "863120395488",
  appId: "1:863120395488:web:a18e5ce3c2fdd2a19ed485"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function setupEmailAdmin() {
  const email = 'admin@example.com';
  const password = 'admin123';

  try {
    console.log('Setting up email admin user...');

    // Try to sign in with existing user
    let userCredential;
    try {
      userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Existing user found with UID:', userCredential.user.uid);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('❌ User does not exist. Please create the user first by logging in with email/password.');
        return;
      } else if (error.code === 'auth/wrong-password') {
        console.log('❌ Wrong password. Please check the password and try again.');
        return;
      } else {
        throw error;
      }
    }

    const user = userCredential.user;

    // Check if user document exists and current admin status
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    const currentStatus = userDoc.exists() ? userDoc.data().isAdmin : false;
    console.log(`Current admin status: ${currentStatus}`);

    // Create or update user document with admin role
    await setDoc(userDocRef, {
      email: email,
      displayName: 'Admin User',
      photoURL: user.photoURL,
      isAdmin: true,
      createdAt: userDoc.exists() ? userDoc.data().createdAt : serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    console.log('✅ Email admin user setup completed!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('🌐 You can now login at /admin/login');
    console.log('🔧 Admin status: ENABLED');
  } catch (error) {
    console.error('❌ Error setting up email admin:', error.message);
  }
}

async function findUserByEmail(email) {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error finding user by email:', error.message);
    return null;
  }
}

async function setupGoogleAdmin() {
  const email = 'blog.boopul@gmail.com'; // Replace with actual Google email

  try {
    console.log(`Setting up Google OAuth admin user: ${email}`);

    // Find user by email in Firestore
    const user = await findUserByEmail(email);

    if (!user) {
      console.log('❌ User not found in Firestore.');
      console.log('Please:');
      console.log('1. First sign in with Google OAuth at /admin/login');
      console.log('2. Then run this script again');
      return;
    }

    console.log(`✅ User found with UID: ${user.id}`);
    console.log(`Current admin status: ${user.isAdmin || false}`);

    // Update user to admin
    const userDocRef = doc(db, 'users', user.id);
    await setDoc(userDocRef, {
      isAdmin: true,
      updatedAt: serverTimestamp()
    }, { merge: true });

    console.log('✅ Google OAuth admin user setup completed!');
    console.log('📧 Email:', email);
    console.log('🌐 You can now login at /admin/login with Google OAuth');
    console.log('🔧 Admin status: ENABLED');
  } catch (error) {
    console.error('❌ Error setting up Google admin:', error.message);
  }
}

async function listAllUsers() {
  try {
    console.log('\n📋 All Users in Firestore:');
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);

    if (querySnapshot.empty) {
      console.log('No users found');
      return;
    }

    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      console.log(`- ${userData.email} (UID: ${doc.id}) | Admin: ${userData.isAdmin || false} | Provider: ${userData.provider || 'unknown'}`);
    });
  } catch (error) {
    console.error('Error listing users:', error.message);
  }
}

async function main() {
  const args = process.argv.slice(2);

  console.log('🔧 Enhanced Admin Setup Script\n');

  if (args.includes('--google')) {
    await setupGoogleAdmin();
  } else if (args.includes('--list')) {
    await listAllUsers();
  } else {
    await setupEmailAdmin();
  }

  console.log('\n📋 Usage:');
  console.log('  node setup-admin-enhanced.js          # Setup email admin');
  console.log('  node setup-admin-enhanced.js --google  # Setup Google OAuth admin');
  console.log('  node setup-admin-enhanced.js --list     # List all users');

  process.exit(0);
}

main();