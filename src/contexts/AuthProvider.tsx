import { type ReactNode } from 'react'
import { AuthContext } from './auth-context'
import { useAuthSession } from '../hooks/useAuthSession'

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const value = useAuthSession()

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
