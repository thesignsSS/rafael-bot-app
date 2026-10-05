import { useState } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { PROPERTY_STATUS_OPTIONS } from '../lib/propertyStatus'
import type { PropertyStatus } from '../types'

/** Situações que o responsável escolhe à mão (10.4); o ADM escolhe qualquer uma. */
const RESPONSIBLE_CHOICES: PropertyStatus[] = ['disponivel', 'em_negociacao', 'reservado', 'inativo']

/** Vendido e Inativo pedem confirmação explicando o bloqueio (10.5). */
const BLOCKING: Partial<Record<PropertyStatus, string>> = {
  vendido: 'Com a situação Vendido, o imóvel não pode entrar em novas propostas nem engenharias.',
  inativo: 'Com a situação Inativo, o imóvel sai de circulação: não entra em novas propostas nem engenharias e não pode ser anunciado. Ele continua na lista pelo filtro de situação.',
}

type Props = {
  current: PropertyStatus
  isAdmin: boolean
  saving: boolean
  onConfirm: (status: PropertyStatus) => void
  onClose: () => void
}

export function ChangeStatusModal({ current, isAdmin, saving, onConfirm, onClose }: Props) {
  const [selected, setSelected] = useState<PropertyStatus>(current)
  const [confirming, setConfirming] = useState(false)
  const options = PROPERTY_STATUS_OPTIONS.filter((option) => isAdmin || RESPONSIBLE_CHOICES.includes(option.value))
  const warning = BLOCKING[selected]

  const handleSave = () => {
    if (warning && !confirming) {
      setConfirming(true)
      return
    }

    onConfirm(selected)
  }

  return (
    <Modal titleId="alterar-situacao" title={confirming ? 'Confirmar mudança de situação' : 'Alterar situação'} onClose={onClose}>
      {confirming ? (
        <p className="text-body-md text-on-surface">{warning}</p>
      ) : (
        <fieldset>
          <legend className="sr-only">Nova situação</legend>
          <div className="space-y-2" role="radiogroup">
            {options.map((option) => (
              <label
                key={option.value}
                className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 ${
                  selected === option.value ? 'border-primary bg-primary/5' : 'border-outline-variant'
                }`}
              >
                <input
                  type="radio"
                  name="situacao"
                  value={option.value}
                  checked={selected === option.value}
                  onChange={() => setSelected(option.value)}
                />
                <span className="text-label-md text-on-surface">{option.label}</span>
                {option.value === current ? <span className="text-body-sm text-on-surface-variant">(atual)</span> : null}
              </label>
            ))}
          </div>
          {!isAdmin ? (
            <p className="mt-3 text-body-sm text-on-surface-variant">
              Em proposta e Vendido mudam sozinhos conforme as propostas.
            </p>
          ) : null}
        </fieldset>
      )}

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
          disabled={saving || selected === current}
          onClick={handleSave}
          className="h-10 rounded-lg bg-primary-container px-4 text-sm font-semibold text-white disabled:opacity-60"
        >
          {confirming ? 'Confirmar' : 'Salvar situação'}
        </button>
      </div>
    </Modal>
  )
}
