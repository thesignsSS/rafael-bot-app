import { useCallback, useEffect, useState } from 'react'
import { buscarMinhaAssinatura, type MinhaAssinatura } from '../lib/assinatura'
import { obterSlugAtual } from '../lib/tenant'

type Estado =
  | { status: 'indisponivel' }
  | { status: 'carregando' }
  | { status: 'carregada'; assinatura: MinhaAssinatura }
  | { status: 'erro' }

/**
 * Situação da assinatura da empresa de quem está logado.
 *
 * Só consulta em subdomínio de empresa: nos domínios internos (localhost,
 * dev.effectuscb.com) não há tenant, e chamar a API ali só geraria erro no
 * console de quem está desenvolvendo.
 */
export function useAssinatura(): Estado & { recarregar: () => void } {
  const [estado, setEstado] = useState<Estado>(() =>
    obterSlugAtual() ? { status: 'carregando' } : { status: 'indisponivel' },
  )

  const carregar = useCallback(() => {
    if (!obterSlugAtual()) return

    setEstado({ status: 'carregando' })

    buscarMinhaAssinatura()
      .then((assinatura) => setEstado({ status: 'carregada', assinatura }))
      .catch(() => setEstado({ status: 'erro' }))
  }, [])

  useEffect(carregar, [carregar])

  return { ...estado, recarregar: carregar }
}
