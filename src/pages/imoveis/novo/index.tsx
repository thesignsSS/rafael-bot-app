import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { PropertyForm } from '../components/PropertyForm'
import { PropertyPageHeader } from '../components/PropertyPageHeader'
import { usePropertyPhotos } from '../hooks/usePropertyPhotos'
import type { Property } from '../types'

export type EditPropertyLocationState = { failedPhotos?: File[] }

export default function NovoImovelPage() {
  const navigate = useNavigate()
  // Fotos escolhidas antes de salvar ficam guardadas e sobem depois (11.13).
  const photos = usePropertyPhotos(null)

  const handleSaved = useCallback(
    async (property: Property) => {
      const failedPhotos = await photos.uploadPending(property.id)

      if (failedPhotos.length > 0) {
        toast.warning(
          `Imóvel ${property.referenceCode} cadastrado, mas ${failedPhotos.length === 1 ? '1 foto não foi enviada' : `${failedPhotos.length} fotos não foram enviadas`}. Tente de novo abaixo.`,
        )
      } else {
        toast.success(`Imóvel ${property.referenceCode} cadastrado`)
      }

      const state: EditPropertyLocationState = { failedPhotos }
      navigate(`/imoveis/${property.id}/editar`, { replace: true, state })
    },
    [navigate, photos],
  )

  return (
    <div className="mx-auto max-w-4xl">
      <PropertyPageHeader
        title="Novo imóvel"
        description="Cadastre só o essencial agora (tipo, valor e endereço) e complete depois. O imóvel fica disponível para propostas e engenharias."
        onBack={() => navigate(-1)}
      />
      <PropertyForm property={null} photos={photos} onSaved={handleSaved} onCancel={() => navigate(-1)} />
    </div>
  )
}
