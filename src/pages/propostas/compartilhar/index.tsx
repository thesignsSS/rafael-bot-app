import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../../../contexts/auth-context'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import {
  acceptProposalShareLink,
  fetchProposalSharePreview,
} from '../lib/proposalsApi'
import { ProposalShareAcceptModal } from '../components/detail/ProposalShareAcceptModal'
import type { ProposalSharePreview } from '../types/proposal-detail'

export default function ProposalSharePage() {
  useDocumentTitle('Compartilhar proposta | Effectus')

  const navigate = useNavigate()
  const { shareToken } = useParams<{ shareToken: string }>()
  const { user } = useAuth()
  const brokerUserId = user?.id ?? null
  const [preview, setPreview] = useState<ProposalSharePreview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const goToList = useCallback(() => {
    navigate('/propostas', { replace: true })
  }, [navigate])

  useEffect(() => {
    async function loadPreview() {
      if (!shareToken || !brokerUserId) {
        setError('Link de compartilhamento inválido.')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        const result = await fetchProposalSharePreview(shareToken, brokerUserId)
        setPreview(result)
      } catch (requestError) {
        setPreview(null)
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Não foi possível validar o link de compartilhamento.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadPreview()
  }, [brokerUserId, shareToken])

  const handleConfirm = useCallback(async () => {
    if (!shareToken || !brokerUserId || !preview) {
      return
    }

    if (preview.isOwnedByCurrentUser || preview.isAlreadyAttached) {
      navigate(`/propostas/${preview.proposalId}`, { replace: true })
      return
    }

    try {
      setIsSubmitting(true)
      const result = await acceptProposalShareLink(shareToken, brokerUserId)
      toast.success(
        result.alreadyAttached
          ? 'Essa proposta já estava vinculada à sua conta.'
          : 'Proposta vinculada com sucesso.',
      )
      navigate(`/propostas/${result.proposalId}`, { replace: true })
    } catch (acceptError) {
      toast.error(
        acceptError instanceof Error
          ? acceptError.message
          : 'Não foi possível vincular a proposta.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }, [brokerUserId, navigate, preview, shareToken])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center text-body-md text-on-surface-variant shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
        Validando link de compartilhamento...
      </div>
    )
  }

  if (!preview || error) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
        <h2 className="text-headline-lg font-semibold text-on-surface">
          Link indisponível
        </h2>
        <p className="mt-2 text-body-md text-on-surface-variant">
          {error ?? 'Esse link não está mais disponível.'}
        </p>
        <button
          type="button"
          onClick={goToList}
          className="mt-6 rounded-lg bg-primary px-4 py-2 text-label-md font-semibold text-on-primary transition-all hover:bg-primary-container"
        >
          Ir para minhas propostas
        </button>
      </div>
    )
  }

  return (
    <>
      <ProposalShareAcceptModal
        isOpen
        preview={preview}
        isSubmitting={isSubmitting}
        onClose={goToList}
        onConfirm={() => void handleConfirm()}
      />

      <div className="mx-auto max-w-2xl rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center text-body-md text-on-surface-variant shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
        Revise o convite para vincular a proposta à sua conta.
      </div>
    </>
  )
}
