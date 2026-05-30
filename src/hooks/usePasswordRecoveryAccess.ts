import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { EmailOtpType } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export type RecoveryAccessStatus = 'checking' | 'allowed' | 'denied'

const RECOVERY_SESSION_KEY = 'rafael-bot-password-recovery'

function parseHashParams(): URLSearchParams {
  const raw = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash
  return new URLSearchParams(raw)
}

function parseRecoveryQuery(): { token_hash: string; type: EmailOtpType } | null {
  const params = new URLSearchParams(window.location.search)
  const token_hash = params.get('token_hash')
  if (token_hash && params.get('type') === 'recovery') {
    return { token_hash, type: 'recovery' }
  }
  return null
}

function stripRecoveryParamsFromUrl() {
  const url = new URL(window.location.href)
  url.hash = ''
  url.searchParams.delete('token_hash')
  url.searchParams.delete('type')
  const next = url.pathname + (url.search ? url.search : '')
  window.history.replaceState(window.history.state, '', next)
}

export function clearPasswordRecoveryFlag() {
  sessionStorage.removeItem(RECOVERY_SESSION_KEY)
}

type EstablishRecoveryResult = 'ok' | 'invalid' | 'none'

async function establishRecoverySession(): Promise<EstablishRecoveryResult> {
  const queryRecovery = parseRecoveryQuery()

  if (queryRecovery) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: queryRecovery.token_hash,
      type: queryRecovery.type,
    })
    return error ? 'invalid' : 'ok'
  }

  const hashParams = parseHashParams()

  if (hashParams.get('error')) {
    return 'invalid'
  }

  if (hashParams.get('type') === 'recovery') {
    const access_token = hashParams.get('access_token')
    const refresh_token = hashParams.get('refresh_token')

    if (access_token && refresh_token) {
      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      })
      return error ? 'invalid' : 'ok'
    }

    return 'invalid'
  }

  if (sessionStorage.getItem(RECOVERY_SESSION_KEY) === '1') {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session) return 'ok'
    clearPasswordRecoveryFlag()
  }

  return 'none'
}

export function usePasswordRecoveryAccess(): RecoveryAccessStatus {
  const navigate = useNavigate()
  const [status, setStatus] = useState<RecoveryAccessStatus>('checking')
  const resolvedRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    const allow = () => {
      if (cancelled || resolvedRef.current) return
      resolvedRef.current = true
      sessionStorage.setItem(RECOVERY_SESSION_KEY, '1')
      stripRecoveryParamsFromUrl()
      setStatus('allowed')
    }

    const deny = async () => {
      if (cancelled || resolvedRef.current) return
      resolvedRef.current = true
      clearPasswordRecoveryFlag()
      await supabase.auth.signOut()
      if (cancelled) return
      setStatus('denied')
      toast.error('Link inválido ou expirado. Solicite um novo.')
      navigate('/recuperar-senha', { replace: true })
    }

    async function verifyAccess() {
      const result = await establishRecoverySession()
      if (cancelled) return

      if (result === 'ok') {
        allow()
        return
      }

      await deny()
    }

    void verifyAccess()

    return () => {
      cancelled = true
    }
  }, [navigate])

  return status
}
