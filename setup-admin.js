// Simple script to create an admin user
// Run with: node setup-admin.js

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

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

async function createAdminUser() {
  const email = 'admin@example.com';
  const password = 'admin123';

  try {
    console.log('Creating admin user...');

    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log('User created with UID:', user.uid);

    // Create user document in Firestore with admin role
    await setDoc(doc(db, 'users', user.uid), {
      email: email,
      displayName: 'Admin User',
      isAdmin: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('🌐 You can now login at /admin/login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);

    if (error.code === 'auth/email-already-in-use') {
      console.log('User already exists. Updating to admin role...');

      try {
        // Sign in with existing user to get UID
        const { signInWithEmailAndPassword } = require('firebase/auth');
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update user document to be admin
        await setDoc(doc(db, 'users', user.uid), {
          email: email,
          displayName: 'Admin User',
          isAdmin: true,
          updatedAt: serverTimestamp()
        }, { merge: true });

        console.log('✅ User updated to admin role successfully!');
        console.log('📧 Email:', email);
        console.log('🔑 Password:', password);
        console.log('🌐 You can now login at /admin/login');
      } catch (updateError) {
        console.error('❌ Error updating user to admin:', updateError.message);
      }
    }

    process.exit(1);
  }
}

createAdminUser();