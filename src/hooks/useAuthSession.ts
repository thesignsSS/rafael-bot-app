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
import type { AuthChangeEvent } from '@supabase/supabase-js'

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
    isActive: true,
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
  const profileCacheRef = useRef(new Map<string, CurrentUserProfile>())

  const loadProfileForSession = useCallback(async (
    nextSession: Session | null,
    options?: {
      force?: boolean
    },
  ) => {
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

    const userId = nextSession.user.id
    const cachedProfile = profileCacheRef.current.get(userId)

    if (cachedProfile && !options?.force) {
      setCurrentUserProfile(cachedProfile)
      setProfileError(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    try {
      const profile = await fetchCurrentUserProfile(userId)

      if (requestId !== requestIdRef.current) {
        return
      }

      if (!profile.isActive) {
        profileCacheRef.current.delete(userId)
        setCurrentUserProfile(null)
        setProfileError('Seu perfil está inativo. Entre em contato com um administrador.')
        setIsLoading(false)
        await supabase.auth.signOut()
        return
      }

      profileCacheRef.current.set(userId, profile)
      setCurrentUserProfile(profile)
      setProfileError(null)
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return
      }

      if (error instanceof CurrentUserProfileNotFoundError) {
        const fallbackProfile = buildFallbackProfile(nextSession.user)
        profileCacheRef.current.set(userId, fallbackProfile)
        setCurrentUserProfile(fallbackProfile)
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
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, nextSession) => {
      const currentUserId = sessionRef.current?.user?.id ?? null
      const nextUserId = nextSession?.user?.id ?? null
      const isSameUser = currentUserId !== null && currentUserId === nextUserId

      if (
        isSameUser &&
        (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') &&
        profileCacheRef.current.has(nextUserId)
      ) {
        sessionRef.current = nextSession
        setSession(nextSession)
        setIsLoading(false)
        return
      }

      void loadProfileForSession(nextSession)
    })

    return () => subscription.unsubscribe()
  }, [loadProfileForSession])

  const refreshProfile = useCallback(async () => {
    const currentUserId = sessionRef.current?.user?.id

    if (currentUserId) {
      profileCacheRef.current.delete(currentUserId)
    }

    await loadProfileForSession(sessionRef.current, { force: true })
  }, [loadProfileForSession])

  const signOut = useCallback(async () => {
    const currentUserId = sessionRef.current?.user?.id

    if (currentUserId) {
      profileCacheRef.current.delete(currentUserId)
    }

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
