import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/auth-context'

const formSubmissionApiUrl = import.meta.env.VITE_FORM_SUBMISSION_API_URL
const formSubmissionApiKey = import.meta.env.VITE_FORM_SUBMISSION_API_KEY

export type WhatsAppConnectionStatus = 'waiting_qr' | 'connected' | 'disconnected'

function getAdminApiUrl(path: string) {
  if (!formSubmissionApiUrl) {
    throw new Error('URL de envio do formulário não configurada.')
  }

  return formSubmissionApiUrl.replace(/\/form-submissions\/?$/, path)
}

function getAdminApiHeaders() {
  if (!formSubmissionApiKey) {
    throw new Error('Chave de API de envio do formulário não configurada.')
  }

  return {
    Authorization: `Bearer ${formSubmissionApiKey}`,
  }
}

export function useWhatsAppConnectionStatus(enabled = true) {
  const { session, isAdmin, currentUserProfile } = useAuth()
  const [connectionStatus, setConnectionStatus] = useState<WhatsAppConnectionStatus | null>(null)

  useEffect(() => {
    if (!enabled || !session || !isAdmin || !currentUserProfile?.id) {
      setConnectionStatus(null)
      return
    }

    let isMounted = true
    const currentUserId = currentUserProfile.id

    async function loadWhatsAppState() {
      try {
        const url = new URL(getAdminApiUrl('/admin/whatsapp/state'))
        url.searchParams.set('userId', currentUserId)

        const response = await fetch(url.toString(), {
          headers: getAdminApiHeaders(),
        })
        const data = (await response.json().catch(() => null)) as
          | { ok: true; connectionStatus: WhatsAppConnectionStatus }
          | { ok: false; error: string }
          | null

        if (!response.ok || !data || ('ok' in data && data.ok === false)) {
          return
        }

        if (!isMounted) {
          return
        }

        setConnectionStatus(data.connectionStatus)
      } catch {
        if (isMounted) {
          setConnectionStatus(null)
        }
      }
    }

    void loadWhatsAppState()
    const intervalId = window.setInterval(() => {
      void loadWhatsAppState()
    }, 10000)

    return () => {
      isMounted = false
      window.clearInterval(intervalId)
    }
  }, [currentUserProfile?.id, enabled, isAdmin, session])

  return connectionStatus
}
