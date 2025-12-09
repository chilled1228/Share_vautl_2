'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService, type AdminUser } from '@/lib/auth-service'

interface AuthContextType {
  user: AdminUser | null
  login: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  googleLogin: () => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  isLoading: boolean
  error: string | null
  hasMounted: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMounted, setHasMounted] = useState(false)

  // Track client-side mounting to prevent hydration mismatch
  useEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    // Only run auth state listener on client after mount
    if (!hasMounted) return

    // Set up auth state listener with lazy loading
    const unsubscribe = authService.onAuthStateChanged((authUser) => {
      console.log('[AuthProvider] Auth state changed:', {
        userId: authUser?.uid,
        email: authUser?.email,
        isAdmin: authUser?.isAdmin
      })
      setUser(authUser)
      setIsLoading(false)
      console.log('[AuthProvider] Loading set to false')
    })

    return () => unsubscribe()
  }, [hasMounted])

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const authUser = await authService.signInWithEmail(email, password)
      setUser(authUser)
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const authUser = await authService.signUpWithEmail(email, password)
      // If sign up returns a user immediately (no confirmation needed or auto-confirm), set it.
      if (authUser) setUser(authUser)
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const googleLogin = async (): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const authUser = await authService.signInWithGoogle()
      setUser(authUser)
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      await authService.signOut()
      setUser(null)
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUser = async (): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const refreshedUser = await authService.getCurrentUser()
      setUser(refreshedUser)
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, signUp, googleLogin, logout, refreshUser, isLoading, error, hasMounted }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}