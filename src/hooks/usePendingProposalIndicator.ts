import { useCallback, useEffect, useState } from 'react'

type PendingSummaryResponse = {
  pendingCount: number
  hasPending: boolean
}

const PENDING_SUMMARY_CACHE_TTL_MS = 5000
const pendingSummaryCache = new Map<
  string,
  { data: PendingSummaryResponse; fetchedAt: number }
>()
const pendingSummaryInflightRequests = new Map<
  string,
  Promise<PendingSummaryResponse | null>
>()

const formSubmissionApiUrl = import.meta.env.VITE_FORM_SUBMISSION_API_URL
const formSubmissionApiKey = import.meta.env.VITE_FORM_SUBMISSION_API_KEY

function getPendingSummaryApiUrl() {
  if (!formSubmissionApiUrl) {
    throw new Error('URL de envio do formulário não configurada.')
  }

  return formSubmissionApiUrl.replace(
    /\/form-submissions\/?$/,
    '/proposals/pending-summary',
  )
}

function getRequestHeaders() {
  if (!formSubmissionApiKey) {
    throw new Error('Chave de API de envio do formulário não configurada.')
  }

  return {
    Authorization: `Bearer ${formSubmissionApiKey}`,
  }
}

async function fetchPendingSummary(
  brokerUserId: string,
): Promise<PendingSummaryResponse | null> {
  const cachedEntry = pendingSummaryCache.get(brokerUserId)

  if (
    cachedEntry &&
    Date.now() - cachedEntry.fetchedAt < PENDING_SUMMARY_CACHE_TTL_MS
  ) {
    return cachedEntry.data
  }

  const inflightRequest = pendingSummaryInflightRequests.get(brokerUserId)

  if (inflightRequest) {
    return inflightRequest
  }

  const request = (async () => {
    const url = new URL(getPendingSummaryApiUrl())
    url.searchParams.set('brokerUserId', brokerUserId)

    const response = await fetch(url.toString(), {
      headers: getRequestHeaders(),
    })

    const data = (await response.json().catch(() => null)) as PendingSummaryResponse | null

    if (!response.ok || !data) {
      return null
    }

    pendingSummaryCache.set(brokerUserId, {
      data,
      fetchedAt: Date.now(),
    })

    return data
  })()

  pendingSummaryInflightRequests.set(brokerUserId, request)

  try {
    return await request
  } finally {
    pendingSummaryInflightRequests.delete(brokerUserId)
  }
}

export function usePendingProposalIndicator(options: {
  brokerUserId?: string | null
  enabled: boolean
}) {
  const { brokerUserId, enabled } = options
  const [hasPending, setHasPending] = useState(false)

  const load = useCallback(async () => {
    if (!enabled || !brokerUserId) {
      setHasPending(false)
      return
    }

    try {
      const data = await fetchPendingSummary(brokerUserId)

      if (!data) {
        return
      }

      setHasPending(data.hasPending)
    } catch {
      setHasPending(false)
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
    hasPending,
    reloadPendingIndicator: load,
  }
}
