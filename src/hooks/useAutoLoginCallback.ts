import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '../lib/supabase'

export type AutoLoginStatus = 'processando' | 'redirecionando'

function parseHashParams(): URLSearchParams {
  const raw = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash
  return new URLSearchParams(raw)
}

function limparHashDaUrl() {
  const url = new URL(window.location.href)
  url.hash = ''
  window.history.replaceState(window.history.state, '', url.pathname + url.search)
}

/**
 * Estabelece a sessão a partir do access/refresh token recebidos por hash do
 * effectus-site (handoff pós-compra), na mesma linha do que
 * `usePasswordRecoveryAccess` já faz para o link de redefinição de senha.
 */
export function useAutoLoginCallback(): AutoLoginStatus {
  const navigate = useNavigate()
  const [status, setStatus] = useState<AutoLoginStatus>('processando')
  const resolvedRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    async function processar() {
      const params = parseHashParams()
      const access_token = params.get('access_token')
      const refresh_token = params.get('refresh_token')

      limparHashDaUrl()

      if (!access_token || !refresh_token) {
        if (cancelled || resolvedRef.current) return
        resolvedRef.current = true
        toast.error('Link de acesso inválido ou expirado.')
        navigate('/login', { replace: true })
        return
      }

      const { error } = await supabase.auth.setSession({ access_token, refresh_token })

      if (cancelled || resolvedRef.current) return
      resolvedRef.current = true

      if (error) {
        toast.error('Não foi possível iniciar sua sessão. Faça login novamente.')
        navigate('/login', { replace: true })
        return
      }

      setStatus('redirecionando')
      navigate('/', { replace: true })
    }

    void processar()

    return () => {
      cancelled = true
    }
  }, [navigate])

  return status
}
