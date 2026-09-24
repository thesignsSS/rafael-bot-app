import { useEffect, useState } from 'react'
import { obterSlugAtual } from '../lib/tenant'

const API_URL = import.meta.env.VITE_CORE_API_URL as string | undefined

export type Empresa = {
  slug: string
  nome: string
  logoUrl: string | null
  /** `true` durante o trial também — quem está em teste usa o sistema. */
  ativa: boolean
  emTrial: boolean
  /** ISO. Nulo fora do trial. */
  trialExpiraEm: string | null
}

type EstadoTenant =
  | { status: 'sem-empresa' }
  | { status: 'carregando' }
  | { status: 'encontrada'; empresa: Empresa }
  | { status: 'nao-encontrada' }
  | { status: 'erro' }

/**
 * Resolve a empresa dona do subdomínio atual. Em `dev.effectuscb.com` (ou
 * localhost) não há subdomínio de empresa, e o hook devolve `sem-empresa` sem
 * chamar a API — é o caso do ambiente interno de hoje, de single-tenant.
 */
export function useTenant(): EstadoTenant {
  const [estado, setEstado] = useState<EstadoTenant>(() =>
    obterSlugAtual() ? { status: 'carregando' } : { status: 'sem-empresa' },
  )

  useEffect(() => {
    const slug = obterSlugAtual()
    if (!slug) return

    if (!API_URL) {
      console.error(
        'VITE_CORE_API_URL não configurada — não é possível resolver a empresa do subdomínio.',
      )
      setEstado({ status: 'erro' })
      return
    }

    const controle = new AbortController()

    fetch(`${API_URL}/empresas/${slug}`, { signal: controle.signal })
      .then(async (resposta) => {
        if (resposta.status === 404) {
          setEstado({ status: 'nao-encontrada' })
          return
        }

        if (!resposta.ok) {
          throw new Error(`API respondeu ${resposta.status}`)
        }

        setEstado({ status: 'encontrada', empresa: await resposta.json() })
      })
      .catch((erro: unknown) => {
        if (erro instanceof Error && erro.name === 'AbortError') return
        setEstado({ status: 'erro' })
      })

    return () => controle.abort()
  }, [])

  return estado
}
