import { doc, setDoc } from 'firebase/firestore'
import { db } from './firebase'

// Add admin user to Firestore
// This should be run once to set up admin access
export async function seedAdminUser() {
  const adminUid = 'your-admin-uid' // Replace with actual Firebase user UID
  
  try {
    await setDoc(doc(db, 'admins', adminUid), {
      email: 'blog.boopul@gmail.com',
      role: 'admin',
      createdAt: new Date(),
      permissions: ['read', 'write', 'delete']
    })
    console.log('Admin user seeded successfully')
  } catch (error) {
    console.error('Error seeding admin user:', error)
  }
}

// For testing - you can temporarily add this to a page to run once
// seedAdminUser()