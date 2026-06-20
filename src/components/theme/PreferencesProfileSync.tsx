import { useEffect, useMemo, useRef } from 'react'
import { useAuth } from '../../contexts/auth-context'
import { usePreferences } from '../../contexts/preferences-context'
import { supabase } from '../../lib/supabase'

export function PreferencesProfileSync() {
  const { user, session } = useAuth()
  const { preferences } = usePreferences()
  const lastSyncedPayloadRef = useRef<string | null>(null)
  const syncTimeoutRef = useRef<number | null>(null)

  const serializedPreferences = useMemo(
    () => JSON.stringify(preferences),
    [preferences],
  )

  useEffect(() => {
    if (!session || !user?.id) {
      lastSyncedPayloadRef.current = null
      if (syncTimeoutRef.current !== null) {
        window.clearTimeout(syncTimeoutRef.current)
        syncTimeoutRef.current = null
      }
      return
    }

    if (serializedPreferences === lastSyncedPayloadRef.current) {
      return
    }

    if (syncTimeoutRef.current !== null) {
      window.clearTimeout(syncTimeoutRef.current)
    }

    syncTimeoutRef.current = window.setTimeout(() => {
      void supabase
        .from('profiles')
        .update({
          ux_preferences: preferences,
          ux_preferences_updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .then(({ error }) => {
          if (!error) {
            lastSyncedPayloadRef.current = serializedPreferences
          }
        })

      syncTimeoutRef.current = null
    }, 500)

    return () => {
      if (syncTimeoutRef.current !== null) {
        window.clearTimeout(syncTimeoutRef.current)
        syncTimeoutRef.current = null
      }
    }
  }, [preferences, serializedPreferences, session, user?.id])

  return null
}
