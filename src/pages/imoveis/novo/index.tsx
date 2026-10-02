import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { PropertyForm } from '../components/PropertyForm'
import { PropertyPageHeader } from '../components/PropertyPageHeader'
import type { Property } from '../types'

export default function NovoImovelPage() {
  const navigate = useNavigate()

  const handleSaved = useCallback(
    (property: Property) => {
      toast.success(`Imóvel ${property.referenceCode} cadastrado`)
      navigate(`/imoveis/${property.id}/editar`, { replace: true })
    },
    [navigate],
  )

  return (
    <div className="mx-auto max-w-4xl">
      <PropertyPageHeader
        title="Novo imóvel"
        description="Cadastre só o essencial agora (tipo, valor e endereço) e complete depois. O imóvel fica disponível para propostas e engenharias."
        onBack={() => navigate(-1)}
      />
      <PropertyForm property={null} onSaved={handleSaved} onCancel={() => navigate(-1)} />
    </div>
  )
}
