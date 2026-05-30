import {
  formatCreatedAt,
  formatProposalId,
} from '../lib/proposalListUtils'
import type { ProposalListItem } from '../types/proposal-list-item'

type ProposalsTableProps = {
  items: ProposalListItem[]
  isEmpty: boolean
}

export function ProposalsTable({ items, isEmpty }: ProposalsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-outline-variant bg-surface-container-low">
            <th className="px-6 py-4 text-label-md font-semibold text-on-surface">
              ID da Proposta
            </th>
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
                colSpan={4}
                className="px-6 py-12 text-center text-body-md text-on-surface-variant"
              >
                Nenhuma proposta encontrada para esta busca.
              </td>
            </tr>
          ) : (
            items.map((proposal) => (
              <tr
                key={proposal.id}
                className="group transition-colors hover:bg-surface-container"
              >
                <td className="px-6 py-4 text-body-md font-medium text-primary transition-transform group-hover:translate-x-0.5">
                  {formatProposalId(proposal.id)}
                </td>
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
