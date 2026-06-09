import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { AuthContextValue } from '../contexts/auth-context'
import { isAdminRole, isCorretorRole, parseUserRole } from '../lib/auth/roles'
import { supabase } from '../lib/supabase'

export function useAuthSession(): AuthContextValue {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession)
      setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return useMemo(() => {
    const user = session?.user ?? null
    const role = parseUserRole(user)

    return {
      session,
      user,
      role,
      isAdmin: isAdminRole(role),
      isCorretor: isCorretorRole(role),
      isLoading,
      signOut,
    }
  }, [session, isLoading, signOut])
}
