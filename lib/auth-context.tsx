'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService, type AdminUser } from '@/lib/auth-service'

interface AuthContextType {
  user: AdminUser | null
  login: (email: string, password: string) => Promise<void>
  googleLogin: () => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  isLoading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Set up auth state listener
    const unsubscribe = authService.onAuthStateChanged((authUser) => {
      setUser(authUser)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

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
    <AuthContext.Provider value={{ user, login, googleLogin, logout, refreshUser, isLoading, error }}>
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