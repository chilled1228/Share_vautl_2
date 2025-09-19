import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential,
  createUserWithEmailAndPassword,
  getIdTokenResult,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp, updateDoc, collection, getDocs } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { errorHandler } from '@/lib/error-handler'

export interface AdminUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  emailVerified: boolean
  isAdmin: boolean
  provider: 'google' | 'email'
}

class AuthService {
  private static instance: AuthService
  private authStateListeners: ((user: AdminUser | null) => void)[] = []

  private constructor() {
    // Listen to auth state changes
    onAuthStateChanged(auth, async (firebaseUser) => {
      const adminUser = await this.transformFirebaseUser(firebaseUser)
      this.notifyAuthStateChange(adminUser)
    })
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  // Transform Firebase user to Admin user
  private async transformFirebaseUser(
    firebaseUser: FirebaseUser | null
  ): Promise<AdminUser | null> {
    if (!firebaseUser) return null

    const isAdmin = await this.isAdminUser(firebaseUser)

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
      isAdmin,
      provider:
        firebaseUser.providerData[0]?.providerId === 'google.com'
          ? 'google'
          : 'email',
    }
  }

  // Check if user is admin by checking the users collection in Firestore
  private async isAdminUser(firebaseUser: FirebaseUser): Promise<boolean> {
    if (!firebaseUser) return false
    try {
      // Check user document for admin flag
      const userDocRef = doc(db, 'users', firebaseUser.uid)
      const userDoc = await getDoc(userDocRef)
      
      if (userDoc.exists()) {
        const userData = userDoc.data()
        return userData.isAdmin === true
      }
      
      return false
    } catch (error) {
      errorHandler.error('Error checking admin status', error as Error, {
        component: 'AuthService',
        action: 'isAdminUser',
        metadata: { uid: firebaseUser.uid }
      })
      return false
    }
  }

  // Add auth state listener
  onAuthStateChanged(callback: (user: AdminUser | null) => void): () => void {
    this.authStateListeners.push(callback)

    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback)
      if (index > -1) {
        this.authStateListeners.splice(index, 1)
      }
    }
  }

  // Notify all listeners of auth state change
  private notifyAuthStateChange(user: AdminUser | null): void {
    this.authStateListeners.forEach((callback) => callback(user))
  }

  // Create user document in Firestore
  private async createUserDocument(user: FirebaseUser): Promise<void> {
    const userDocRef = doc(db, 'users', user.uid)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      const { uid, email, displayName, photoURL } = user
      await setDoc(userDocRef, {
        uid,
        email,
        displayName,
        photoURL,
        isAdmin: false, // Default to non-admin
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }
  }

  // Google OAuth sign in
  async signInWithGoogle(): Promise<AdminUser> {
    const provider = new GoogleAuthProvider()
    provider.addScope('email')
    provider.addScope('profile')

    try {
      const result: UserCredential = await signInWithPopup(auth, provider)
      await this.createUserDocument(result.user)
      const adminUser = await this.transformFirebaseUser(result.user)

      /* if (!adminUser?.isAdmin) {
        await this.signOut()
        throw new Error('Access denied: Admin privileges required')
      } */

      if (!adminUser) {
        throw new Error('Failed to create user profile')
      }
      return adminUser
    } catch (error: any) {
      errorHandler.error('Google sign-in error', error as Error, {
        component: 'AuthService',
        action: 'signInWithGoogle'
      })

      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled')
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Please enable popups and try again')
      } else if (error.message === 'Access denied: Admin privileges required') {
        throw error
      } else {
        throw new Error('Failed to sign in with Google')
      }
    }
  }

  // Email/password sign in
  async signInWithEmail(email: string, password: string): Promise<AdminUser> {
    try {
      let result: UserCredential
      try {
        result = await signInWithEmailAndPassword(auth, email, password)
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          result = await createUserWithEmailAndPassword(auth, email, password)
        } else {
          throw error
        }
      }

      await this.createUserDocument(result.user)
      const adminUser = await this.transformFirebaseUser(result.user)

      /* if (!adminUser?.isAdmin) {
        await this.signOut()
        throw new Error('Access denied: Admin privileges required')
      } */

      if (!adminUser) {
        throw new Error('Failed to create user profile')
      }
      return adminUser
    } catch (error: any) {
      errorHandler.error('Email sign-in error', error as Error, {
        component: 'AuthService',
        action: 'signInWithEmail',
        metadata: { email }
      })

      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password'
      ) {
        throw new Error('Invalid email or password')
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later')
      } else if (error.message === 'Access denied: Admin privileges required') {
        throw error
      } else {
        throw new Error('Failed to sign in')
      }
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth)
    } catch (error) {
      errorHandler.error('Sign-out error', error as Error, {
        component: 'AuthService',
        action: 'signOut'
      })
      throw new Error('Failed to sign out')
    }
  }

  // Get current user
  async getCurrentUser(): Promise<AdminUser | null> {
    const firebaseUser = auth.currentUser
    if (!firebaseUser) return null
    
    // Force re-fetch from Firestore by getting the user document directly
    const userDocRef = doc(db, 'users', firebaseUser.uid)
    const userDoc = await getDoc(userDocRef)
    
    if (userDoc.exists()) {
      const userData = userDoc.data()
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        emailVerified: firebaseUser.emailVerified,
        isAdmin: userData.isAdmin || false,
        provider: firebaseUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'email'
      }
    }
    
    return await this.transformFirebaseUser(firebaseUser)
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return auth.currentUser !== null
  }

  // Check if current user is admin
  async isCurrentUserAdmin(): Promise<boolean> {
    const user = await this.getCurrentUser()
    return user?.isAdmin || false
  }

  // Grant admin access to a user
  async grantAdminAccess(uid: string): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', uid)
      await updateDoc(userDocRef, {
        isAdmin: true,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      errorHandler.error('Error granting admin access', error as Error, {
        component: 'AuthService',
        action: 'grantAdminAccess',
        metadata: { uid }
      })
      throw error
    }
  }

  // Revoke admin access from a user
  async revokeAdminAccess(uid: string): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', uid)
      await updateDoc(userDocRef, {
        isAdmin: false,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      errorHandler.error('Error revoking admin access', error as Error, {
        component: 'AuthService',
        action: 'revokeAdminAccess',
        metadata: { uid }
      })
      throw error
    }
  }

  // Get all users (for admin management)
  async getAllUsers(): Promise<any[]> {
    try {
      const usersRef = collection(db, 'users')
      const querySnapshot = await getDocs(usersRef)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      errorHandler.error('Error getting all users', error as Error, {
        component: 'AuthService',
        action: 'getAllUsers'
      })
      throw error
    }
  }
}

export const authService = AuthService.getInstance()
