
import { supabase } from '@/lib/supabase'
import { errorHandler } from '@/lib/error-handler'
import { User } from '@supabase/supabase-js'

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
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AuthService] Auth state change event:', event, 'session:', session ? 'exists' : 'null')

      try {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
          const user = session?.user || null
          console.log('[AuthService] Processing auth event, user:', user?.id, user?.email)

          // Transform user to admin user - this is now synchronous!
          console.log('[AuthService] Transforming user to admin user')
          const adminUser = this.transformSupabaseUser(user)
          console.log('[AuthService] Admin user result:', adminUser ? { uid: adminUser.uid, isAdmin: adminUser.isAdmin } : null)

          this.notifyAuthStateChange(adminUser)
        } else if (event === 'SIGNED_OUT') {
          console.log('[AuthService] User signed out')
          this.notifyAuthStateChange(null)
        }
      } catch (error) {
        console.error('[AuthService] Error in auth state change handler:', error)
        // Notify with null to prevent hanging
        this.notifyAuthStateChange(null)
      }
    })
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  // Transform Supabase user to Admin user
  private transformSupabaseUser(
    user: User | null
  ): AdminUser | null {
    if (!user) return null

    // Use email allowlist for admin check - no database query needed!
    const isAdmin = this.isAdminEmail(user.email)
    console.log('[AuthService] User email:', user.email, 'isAdmin:', isAdmin)

    // Determine provider from app_metadata or identities
    let provider = 'email'
    if (user.app_metadata?.provider === 'google' ||
      user.identities?.some(id => id.provider === 'google')) {
      provider = 'google'
    }

    return {
      uid: user.id,
      email: user.email || null,
      displayName: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || null,
      photoURL: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      emailVerified: !!user.email_confirmed_at,
      isAdmin,
      provider: provider as 'google' | 'email',
    }
  }

  // Check if email is in the admin allowlist
  // This is a synchronous check - no database query needed!
  private isAdminEmail(email: string | undefined): boolean {
    if (!email) {
      console.log('[AuthService] No email provided for admin check')
      return false
    }

    // Get admin emails from environment variable
    const adminEmailsEnv = process.env.NEXT_PUBLIC_ADMIN_EMAILS || ''
    const adminEmails = adminEmailsEnv
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(e => e.length > 0)

    console.log('[AuthService] Admin emails:', adminEmails)

    const isAdmin = adminEmails.includes(email.toLowerCase())
    console.log('[AuthService] Email', email, 'is admin:', isAdmin)

    return isAdmin
  }

  // Sync Supabase Auth user with public.users table
  // This handles migration by linking existing users by email
  private async syncUserProfile(user: User): Promise<void> {
    try {
      console.log('[AuthService] Syncing user profile for:', user.id, user.email)

      // 1. Check if user exists by auth_id - use maybeSingle to avoid errors
      const { data: existingByAuth, error: authError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .maybeSingle()

      if (authError) {
        console.error('[AuthService] Error checking user by auth_id:', authError)
      }

      if (existingByAuth) {
        console.log('[AuthService] User exists by auth_id, updating metadata')
        // User already linked, just update metadata
        await supabase.from('users').update({
          updated_at: new Date().toISOString(),
          email: user.email,
          display_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
          photo_url: user.user_metadata?.avatar_url || user.user_metadata?.picture
        }).eq('id', existingByAuth.id)
        return
      }

      // 2. Check if user exists by email (Migration scenario)
      if (user.email) {
        const { data: existingByEmail, error: emailError } = await supabase
          .from('users')
          .select('id')
          .eq('email', user.email)
          .maybeSingle()

        if (emailError) {
          console.error('[AuthService] Error checking user by email:', emailError)
        }

        if (existingByEmail) {
          console.log('[AuthService] User exists by email, linking auth_id')
          // Link this user to the auth_id
          await supabase.from('users').update({
            auth_id: user.id,
            updated_at: new Date().toISOString(),
            photo_url: user.user_metadata?.avatar_url || user.user_metadata?.picture
          }).eq('id', existingByEmail.id)
          return
        }
      }

      // 3. Create new user if not found
      console.log('[AuthService] Creating new user in users table')
      const { error: insertError } = await supabase.from('users').insert({
        auth_id: user.id,
        email: user.email!,
        display_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
        photo_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
        is_admin: false
      })

      if (insertError) {
        console.error('[AuthService] Error creating new user:', insertError)
      }

    } catch (error) {
      console.error('[AuthService] Error syncing user profile:', error)
      // Don't throw, allow login to proceed even if sync fails
    }
  }

  // Add auth state listener
  onAuthStateChanged(callback: (user: AdminUser | null) => void): () => void {
    this.authStateListeners.push(callback)

    // Immediately call with current state to avoid race condition where
    // INITIAL_SESSION event fired before this listener was attached.
    // Immediately call with current state to avoid race condition where
    // INITIAL_SESSION event fired before this listener was attached.
    // Add timeout to prevent infinite loading if Supabase client hangs
    const timeoutPromise = new Promise<{ timeout: true }>((resolve) => {
      setTimeout(() => resolve({ timeout: true }), 3000)
    })

    const userPromise = this.getCurrentUser()

    Promise.race([userPromise, timeoutPromise])
      .then(result => {
        if (result && 'timeout' in result) {
          console.warn('[AuthService] Initial user check timed out, defaulting to null')
          callback(null)
        } else {
          callback(result as AdminUser | null)
        }
      })
      .catch((err) => {
        console.error('Error fetching initial user state:', err);
        // If error (e.g. no session), callback null to ensure loading stops
        callback(null);
      });

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

  // Google OAuth sign in
  // Note: This redirects the page!
  async signInWithGoogle(): Promise<AdminUser> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      })

      if (error) throw error

      // Since it redirects, code below might not run or be relevant.
      // We throw a special error or just return a dummy promise that stays pending to prevent UI flicker?
      // But we can't return AdminUser because we don't have it yet.

      return new Promise(() => { }) // Never resolve, ensuring UI holds until redirect
    } catch (error: any) {
      errorHandler.error('Google sign-in error', error as Error, {
        component: 'AuthService',
        action: 'signInWithGoogle'
      })
      throw new Error('Failed to sign in with Google')
    }
  }

  // Email/password sign up
  async signUpWithEmail(email: string, password: string): Promise<AdminUser> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`
        }
      })

      if (error) throw error

      if (!data.user) {
        // If email confirmation is enabled, user might be null or session null? 
        // Supabase returns user but session might be null.
        // But for our case, if we require email verification, we should throw to UI.
        // If auto-confirm is on, we get user.
        if (data.session === null && data.user === null) {
          throw new Error('Sign-up failed')
        }
      }

      // If we have a user (even if unconfirmed), we can try to transform
      if (data.user) {
        const adminUser = this.transformSupabaseUser(data.user)
        return adminUser!
      }

      throw new Error('Please check your email for a confirmation link.') // Fallback if session is null (email confirm on)
    } catch (error: any) {
      errorHandler.error('Email sign-up error', error as Error, {
        component: 'AuthService',
        action: 'signUpWithEmail',
        metadata: { email }
      })
      throw error
    }
  }

  // Email/password sign in
  async signInWithEmail(email: string, password: string): Promise<AdminUser> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        // Provide friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password')
        }
        throw error
      }

      if (!data.user) throw new Error('No user returned')

      const adminUser = this.transformSupabaseUser(data.user)

      if (!adminUser) throw new Error('Failed to create user profile')
      return adminUser
    } catch (error: any) {
      errorHandler.error('Email sign-in error', error as Error, {
        component: 'AuthService',
        action: 'signInWithEmail',
        metadata: { email }
      })
      throw error
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut()
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
    const { data: { user } } = await supabase.auth.getUser()
    return this.transformSupabaseUser(user)
  }

  // Check if user is authenticated
  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const { data } = await supabase.auth.getSession()
    return !!data.session
  }

  // Check if current user is admin
  async isCurrentUserAdmin(): Promise<boolean> {
    const user = await this.getCurrentUser()
    return user?.isAdmin || false
  }

  // Grant admin access to a user
  async grantAdminAccess(uid: string): Promise<void> {
    try {
      // Find public.users row by auth_id (uid)
      // We assume uid passed here is the Supabase User ID (auth_id)
      const { error } = await supabase
        .from('users')
        .update({ is_admin: true, updated_at: new Date().toISOString() })
        .eq('auth_id', uid)

      if (error) throw error
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
      const { error } = await supabase
        .from('users')
        .update({ is_admin: false, updated_at: new Date().toISOString() })
        .eq('auth_id', uid)

      if (error) throw error
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
      const { data, error } = await supabase
        .from('users')
        .select('*')

      if (error) throw error
      return data.map(u => ({
        ...u,
        uid: u.auth_id // map back for compatibility if needed
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
