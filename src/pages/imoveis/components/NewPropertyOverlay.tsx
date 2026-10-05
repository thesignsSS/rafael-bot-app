import { useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'
import { usePropertyPhotos } from '../hooks/usePropertyPhotos'
import type { Property } from '../types'
import { PropertyForm } from './PropertyForm'
import { PropertyPageHeader } from './PropertyPageHeader'

type Props = {
  /** Para quem pediu o cadastro: "proposta" ou "engenharia". */
  context: string
  onSaved: (property: Property) => void
  onClose: () => void
}

/**
 * Cadastro essencial (seção 8) sem sair da proposta ou da engenharia (13.2,
 * 14.1): abre por cima da tela e, ao salvar, devolve o imóvel já escolhido.
 */
export function NewPropertyOverlay({ context, onSaved, onClose }: Props) {
  const photos = usePropertyPhotos(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  const handleSaved = useCallback(
    async (property: Property) => {
      const failedPhotos = await photos.uploadPending(property.id)

      if (failedPhotos.length > 0) {
        toast.warning(
          `Imóvel ${property.referenceCode} cadastrado, mas ${failedPhotos.length === 1 ? '1 foto não foi enviada' : `${failedPhotos.length} fotos não foram enviadas`}. Envie de novo pelo cadastro do imóvel.`,
        )
      } else {
        toast.success(`Imóvel ${property.referenceCode} cadastrado e escolhido`)
      }

      onSaved(property)
    },
    [onSaved, photos],
  )

  return createPortal(
    <div className="fixed inset-0 z-[85] overflow-y-auto bg-background px-4 py-6 sm:px-6" role="dialog" aria-modal="true" aria-label="Novo imóvel">
      <div className="mx-auto max-w-4xl">
        <PropertyPageHeader
          title="Novo imóvel"
          description={`Cadastre só o essencial (tipo, valor e endereço). Ao salvar, você volta para a ${context} com o imóvel escolhido.`}
          onBack={onClose}
        />
        <PropertyForm property={null} photos={photos} onSaved={handleSaved} onCancel={onClose} />
      </div>
    </div>,
    document.body,
  )
}
