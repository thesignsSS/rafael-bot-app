import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  PropertyApiError,
  fetchProposalProperty,
  setProposalProperty,
  type ProposalPropertyView,
} from '../../imoveis/lib/propertiesApi'

/**
 * Imóvel cadastrado da proposta (BKL-093, seção 13). Nulo enquanto carrega ou
 * quando o usuário não tem acesso ao vínculo (ex.: convidado por link).
 */
export function useProposalProperty(proposalId: string | undefined, refreshKey?: string) {
  const [view, setView] = useState<ProposalPropertyView | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!proposalId) return

    let active = true
    fetchProposalProperty(proposalId)
      .then((result) => active && setView(result))
      .catch(() => active && setView(null))

    return () => {
      active = false
    }
  }, [proposalId, refreshKey])

  /** Vincula, troca ou remove (`null`). A situação do imóvel é recalculada no servidor. */
  const change = useCallback(
    async (propertyId: string | null) => {
      if (!proposalId) return false

      setIsSaving(true)
      try {
        setView(await setProposalProperty(proposalId, propertyId))
        toast.success(propertyId ? 'Imóvel da proposta atualizado' : 'Imóvel removido da proposta')
        return true
      } catch (error) {
        toast.error(
          error instanceof PropertyApiError
            ? (Object.values(error.fields)[0] ?? error.message)
            : 'Não foi possível alterar o imóvel. Tente de novo.',
        )
        return false
      } finally {
        setIsSaving(false)
      }
    },
    [proposalId],
  )

  return { view, isSaving, change }
}

export type ProposalPropertyController = ReturnType<typeof useProposalProperty>
