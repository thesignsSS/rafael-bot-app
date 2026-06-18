import { useCallback, useEffect, useState } from 'react'
import { fetchPendingInvitationsSummary } from '../pages/propostas/lib/invitationsApi'

export function usePendingInvitationsIndicator(options: {
  brokerUserId?: string | null
  enabled: boolean
}) {
  const { brokerUserId, enabled } = options
  const [pendingCount, setPendingCount] = useState(0)

  const load = useCallback(async () => {
    if (!enabled || !brokerUserId) {
      setPendingCount(0)
      return
    }

    try {
      const data = await fetchPendingInvitationsSummary(brokerUserId)
      setPendingCount(data.pendingCount)
    } catch {
      setPendingCount(0)
    }
  }, [brokerUserId, enabled])

  useEffect(() => {
    void load()

    if (!enabled || !brokerUserId) {
      return
    }

    const intervalId = window.setInterval(() => {
      void load()
    }, 30000)

    return () => window.clearInterval(intervalId)
  }, [brokerUserId, enabled, load])

  return {
    pendingCount,
    hasPending: pendingCount > 0,
    reloadPendingInvitationsIndicator: load,
  }
}
