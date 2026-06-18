import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
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
  highlightOwnedPendingCards?: boolean
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
  highlightOwnedPendingCards = false,
  statusOptions,
  movingProposalId = null,
  onSelectProposal,
  onMoveProposal,
}: ProposalsKanbanBoardProps) {
  const [draggedProposalId, setDraggedProposalId] = useState<string | null>(null)
  const [dragOverStatus, setDragOverStatus] = useState<ProposalStatus | null>(null)
  const [visibleHoverProposalId, setVisibleHoverProposalId] = useState<string | null>(
    null,
  )
  const [isHoverCardVisible, setIsHoverCardVisible] = useState(false)
  const suppressNextClickRef = useRef(false)
  const hoverOpenTimeoutRef = useRef<number | null>(null)
  const hoverCloseTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (hoverOpenTimeoutRef.current !== null) {
        window.clearTimeout(hoverOpenTimeoutRef.current)
      }

      if (hoverCloseTimeoutRef.current !== null) {
        window.clearTimeout(hoverCloseTimeoutRef.current)
      }
    }
  }, [])

  const clearHoverTimers = () => {
    if (hoverOpenTimeoutRef.current !== null) {
      window.clearTimeout(hoverOpenTimeoutRef.current)
      hoverOpenTimeoutRef.current = null
    }

    if (hoverCloseTimeoutRef.current !== null) {
      window.clearTimeout(hoverCloseTimeoutRef.current)
      hoverCloseTimeoutRef.current = null
    }
  }

  const handleProposalMouseEnter = (proposalId: string) => {
    clearHoverTimers()

    hoverOpenTimeoutRef.current = window.setTimeout(() => {
      setVisibleHoverProposalId(proposalId)
      setIsHoverCardVisible(true)
    }, 600)
  }

  const handleProposalMouseLeave = (proposalId: string) => {
    clearHoverTimers()
    setIsHoverCardVisible(false)

    if (visibleHoverProposalId !== proposalId) {
      return
    }

    hoverCloseTimeoutRef.current = window.setTimeout(() => {
      setVisibleHoverProposalId((currentProposalId) =>
        currentProposalId === proposalId ? null : currentProposalId,
      )
    }, 180)
  }

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
            className={`min-w-0 min-h-[420px] rounded-xl border bg-surface-container-low p-3 transition-colors ${
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
                  const isPendingOwnedHighlight =
                    highlightOwnedPendingCards &&
                    normalizeProposalStatus(proposal.status) === 'pendente'
                  const isSharedProposal = proposal.isSharedWithCurrentUser
                  const isHoverCardOpen =
                    visibleHoverProposalId === proposal.id && isHoverCardVisible

                  return (
                    <div
                      key={proposal.id}
                      className="relative min-w-0"
                      onMouseEnter={() => handleProposalMouseEnter(proposal.id)}
                      onMouseLeave={() => handleProposalMouseLeave(proposal.id)}
                    >
                      <div
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
                        className={`w-full min-w-0 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest p-4 text-left shadow-[0px_1px_3px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                          canMoveCards
                            ? 'cursor-grab active:cursor-grabbing'
                            : 'cursor-pointer'
                        } ${isMoving ? 'opacity-60' : ''} ${
                          isPendingOwnedHighlight
                            ? 'border-amber-300 bg-amber-50/80 shadow-[0px_8px_24px_rgba(245,158,11,0.16)] animate-pending-card-glow'
                            : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-label-md font-semibold text-primary">
                              {proposal.proposalCode}
                            </p>
                            {isSharedProposal ? (
                              <span
                                className="mt-1 inline-flex max-w-full items-center rounded-full border border-primary/20 bg-primary-fixed/60 px-2 py-0.5 text-[11px] font-semibold text-on-primary-fixed"
                                title={`Compartilhada por ${proposal.ownerName}`}
                              >
                                <span className="shrink-0">Compart.:</span>
                                <span className="ml-1 truncate">{proposal.ownerName}</span>
                              </span>
                            ) : null}
                            <p
                              className="mt-2 truncate text-body-md font-semibold text-on-surface"
                              title={proposal.clientName}
                            >
                              {proposal.clientName}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-md bg-surface-container px-2 py-1 text-label-sm font-semibold text-on-surface-variant">
                            {proposal.documentsCount}
                          </span>
                        </div>

                        <dl className="mt-4 grid gap-3 text-body-sm">
                          <div className="min-w-0">
                            <dt className="text-on-surface-variant">Corretor</dt>
                            <dd
                              className="truncate font-medium text-on-surface"
                              title={isSharedProposal ? proposal.ownerName : proposal.brokerName}
                            >
                              {isSharedProposal ? proposal.ownerName : proposal.brokerName}
                            </dd>
                          </div>
                          <div className="min-w-0">
                            <dt className="text-on-surface-variant">Imóvel</dt>
                            <dd
                              className="truncate font-medium text-on-surface"
                              title={proposal.propertyType}
                            >
                              {proposal.propertyType}
                            </dd>
                          </div>
                          <div className="min-w-0">
                            <dt className="text-on-surface-variant">Criada em</dt>
                            <dd className="truncate font-medium text-on-surface">
                              {formatCreatedAt(proposal.createdAt)}
                            </dd>
                          </div>
                        </dl>
                      </div>

                      {visibleHoverProposalId === proposal.id ? (
                        <div
                          aria-hidden={!isHoverCardOpen}
                          className={`pointer-events-none absolute left-1/2 top-full z-20 mt-3 w-[min(22rem,calc(100vw-3rem))] -translate-x-1/2 rounded-2xl border border-outline-variant bg-surface-container-lowest/95 p-4 text-left shadow-[0px_20px_40px_rgba(15,23,42,0.16)] backdrop-blur-sm transition-all duration-200 ${
                            isHoverCardOpen
                              ? 'translate-y-0 opacity-100'
                              : 'translate-y-2 opacity-0'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-label-md font-semibold text-primary">
                                {proposal.proposalCode}
                              </p>
                              {isSharedProposal ? (
                                <p
                                  className="mt-2 truncate text-body-sm text-primary"
                                  title={`Compartilhada por ${proposal.ownerName}`}
                                >
                                  Compart.: {proposal.ownerName}
                                </p>
                              ) : null}
                              <p className="mt-1 break-words text-body-md font-semibold text-on-surface">
                                {proposal.clientName}
                              </p>
                            </div>
                            <span className="shrink-0 rounded-full bg-surface-container px-2.5 py-1 text-label-sm font-semibold text-on-surface-variant">
                              {proposal.documentsCount} docs
                            </span>
                          </div>

                          <dl className="mt-4 grid gap-3 text-body-sm">
                            <div className="grid gap-1">
                              <dt className="text-on-surface-variant">Corretor</dt>
                              <dd className="break-words font-medium text-on-surface">
                                {isSharedProposal ? proposal.ownerName : proposal.brokerName}
                              </dd>
                            </div>
                            <div className="grid gap-1">
                              <dt className="text-on-surface-variant">Tipo do imóvel</dt>
                              <dd className="break-words font-medium text-on-surface">
                                {proposal.propertyType}
                              </dd>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="grid gap-1">
                                <dt className="text-on-surface-variant">Status</dt>
                                <dd className="font-medium text-on-surface">
                                  {
                                    statusOptions.find(
                                      (statusOption) =>
                                        statusOption.value ===
                                        normalizeProposalStatus(proposal.status),
                                    )?.label
                                  }
                                </dd>
                              </div>
                              <div className="grid gap-1">
                                <dt className="text-on-surface-variant">Criada em</dt>
                                <dd className="font-medium text-on-surface">
                                  {formatCreatedAt(proposal.createdAt)}
                                </dd>
                              </div>
                            </div>
                          </dl>
                        </div>
                      ) : null}
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
