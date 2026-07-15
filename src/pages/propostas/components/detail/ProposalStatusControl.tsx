import { useEffect, useState } from 'react'
import {
  normalizeProposalStatus,
  type ProposalStatus,
  type ProposalStatusOption,
  getProposalStatusLabel,
} from '../../types/proposal-status'

type ProposalStatusControlProps = {
  status: ProposalStatus
  statusOptions: ProposalStatusOption[]
  canChangeStatus: boolean
  isSaving: boolean
  onChangeStatus: (status: ProposalStatus) => Promise<boolean> | boolean
}

const statusClassName: Record<ProposalStatus, string> = {
  em_analise: 'border-primary/30 bg-primary-fixed text-on-primary-fixed',
  pendente: 'border-amber-200 bg-amber-50 text-amber-800',
  condicionado: 'border-sky-200 bg-sky-50 text-sky-800',
  reprovado: 'border-error-container bg-error-container text-on-error-container',
  aprovado: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  validacao_renda: 'border-violet-200 bg-violet-50 text-violet-800',
  renda_validada: 'border-lime-200 bg-lime-50 text-lime-800',
  renda_nao_validada: 'border-rose-200 bg-rose-50 text-rose-800',
  engenharia: 'border-cyan-200 bg-cyan-50 text-cyan-800',
  formularios: 'border-indigo-200 bg-indigo-50 text-indigo-800',
  conformidade: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800',
}

export function ProposalStatusControl({
  status,
  statusOptions,
  canChangeStatus,
  isSaving,
  onChangeStatus,
}: ProposalStatusControlProps) {
  const [selectedStatus, setSelectedStatus] = useState(status)

  useEffect(() => {
    setSelectedStatus(status)
  }, [status])

  const hasChanged = selectedStatus !== status

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-[0px_1px_3px_rgba(0,0,0,0.05)] sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-label-sm font-semibold uppercase text-on-surface-variant">
          Situação
        </p>
        <span
          className={`mt-2 inline-flex rounded-lg border px-3 py-1.5 text-label-md font-semibold ${statusClassName[status]}`}
        >
          {getProposalStatusLabel(status)}
        </span>
      </div>

      {canChangeStatus ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            value={selectedStatus}
            onChange={(event) =>
              setSelectedStatus(normalizeProposalStatus(event.target.value))
            }
            disabled={isSaving}
            className="h-10 rounded-lg border border-outline-variant bg-surface px-3 text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {statusOptions.map((proposalStatus) => (
              <option key={proposalStatus.value} value={proposalStatus.value}>
                {proposalStatus.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => onChangeStatus(normalizeProposalStatus(selectedStatus))}
            disabled={!hasChanged || isSaving}
            className="h-10 rounded-lg bg-primary px-4 text-label-md font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-95 disabled:cursor-not-allowed disabled:bg-outline-variant disabled:text-on-surface-variant disabled:active:scale-100"
          >
            {isSaving ? 'Alterando...' : 'Alterar situação'}
          </button>
        </div>
      ) : null}
    </div>
  )
}
