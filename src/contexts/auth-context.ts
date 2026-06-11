import { createContext, useContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import type { UserRole } from '../lib/auth/roles'
import type { CurrentUserProfile } from '../lib/current-user-profile'

export type AuthContextValue = {
  session: Session | null
  user: User | null
  currentUserProfile: CurrentUserProfile | null
  role: UserRole
  isAdmin: boolean
  isCorretor: boolean
  isLoading: boolean
  profileError: string | null
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }

  return context
}

export function useCurrentUserProfile() {
  return useAuth().currentUserProfile
}
