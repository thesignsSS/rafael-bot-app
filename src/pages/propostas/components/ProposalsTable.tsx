import {
  formatCreatedAt,
  formatProposalId,
} from '../lib/proposalListUtils'
import type { ProposalListItem } from '../types/proposal-list-item'

type ProposalsTableProps = {
  items: ProposalListItem[]
  isEmpty: boolean
  showOwnerColumn?: boolean
  onSelectProposal: (proposalId: string) => void
}

export function ProposalsTable({
  items,
  isEmpty,
  showOwnerColumn = false,
  onSelectProposal,
}: ProposalsTableProps) {
  const columnCount = showOwnerColumn ? 5 : 4
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-outline-variant bg-surface-container-low">
            <th className="px-6 py-4 text-label-md font-semibold text-on-surface">
              ID da Proposta
            </th>
            {showOwnerColumn ? (
              <th className="px-6 py-4 text-label-md font-semibold text-on-surface">
                Corretor
              </th>
            ) : null}
            <th className="px-6 py-4 text-label-md font-semibold text-on-surface">
              Nome do Cliente
            </th>
            <th className="px-6 py-4 text-label-md font-semibold text-on-surface">
              Tipo de Imóvel
            </th>
            <th className="px-6 py-4 text-label-md font-semibold text-on-surface">
              Data de Criação
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {isEmpty ? (
            <tr>
              <td
                colSpan={columnCount}
                className="px-6 py-12 text-center text-body-md text-on-surface-variant"
              >
                Nenhuma proposta encontrada para esta busca.
              </td>
            </tr>
          ) : (
            items.map((proposal) => (
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
                className="group cursor-pointer transition-colors hover:bg-surface-container focus-visible:bg-surface-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
              >
                <td className="px-6 py-4 text-body-md font-medium text-primary transition-transform group-hover:translate-x-0.5">
                  {formatProposalId(proposal.id)}
                </td>
                {showOwnerColumn ? (
                  <td className="px-6 py-4 text-body-md text-on-surface transition-transform group-hover:translate-x-0.5">
                    {proposal.ownerName}
                  </td>
                ) : null}
                <td className="px-6 py-4 text-body-md text-on-surface transition-transform group-hover:translate-x-0.5">
                  {proposal.clientName}
                </td>
                <td className="px-6 py-4 text-body-md text-on-surface transition-transform group-hover:translate-x-0.5">
                  {proposal.propertyType}
                </td>
                <td className="px-6 py-4 text-body-md text-on-surface-variant transition-transform group-hover:translate-x-0.5">
                  {formatCreatedAt(proposal.createdAt)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
