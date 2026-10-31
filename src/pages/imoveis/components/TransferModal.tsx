import { useEffect, useState } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { PropertyApiError, fetchBrokers, transferProperties } from '../lib/propertiesApi'
import type { Broker } from '../types'

type Props = {
  propertyIds: string[]
  /** Responsável atual, quando é um imóvel só: não aparece como destino. */
  currentResponsibleId?: string
  onDone: (transferred: number) => void
  onClose: () => void
}

/**
 * 15.7 e 15.8: só o ADM, um ou vários imóveis, para outro corretor ativo
 * da mesma empresa. A situação não muda e as propostas mantêm seus corretores.
 */
export function TransferModal({ propertyIds, currentResponsibleId, onDone, onClose }: Props) {
  const [brokers, setBrokers] = useState<Broker[]>([])
  const [target, setTarget] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    fetchBrokers()
      .then((items) => setBrokers(items.filter((broker) => broker.id !== currentResponsibleId)))
      .catch(() => setError('Não foi possível carregar os corretores. Tente de novo.'))
  }, [currentResponsibleId])

  const targetName = brokers.find((broker) => broker.id === target)?.fullName ?? 'o corretor escolhido'
  const count = propertyIds.length

  const submit = async () => {
    setSaving(true)
    setError(null)

    try {
      const result = await transferProperties(propertyIds, target)
      onDone(result.transferred)
    } catch (caught) {
      setError(
        caught instanceof PropertyApiError ? (Object.values(caught.fields)[0] ?? caught.message) : 'Não foi possível transferir. Tente de novo.',
      )
      setConfirming(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal titleId="transferir-imoveis" title={count === 1 ? 'Transferir imóvel' : `Transferir ${count} imóveis`} onClose={onClose}>
      {confirming ? (
        <p className="text-body-md text-on-surface">
          {count === 1 ? 'O imóvel passa' : `Os ${count} imóveis passam`} para {targetName}, que vira o responsável e passa a ver
          os vendedores. Quem era responsável deixa de editar e anunciar. A situação não muda e as propostas existentes mantêm
          seus corretores.
        </p>
      ) : (
        <label className="block">
          <span className="mb-1 block text-label-md font-semibold text-on-surface">Corretor de destino</span>
          <select value={target} onChange={(event) => setTarget(event.target.value)} className="proposal-input">
            <option value="">Escolha um corretor</option>
            {brokers.map((broker) => (
              <option key={broker.id} value={broker.id}>
                {broker.fullName ?? 'Sem nome'}
              </option>
            ))}
          </select>
        </label>
      )}

      {error ? (
        <p className="mt-3 text-body-sm text-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={confirming ? () => setConfirming(false) : onClose}
          className="h-10 rounded-lg border border-outline-variant px-4 text-sm font-semibold text-on-surface"
        >
          {confirming ? 'Voltar' : 'Cancelar'}
        </button>
        <button
          type="button"
          disabled={!target || saving}
          onClick={() => (confirming ? void submit() : setConfirming(true))}
          className="h-10 rounded-lg bg-primary-container px-4 text-sm font-semibold text-white disabled:opacity-60"
        >
          {confirming ? 'Confirmar transferência' : 'Continuar'}
        </button>
      </div>
    </Modal>
  )
}
