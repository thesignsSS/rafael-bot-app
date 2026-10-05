import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Modal } from '../../../components/ui/Modal'
import { PropertyApiError, changeStatus, deleteProperty, fetchLifecycle, type LifecycleOptions } from '../lib/propertiesApi'
import type { Property } from '../types'
import { TransferModal } from './TransferModal'

type Props = {
  property: Property
  onChanged: (property?: Property) => void
}

type Dialog = 'delete' | 'inactivate' | 'transfer' | null

/** Seção 15 no detalhe: Excluir (só sem histórico) ou Inativar, e Transferir para o ADM. */
export function PropertyActionsCard({ property, onChanged }: Props) {
  const navigate = useNavigate()
  const [options, setOptions] = useState<LifecycleOptions | null>(null)
  const [dialog, setDialog] = useState<Dialog>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    fetchLifecycle(property.id)
      .then(setOptions)
      .catch(() => setOptions(null))
  }, [property.id, property.status, property.responsibleBrokerId])

  if (!options || (!options.canDelete && !options.canInactivate && !options.canTransfer)) {
    return null
  }

  const address = `${property.address.street}${property.address.number ? `, ${property.address.number}` : ''}`

  const run = async (action: () => Promise<void>) => {
    setBusy(true)
    try {
      await action()
    } catch (error) {
      toast.error(error instanceof PropertyApiError ? error.message : 'Não foi possível concluir. Tente de novo.')
    } finally {
      setBusy(false)
      setDialog(null)
    }
  }

  return (
    <section className="rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-sm">
      <h2 className="mb-3 text-headline-md font-bold text-on-surface">Mais ações</h2>
      <div className="space-y-2">
        {options.canTransfer ? (
          <ActionButton onClick={() => setDialog('transfer')}>Transferir para outro corretor</ActionButton>
        ) : null}
        {options.canDelete ? (
          <ActionButton danger onClick={() => setDialog('delete')}>
            Excluir imóvel
          </ActionButton>
        ) : null}
        {options.canInactivate ? (
          <>
            <ActionButton onClick={() => setDialog('inactivate')}>Inativar imóvel</ActionButton>
            {/* 15.2: com histórico, explica por que não há Excluir. */}
            <p className="text-body-sm text-on-surface-variant">Este imóvel tem histórico e não pode ser excluído.</p>
          </>
        ) : null}
      </div>

      {dialog === 'delete' ? (
        <Modal titleId="excluir-imovel" title="Excluir este imóvel?" onClose={() => setDialog(null)}>
          <p className="text-body-md text-on-surface">
            {address} · {property.referenceCode}
          </p>
          <p className="mt-2 text-body-md text-on-surface-variant">A exclusão é definitiva: o cadastro e as fotos saem do sistema.</p>
          <DialogButtons
            busy={busy}
            confirmLabel="Excluir imóvel"
            danger
            onCancel={() => setDialog(null)}
            onConfirm={() =>
              run(async () => {
                await deleteProperty(property.id)
                toast.success('Imóvel excluído')
                navigate('/imoveis', { replace: true })
              })
            }
          />
        </Modal>
      ) : null}

      {dialog === 'inactivate' ? (
        <Modal titleId="inativar-imovel" title="Inativar este imóvel?" onClose={() => setDialog(null)}>
          <p className="text-body-md text-on-surface">
            O imóvel não entra em novas propostas nem engenharias e não pode ser anunciado. Ele continua na lista pelo filtro de
            situação e pode ser reativado depois.
          </p>
          {options.activeProposals > 0 ? (
            // 15.4: as propostas ativas continuam.
            <p className="mt-2 rounded-lg bg-amber-50 p-3 text-body-md text-amber-800">
              {options.activeProposals === 1 ? 'Há 1 proposta ativa' : `Há ${options.activeProposals} propostas ativas`} com este
              imóvel. {options.activeProposals === 1 ? 'Ela continua' : 'Elas continuam'} normalmente.
            </p>
          ) : null}
          <DialogButtons
            busy={busy}
            confirmLabel="Inativar imóvel"
            onCancel={() => setDialog(null)}
            onConfirm={() =>
              run(async () => {
                const updated = await changeStatus(property.id, 'inativo')
                toast.success('Imóvel inativado')
                onChanged(updated)
              })
            }
          />
        </Modal>
      ) : null}

      {dialog === 'transfer' ? (
        <TransferModal
          propertyIds={[property.id]}
          currentResponsibleId={property.responsibleBrokerId}
          onClose={() => setDialog(null)}
          onDone={() => {
            toast.success('Imóvel transferido')
            setDialog(null)
            onChanged()
          }}
        />
      ) : null}
    </section>
  )
}

function ActionButton({ children, onClick, danger = false }: { children: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-11 w-full items-center justify-center rounded-lg border px-4 text-sm font-semibold ${
        danger ? 'border-error/40 text-error hover:bg-error/5' : 'border-outline-variant text-on-surface hover:border-primary'
      }`}
    >
      {children}
    </button>
  )
}

function DialogButtons({
  busy,
  confirmLabel,
  danger = false,
  onCancel,
  onConfirm,
}: {
  busy: boolean
  confirmLabel: string
  danger?: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className="mt-6 flex justify-end gap-2">
      <button type="button" onClick={onCancel} className="h-10 rounded-lg border border-outline-variant px-4 text-sm font-semibold text-on-surface">
        Cancelar
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={onConfirm}
        className={`h-10 rounded-lg px-4 text-sm font-semibold disabled:opacity-60 ${danger ? 'bg-error text-on-error' : 'bg-primary-container text-white'}`}
      >
        {confirmLabel}
      </button>
    </div>
  )
}
