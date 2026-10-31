import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { authService } from '../services/authService'
import { configStatus } from '../lib/supabaseClient'
import {
  type UserProfile,
  type UserRole,
  type Permission,
  type AuthContextValue,
  hasRolePermission,
} from '../types/auth'

/**
 * Standard workshop demo staff profiles when running without an active Supabase session
 */
export const WORKSHOP_PROFILES: Record<UserRole, UserProfile> = {
  counsellor: {
    id: 'demo-counsellor-001',
    full_name: 'Priya Sharma',
    role: 'counsellor',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  manager: {
    id: 'demo-manager-002',
    full_name: 'Aarav Patel',
    role: 'manager',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  admin: {
    id: 'demo-admin-003',
    full_name: 'Dr. Ramesh Nair',
    role: 'admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [workshopRole, setWorkshopRole] = useState<UserRole>('counsellor')
  const [isWorkshopMode, setIsWorkshopMode] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false)
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin')

  /**
   * Refresh the user profile from Supabase
   */
  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null)
      return
    }
    const prof = await authService.getUserProfile(user)
    if (prof) {
      setProfile(prof)
      setIsWorkshopMode(false)
    }
  }, [user])

  /**
   * Initialize Auth on load
   */
  useEffect(() => {
    let isMounted = true

    async function initAuth() {
      try {
        if (!configStatus.isConfigured) {
          // If Supabase credentials are missing, start in workshop demo mode
          if (isMounted) {
            setUser(null)
            setProfile(WORKSHOP_PROFILES.counsellor)
            setIsWorkshopMode(true)
            setLoading(false)
          }
          return
        }

        const { session, error: sessErr } = await authService.getInitialSession()
        if (sessErr) {
          console.warn('[AuthProvider] Session retrieval error:', sessErr.message)
        }

        if (isMounted) {
          if (session?.user) {
            setUser(session.user)
            const prof = await authService.getUserProfile(session.user)
            setProfile(prof)
            setIsWorkshopMode(false)
          } else {
            setUser(null)
            setProfile(WORKSHOP_PROFILES[workshopRole])
            setIsWorkshopMode(true)
          }
          setLoading(false)
        }
      } catch (err) {
        console.error('[AuthProvider] Auth initialization error:', err)
        if (isMounted) {
          setUser(null)
          setProfile(WORKSHOP_PROFILES.counsellor)
          setIsWorkshopMode(true)
          setLoading(false)
        }
      }
    }

    initAuth()

    // Listen for auth state changes from Supabase GoTrue
    const { unsubscribe } = authService.onAuthStateChange(async (event, session: Session | null) => {
      if (!isMounted) return

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (session?.user) {
          setUser(session.user)
          const prof = await authService.getUserProfile(session.user)
          setProfile(prof)
          setIsWorkshopMode(false)
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(WORKSHOP_PROFILES[workshopRole])
        setIsWorkshopMode(true)
      }
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [workshopRole])

  /**
   * Determine effective active role
   */
  const activeRole: UserRole = useMemo(() => {
    if (isWorkshopMode) {
      return workshopRole
    }
    return profile?.role || 'counsellor'
  }, [isWorkshopMode, workshopRole, profile])

  /**
   * Switch the local workshop preview role
   */
  const switchWorkshopRole = useCallback((role: UserRole) => {
    setWorkshopRole(role)
    setIsWorkshopMode(true)
    setProfile(WORKSHOP_PROFILES[role])
  }, [])

  /**
   * Sign in with Supabase email & password
   */
  const signIn = useCallback(
    async (email: string, pass: string): Promise<{ error: Error | null }> => {
      setError(null)
      const res = await authService.signInWithEmail(email, pass)
      if (res.error) {
        setError(res.error.message)
        return { error: res.error }
      }
      if (res.data?.user) {
        setUser(res.data.user)
        setProfile(res.data.profile || null)
        setIsWorkshopMode(false)
        setIsAuthModalOpen(false)
      }
      return { error: null }
    },
    []
  )

  /**
   * Sign up with Supabase email & password
   */
  const signUp = useCallback(
    async (
      email: string,
      pass: string,
      fullName: string
    ): Promise<{ error: Error | null; requiresEmailConfirmation?: boolean }> => {
      setError(null)
      const res = await authService.signUpWithEmail(email, pass, fullName)
      if (res.error) {
        setError(res.error.message)
        return { error: res.error }
      }
      if (res.data?.user && res.data.session) {
        setUser(res.data.user)
        setProfile(res.data.profile || null)
        setIsWorkshopMode(false)
        setIsAuthModalOpen(false)
      }
      return {
        error: null,
        requiresEmailConfirmation: res.requiresEmailConfirmation,
      }
    },
    []
  )

  /**
   * Sign out of Supabase
   */
  const signOut = useCallback(async () => {
    setError(null)
    await authService.signOut()
    setUser(null)
    setIsWorkshopMode(true)
    setProfile(WORKSHOP_PROFILES[workshopRole])
  }, [workshopRole])

  /**
   * Permission tester against active role
   */
  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      return hasRolePermission(activeRole, permission)
    },
    [activeRole]
  )

  const openAuthModal = useCallback((mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode)
    setError(null)
    setIsAuthModalOpen(true)
  }, [])

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false)
    setError(null)
  }, [])

  const contextValue: AuthContextValue = {
    user,
    profile,
    role: activeRole,
    isWorkshopMode,
    loading,
    error,
    hasPermission,
    signIn,
    signUp,
    signOut,
    switchWorkshopRole,
    refreshProfile,
    openAuthModal,
    closeAuthModal,
    isAuthModalOpen,
    authModalMode,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

/**
 * Hook to consume AuthContext safely
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider>')
  }
  return context
}
