import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import type { AuthContextValue } from '../contexts/auth-context'
import {
  CurrentUserProfileNotFoundError,
  fetchCurrentUserProfile,
  type CurrentUserProfile,
} from '../lib/current-user-profile'
import {
  isAdminRole,
  isCorretorRole,
  parseUserRole,
} from '../lib/auth/roles'
import { supabase } from '../lib/supabase'

function buildFallbackProfile(user: User): CurrentUserProfile {
  const role = parseUserRole(user)
  const fullName =
    typeof user.user_metadata.full_name === 'string' && user.user_metadata.full_name
      ? user.user_metadata.full_name
      : user.email ?? 'Corretor'

  return {
    id: user.id,
    fullName,
    role,
    isAdmin: isAdminRole(role),
  }
}

export function useAuthSession(): AuthContextValue {
  const [session, setSession] = useState<Session | null>(null)
  const [currentUserProfile, setCurrentUserProfile] =
    useState<CurrentUserProfile | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const sessionRef = useRef<Session | null>(null)
  const requestIdRef = useRef(0)

  const loadProfileForSession = useCallback(async (nextSession: Session | null) => {
    requestIdRef.current += 1
    const requestId = requestIdRef.current

    sessionRef.current = nextSession
    setSession(nextSession)

    if (!nextSession?.user) {
      setCurrentUserProfile(null)
      setProfileError(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    try {
      const profile = await fetchCurrentUserProfile(nextSession.user.id)

      if (requestId !== requestIdRef.current) {
        return
      }

      setCurrentUserProfile(profile)
      setProfileError(null)
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return
      }

      if (error instanceof CurrentUserProfileNotFoundError) {
        setCurrentUserProfile(buildFallbackProfile(nextSession.user))
        setProfileError(null)
      } else {
        setCurrentUserProfile(null)
        setProfileError(
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar o perfil atual.',
        )
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      void loadProfileForSession(currentSession)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void loadProfileForSession(nextSession)
    })

    return () => subscription.unsubscribe()
  }, [loadProfileForSession])

  const refreshProfile = useCallback(async () => {
    await loadProfileForSession(sessionRef.current)
  }, [loadProfileForSession])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return useMemo(() => {
    const user = session?.user ?? null
    const role = currentUserProfile?.role ?? parseUserRole(user)
    const isAdmin = currentUserProfile?.isAdmin ?? isAdminRole(role)

    return {
      session,
      user,
      currentUserProfile,
      role,
      isAdmin,
      isCorretor: isCorretorRole(role),
      isLoading,
      profileError,
      refreshProfile,
      signOut,
    }
  }, [
    currentUserProfile,
    isLoading,
    profileError,
    refreshProfile,
    session,
    signOut,
  ])
}
