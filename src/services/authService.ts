import { supabase, configStatus } from '../lib/supabaseClient'
import type { UserProfile, UserRole } from '../types/auth'
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js'

export interface AuthOperationResult {
  data?: {
    user: User | null
    session: Session | null
    profile?: UserProfile | null
  }
  error?: Error | null
  requiresEmailConfirmation?: boolean
}

/**
 * Service encapsulating Supabase GoTrue Auth and public.profiles synchronisation.
 */
export const authService = {
  /**
   * Probes active session stored locally in the browser.
   */
  async getInitialSession(): Promise<{ session: Session | null; error: Error | null }> {
    if (!configStatus.isConfigured) {
      return { session: null, error: null }
    }

    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        return { session: null, error }
      }
      return { session: data.session, error: null }
    } catch (err) {
      return {
        session: null,
        error: err instanceof Error ? err : new Error('Failed to retrieve auth session'),
      }
    }
  },

  /**
   * Fetches the user profile from public.profiles table.
   * If profile row does not exist yet (e.g., async signup trigger race condition),
   * attempts to auto-provision or provides safe fallback.
   */
  async getUserProfile(user: User): Promise<UserProfile | null> {
    if (!configStatus.isConfigured) return null

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (error) {
        console.warn('[authService] Error fetching profile:', error.message)
      }

      if (data) {
        return {
          id: data.id,
          full_name: data.full_name || 'Staff Member',
          role: (data.role as UserRole) || 'counsellor',
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString(),
        }
      }

      // Edge case: Profile trigger did not fire or row missing. Attempt safe insert with least privilege.
      const fallbackName =
        (user.user_metadata?.full_name as string) ||
        user.email?.split('@')[0] ||
        'Staff Member'
      const fallbackRole: UserRole = 'counsellor'

      const { data: inserted, error: insertErr } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          full_name: fallbackName,
          role: fallbackRole,
        })
        .select()
        .single()

      if (!insertErr && inserted) {
        return inserted as UserProfile
      }

      // In-memory fallback if database write fails due to RLS/permissions
      return {
        id: user.id,
        full_name: fallbackName,
        role: fallbackRole,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    } catch (err) {
      console.error('[authService] Unexpected profile retrieval failure:', err)
      return null
    }
  },

  /**
   * Authenticate staff with email and password.
   */
  async signInWithEmail(email: string, password: string): Promise<AuthOperationResult> {
    if (!configStatus.isConfigured) {
      return {
        error: new Error('Supabase credentials are not configured in .env. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'),
      }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        return { error }
      }

      if (!data.user) {
        return { error: new Error('Sign-in failed: No user returned.') }
      }

      const profile = await this.getUserProfile(data.user)

      return {
        data: {
          user: data.user,
          session: data.session,
          profile,
        },
      }
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error('Network error during sign-in'),
      }
    }
  },

  /**
   * Register a new staff account with default least-privileged role ('counsellor').
   */
  async signUpWithEmail(
    email: string,
    password: string,
    fullName: string
  ): Promise<AuthOperationResult> {
    if (!configStatus.isConfigured) {
      return {
        error: new Error('Supabase credentials are not configured in .env.'),
      }
    }

    try {
      const trimmedEmail = email.trim()
      const trimmedName = fullName.trim()

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: trimmedName,
            role: 'counsellor',
          },
        },
      })

      if (error) {
        return { error }
      }

      // Check if email confirmation is required by Supabase project settings
      const requiresEmailConfirmation =
        data.user && (!data.session || data.user.identities?.length === 0)

      let profile: UserProfile | null = null
      if (data.user && data.session) {
        profile = await this.getUserProfile(data.user)
      }

      return {
        data: {
          user: data.user,
          session: data.session,
          profile,
        },
        requiresEmailConfirmation: Boolean(requiresEmailConfirmation),
      }
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error('Network error during registration'),
      }
    }
  },

  /**
   * Sign out current user and terminate session.
   */
  async signOut(): Promise<{ error: Error | null }> {
    if (!configStatus.isConfigured) return { error: null }

    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error('Failed to sign out'),
      }
    }
  },

  /**
   * Subscribe to Supabase auth events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.).
   */
  onAuthStateChange(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ) {
    if (!configStatus.isConfigured) {
      return { unsubscribe: () => {} }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(callback)

    return {
      unsubscribe: () => subscription.unsubscribe(),
    }
  },
}
