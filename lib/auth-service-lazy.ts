'use client'

// Lazy-loaded Firebase auth service for performance optimization
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

class LazyAuthService {
  private static instance: LazyAuthService
  private authStateListeners: ((user: AdminUser | null) => void)[] = []
  private firebaseAuth: any = null
  private firebaseDb: any = null
  private firebaseLoaded = false
  private loadingPromise: Promise<void> | null = null

  private constructor() {}

  static getInstance(): LazyAuthService {
    if (!LazyAuthService.instance) {
      LazyAuthService.instance = new LazyAuthService()
    }
    return LazyAuthService.instance
  }

  // Lazy load Firebase modules
  private async loadFirebase(): Promise<void> {
    if (this.firebaseLoaded) return

    if (this.loadingPromise) {
      return this.loadingPromise
    }

    this.loadingPromise = (async () => {
      try {
        // Dynamic imports for better code splitting
        const [
          { auth },
          { db },
          authModule,
          firestoreModule
        ] = await Promise.all([
          import('@/lib/firebase'),
          import('@/lib/firebase'),
          import('firebase/auth'),
          import('firebase/firestore')
        ])

        this.firebaseAuth = auth
        this.firebaseDb = db

        // Set up auth state listener after Firebase is loaded
        authModule.onAuthStateChanged(auth, async (firebaseUser) => {
          const adminUser = await this.transformFirebaseUser(firebaseUser)
          this.notifyAuthStateChange(adminUser)
        })

        this.firebaseLoaded = true
      } catch (error) {
        console.error('Failed to load Firebase:', error)
        throw new Error('Failed to initialize authentication')
      }
    })()

    return this.loadingPromise
  }

  // Transform Firebase user to Admin user
  private async transformFirebaseUser(
    firebaseUser: any | null
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
  private async isAdminUser(firebaseUser: any): Promise<boolean> {
    if (!firebaseUser) return false

    try {
      await this.loadFirebase()
      const { doc, getDoc } = await import('firebase/firestore')

      const userDocRef = doc(this.firebaseDb, 'users', firebaseUser.uid)
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
        const userData = userDoc.data()
        return userData.isAdmin === true
      }

      return false
    } catch (error) {
      errorHandler.error('Error checking admin status', error as Error, {
        component: 'LazyAuthService',
        action: 'isAdminUser',
        metadata: { uid: firebaseUser.uid }
      })
      return false
    }
  }

  // Add auth state listener
  onAuthStateChanged(callback: (user: AdminUser | null) => void): () => void {
    this.authStateListeners.push(callback)

    // Initialize Firebase when listener is added
    this.loadFirebase().catch(console.error)

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
  private async createUserDocument(user: any): Promise<void> {
    const { doc, getDoc, setDoc, serverTimestamp } = await import('firebase/firestore')

    const userDocRef = doc(this.firebaseDb, 'users', user.uid)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      const { uid, email, displayName, photoURL } = user
      await setDoc(userDocRef, {
        uid,
        email,
        displayName,
        photoURL,
        isAdmin: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }
  }

  // Google OAuth sign in
  async signInWithGoogle(): Promise<AdminUser> {
    await this.loadFirebase()

    const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth')

    const provider = new GoogleAuthProvider()
    provider.addScope('email')
    provider.addScope('profile')

    try {
      const result = await signInWithPopup(this.firebaseAuth, provider)
      await this.createUserDocument(result.user)
      const adminUser = await this.transformFirebaseUser(result.user)

      if (!adminUser) {
        throw new Error('Failed to create user profile')
      }
      return adminUser
    } catch (error: any) {
      errorHandler.error('Google sign-in error', error as Error, {
        component: 'LazyAuthService',
        action: 'signInWithGoogle'
      })

      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled')
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Please enable popups and try again')
      } else {
        throw new Error('Failed to sign in with Google')
      }
    }
  }

  // Email/password sign in
  async signInWithEmail(email: string, password: string): Promise<AdminUser> {
    await this.loadFirebase()

    const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import('firebase/auth')

    try {
      let result
      try {
        result = await signInWithEmailAndPassword(this.firebaseAuth, email, password)
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          result = await createUserWithEmailAndPassword(this.firebaseAuth, email, password)
        } else {
          throw error
        }
      }

      await this.createUserDocument(result.user)
      const adminUser = await this.transformFirebaseUser(result.user)

      if (!adminUser) {
        throw new Error('Failed to create user profile')
      }
      return adminUser
    } catch (error: any) {
      errorHandler.error('Email sign-in error', error as Error, {
        component: 'LazyAuthService',
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
      } else {
        throw new Error('Failed to sign in')
      }
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    await this.loadFirebase()

    const { signOut } = await import('firebase/auth')

    try {
      await signOut(this.firebaseAuth)
    } catch (error) {
      errorHandler.error('Sign-out error', error as Error, {
        component: 'LazyAuthService',
        action: 'signOut'
      })
      throw new Error('Failed to sign out')
    }
  }

  // Get current user
  async getCurrentUser(): Promise<AdminUser | null> {
    await this.loadFirebase()

    const firebaseUser = this.firebaseAuth.currentUser
    if (!firebaseUser) return null

    const { doc, getDoc } = await import('firebase/firestore')

    const userDocRef = doc(this.firebaseDb, 'users', firebaseUser.uid)
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
  async isAuthenticated(): Promise<boolean> {
    await this.loadFirebase()
    return this.firebaseAuth.currentUser !== null
  }

  // Check if current user is admin
  async isCurrentUserAdmin(): Promise<boolean> {
    const user = await this.getCurrentUser()
    return user?.isAdmin || false
  }
}

export const lazyAuthService = LazyAuthService.getInstance()