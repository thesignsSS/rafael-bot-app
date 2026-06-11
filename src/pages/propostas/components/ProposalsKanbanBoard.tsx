import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { formatCreatedAt } from '../lib/proposalListUtils'
import type { ProposalListItem } from '../types/proposal-list-item'
import {
  type ProposalStatus,
  type ProposalStatusOption,
  normalizeProposalStatus,
} from '../types/proposal-status'

type ProposalsKanbanBoardProps = {
  items: ProposalListItem[]
  isEmpty: boolean
  isLoading?: boolean
  error?: string | null
  canMoveCards: boolean
  statusOptions: ProposalStatusOption[]
  movingProposalId?: string | null
  onSelectProposal: (proposalId: string) => void
  onMoveProposal: (proposalId: string, status: ProposalStatus) => void
}

const statusToneClassName: Record<ProposalStatus, string> = {
  em_analise: 'border-primary/30 bg-primary-fixed text-on-primary-fixed',
  pendente: 'border-amber-200 bg-amber-50 text-amber-800',
  condicionado: 'border-sky-200 bg-sky-50 text-sky-800',
  reprovado: 'border-error-container bg-error-container text-on-error-container',
  aprovado: 'border-emerald-200 bg-emerald-50 text-emerald-800',
}

export function ProposalsKanbanBoard({
  items,
  isEmpty,
  isLoading = false,
  error = null,
  canMoveCards,
  statusOptions,
  movingProposalId = null,
  onSelectProposal,
  onMoveProposal,
}: ProposalsKanbanBoardProps) {
  const [draggedProposalId, setDraggedProposalId] = useState<string | null>(null)
  const [dragOverStatus, setDragOverStatus] = useState<ProposalStatus | null>(null)
  const suppressNextClickRef = useRef(false)

  const handleProposalKeyDown = (
    event: KeyboardEvent<HTMLElement>,
    proposalId: string,
  ) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    event.preventDefault()
    onSelectProposal(proposalId)
  }

  const columns = useMemo(
    () =>
      statusOptions.map((statusOption) => ({
        status: statusOption.value,
        label: statusOption.label,
        items: items.filter(
          (proposal) =>
            normalizeProposalStatus(proposal.status) === statusOption.value,
        ),
      })),
    [items, statusOptions],
  )

  if (isLoading) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center text-body-md text-on-surface-variant shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
        Carregando propostas...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center text-body-md text-error shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
        {error}
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center text-body-md text-on-surface-variant shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
        Nenhuma proposta encontrada para esta busca.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
      {columns.map((column) => {
        const isDropTarget = canMoveCards && dragOverStatus === column.status

        return (
          <section
            key={column.status}
            onDragOver={(event) => {
              if (!canMoveCards) {
                return
              }

              event.preventDefault()
              setDragOverStatus(column.status)
            }}
            onDragLeave={() => {
              if (dragOverStatus === column.status) {
                setDragOverStatus(null)
              }
            }}
            onDrop={(event) => {
              event.preventDefault()
              setDragOverStatus(null)

              if (!canMoveCards) {
                return
              }

              const proposalId =
                event.dataTransfer.getData('text/plain') || draggedProposalId

              if (proposalId) {
                onMoveProposal(proposalId, column.status)
              }
            }}
            className={`min-h-[420px] rounded-xl border bg-surface-container-low p-3 transition-colors ${
              isDropTarget
                ? 'border-primary bg-primary-fixed/70'
                : 'border-outline-variant'
            }`}
          >
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-label-sm font-semibold ${statusToneClassName[column.status]}`}
                >
                  {column.items.length}
                </span>
                <h3 className="text-headline-md font-semibold text-on-surface">
                  {column.label}
                </h3>
              </div>

              {canMoveCards ? (
                <Icon name="drag_indicator" size={20} className="text-outline" />
              ) : null}
            </div>

            <div className="space-y-3">
              {column.items.length === 0 ? (
                <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest px-4 py-8 text-center text-body-sm text-on-surface-variant">
                  Sem propostas nesta coluna.
                </div>
              ) : (
                column.items.map((proposal) => {
                  const isMoving = movingProposalId === proposal.id

                  return (
                    <div
                      key={proposal.id}
                      role="button"
                      tabIndex={0}
                      draggable={canMoveCards && !isMoving}
                      onDragStart={(event) => {
                        if (!canMoveCards) {
                          return
                        }

                        suppressNextClickRef.current = true
                        setDraggedProposalId(proposal.id)
                        event.dataTransfer.effectAllowed = 'move'
                        event.dataTransfer.setData('text/plain', proposal.id)
                      }}
                      onDragEnd={() => {
                        setDraggedProposalId(null)
                        setDragOverStatus(null)
                        window.setTimeout(() => {
                          suppressNextClickRef.current = false
                        }, 0)
                      }}
                      onClick={() => {
                        if (suppressNextClickRef.current) {
                          return
                        }

                        onSelectProposal(proposal.id)
                      }}
                      onKeyDown={(event) =>
                        handleProposalKeyDown(event, proposal.id)
                      }
                      className={`w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-4 text-left shadow-[0px_1px_3px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                        canMoveCards ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
                      } ${isMoving ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-label-md font-semibold text-primary">
                            {proposal.proposalCode}
                          </p>
                          <p className="mt-1 truncate text-body-md font-semibold text-on-surface">
                            {proposal.clientName}
                          </p>
                        </div>
                        <span className="rounded-md bg-surface-container px-2 py-1 text-label-sm font-semibold text-on-surface-variant">
                          {proposal.documentsCount}
                        </span>
                      </div>

                      <dl className="mt-4 grid gap-2 text-body-sm">
                        <div className="flex items-center justify-between gap-3">
                          <dt className="text-on-surface-variant">Corretor</dt>
                          <dd className="truncate font-medium text-on-surface">
                            {proposal.brokerName}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <dt className="text-on-surface-variant">Imóvel</dt>
                          <dd className="font-medium text-on-surface">
                            {proposal.propertyType}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <dt className="text-on-surface-variant">Criada em</dt>
                          <dd className="font-medium text-on-surface">
                            {formatCreatedAt(proposal.createdAt)}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  )
                })
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
