import { formatCreatedAt } from '../lib/proposalListUtils'
import type { ProposalListItem } from '../types/proposal-list-item'
import {
  getProposalStatusLabel,
  normalizeProposalStatus,
  type ProposalStatus,
} from '../types/proposal-status'

type ProposalsTableProps = {
  items: ProposalListItem[]
  isEmpty: boolean
  isLoading?: boolean
  error?: string | null
  onSelectProposal: (proposalId: string) => void
}

export function ProposalsTable({
  items,
  isEmpty,
  isLoading = false,
  error = null,
  onSelectProposal,
}: ProposalsTableProps) {
  const columnCount = 7
  const statusClassName: Record<ProposalStatus, string> = {
    em_analise: 'border-primary/30 bg-primary-fixed/45 text-on-primary-fixed',
    pendente: 'border-amber-400/30 bg-amber-500/10 text-amber-300',
    condicionado: 'border-sky-400/30 bg-sky-500/10 text-sky-300',
    reprovado: 'border-error/30 bg-error/10 text-error',
    aprovado: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-400',
    validacao_renda: 'border-violet-400/30 bg-violet-500/10 text-violet-300',
    renda_validada: 'border-lime-400/30 bg-lime-500/10 text-lime-300',
    renda_nao_validada: 'border-rose-400/30 bg-rose-500/10 text-rose-300',
    engenharia: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-300',
    formularios: 'border-indigo-400/30 bg-indigo-500/10 text-indigo-300',
    aguardando_reserva: 'border-orange-400/30 bg-orange-500/10 text-orange-300',
    conformidade: 'border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-300',
    agendamento_agencia: 'border-teal-400/30 bg-teal-500/10 text-teal-300',
    itbi: 'border-yellow-400/30 bg-yellow-500/10 text-yellow-300',
    assinatura_contrato: 'border-purple-400/30 bg-purple-500/10 text-purple-300',
    registro: 'border-slate-400/30 bg-slate-500/10 text-slate-300',
    finalizado: 'border-green-400/30 bg-green-500/10 text-green-300',
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-outline-variant bg-surface-container-low">
            <th className="px-6 py-4 text-label-md font-semibold text-on-surface">
              ID da Proposta
            </th>
            <th className="px-6 py-4 text-label-md font-semibold text-on-surface">
              Corretor
            </th>
            <th className="px-6 py-4 text-label-md font-semibold text-on-surface">
              Nome do Cliente
            </th>
            <th className="px-6 py-4 text-label-md font-semibold text-on-surface">
              Tipo de Imóvel
            </th>
            <th className="px-6 py-4 text-label-md font-semibold text-on-surface">
              Situação
            </th>
            <th className="px-6 py-4 text-label-md font-semibold text-on-surface">
              Data de Criação
            </th>
            <th className="px-6 py-4 text-label-md font-semibold text-on-surface">
              Documentos
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {isLoading ? (
            <tr>
              <td
                colSpan={columnCount}
                className="px-6 py-12 text-center text-body-md text-on-surface-variant"
              >
                Carregando propostas...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td
                colSpan={columnCount}
                className="px-6 py-12 text-center text-body-md text-error"
              >
                {error}
              </td>
            </tr>
          ) : isEmpty ? (
            <tr>
              <td
                colSpan={columnCount}
                className="px-6 py-12 text-center text-body-md text-on-surface-variant"
              >
                Nenhuma proposta encontrada para esta busca.
              </td>
            </tr>
          ) : (
            items.map((proposal) => {
              const normalizedStatus = normalizeProposalStatus(proposal.status)

              return (
                <tr
                  key={proposal.id}
                  onClick={() => onSelectProposal(proposal.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      onSelectProposal(proposal.id)
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  className="cursor-pointer transition-colors hover:bg-surface-container focus-visible:bg-surface-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
                >
                  <td className="px-6 py-4 text-body-md font-medium text-primary">
                    {proposal.proposalCode}
                  </td>
                  <td className="px-6 py-4 text-body-md text-on-surface">
                    {proposal.isSharedWithCurrentUser
                      ? `${proposal.ownerName} (compartilhada)`
                      : proposal.brokerName}
                  </td>
                  <td className="px-6 py-4 text-body-md text-on-surface">
                    {proposal.clientName}
                  </td>
                  <td className="px-6 py-4 text-body-md text-on-surface">
                    {proposal.propertyType}
                  </td>
                  <td className="px-6 py-4 text-body-md">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusClassName[normalizedStatus]}`}
                    >
                      {getProposalStatusLabel(normalizedStatus)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-body-md text-on-surface-variant">
                    {formatCreatedAt(proposal.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-body-md text-on-surface-variant">
                    {proposal.documentsCount}
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
