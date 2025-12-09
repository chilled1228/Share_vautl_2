'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Eye, EyeOff, Shield, Lock, Mail, Chrome } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { user, login, signUp, googleLogin, error: authError } = useAuth()
  const router = useRouter()

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      router.push('/admin')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setIsLoading(true)

    try {
      if (isSignUp) {
        await signUp(email, password)
        // If signUp doesn't throw, check if we have a user immediately
        // Depending on Supabase settings, email confirmation might be required
        setSuccessMessage('Account created! Please check your email for confirmation or login if auto-confirmed.')
        setIsSignUp(false)
      } else {
        await login(email, password)
        // No need to redirect here, the useEffect will handle it
      }
    } catch (err: any) {
      setError(err.message || (isSignUp ? 'Sign up failed.' : 'Login failed. Please try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setIsLoading(true)

    try {
      await googleLogin()
      // No need to redirect here, the useEffect will handle it
    } catch (err: any) {
      setError(err.message || 'Google login failed.')
    } finally {
      setIsLoading(false)
    }
  }

  // Don't render the form if a user is already detected,
  // as the redirect will be happening shortly.
  if (user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-card brutalist-border brutalist-shadow p-8 space-y-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {isSignUp ? 'Create Account' : 'Admin Login'}
            </h1>
            <p className="text-muted-foreground">
              {isSignUp ? 'Sign up to request admin access' : 'Sign in to access the admin dashboard'}
            </p>
          </div>

          {(error || authError) && (
            <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
              <p className="text-destructive text-sm">{error || authError}</p>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-500/10 border border-green-500 rounded-lg p-4">
              <p className="text-green-600 text-sm">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary brutalist-border"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary brutalist-border"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors brutalist-border brutalist-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              {isLoading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
                setSuccessMessage('')
              }}
              className="text-sm text-primary hover:underline focus:outline-none"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-background border border-border text-foreground py-3 px-4 rounded-lg hover:bg-accent focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed brutalist-border brutalist-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          >
            <Chrome className="w-5 h-5" />
            <span>{isSignUp ? 'Sign up with Google' : 'Sign in with Google'}</span>
          </button>

          <div className="text-center text-sm text-muted-foreground">
            <p>Admin access is restricted to authorized email addresses only.</p>
            <p className="text-xs mt-1">Contact your administrator for access.</p>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Return to{' '}
            <Link href="/" className="text-primary hover:text-primary/80">
              main site
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}