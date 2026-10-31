import type { User } from '@supabase/supabase-js'

export type UserRole = 'admin' | 'manager' | 'counsellor'

export interface UserProfile {
  id: string
  full_name: string
  role: UserRole
  created_at: string
  updated_at: string
}

export type Permission =
  | 'leads:view_all'
  | 'leads:create'
  | 'leads:edit_assigned'
  | 'leads:edit_all'
  | 'leads:delete'
  | 'leads:reassign'
  | 'followups:manage'
  | 'reports:view_team'
  | 'reports:export'
  | 'settings:manage'

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'leads:view_all',
    'leads:create',
    'leads:edit_assigned',
    'leads:edit_all',
    'leads:delete',
    'leads:reassign',
    'followups:manage',
    'reports:view_team',
    'reports:export',
    'settings:manage',
  ],
  manager: [
    'leads:view_all',
    'leads:create',
    'leads:edit_assigned',
    'leads:edit_all',
    'leads:delete',
    'leads:reassign',
    'followups:manage',
    'reports:view_team',
    'reports:export',
  ],
  counsellor: [
    'leads:create',
    'leads:edit_assigned',
    'followups:manage',
  ],
}

export function hasRolePermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  role: UserRole
  isWorkshopMode: boolean
  loading: boolean
  error: string | null
  hasPermission: (permission: Permission) => boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: Error | null; requiresEmailConfirmation?: boolean }>
  signOut: () => Promise<void>
  switchWorkshopRole: (role: UserRole) => void
  refreshProfile: () => Promise<void>
  openAuthModal: (mode?: 'signin' | 'signup') => void
  closeAuthModal: () => void
  isAuthModalOpen: boolean
  authModalMode: 'signin' | 'signup'
}
