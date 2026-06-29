import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import { Icon } from '../../../components/ui/Icon'
import { getProfileAvatarUrl } from '../../../lib/profile-avatar'
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
  validacao_renda: 'border-violet-200 bg-violet-50 text-violet-800',
}

const KANBAN_INITIAL_VISIBLE_COUNT = 10
const TOP_SCROLLBAR_MIN_THUMB_WIDTH = 56

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
  const [showAllColumns, setShowAllColumns] = useState(false)
  const topScrollbarTrackRef = useRef<HTMLDivElement | null>(null)
  const bottomScrollbarRef = useRef<HTMLDivElement | null>(null)
  const boardContentRef = useRef<HTMLDivElement | null>(null)
  const [topScrollbarThumbWidth, setTopScrollbarThumbWidth] = useState(0)
  const [topScrollbarThumbOffset, setTopScrollbarThumbOffset] = useState(0)

  const columns = useMemo(
    () =>
      statusOptions.map((statusOption) => ({
        status: statusOption.value,
        label: statusOption.label,
        items: items
          .filter(
            (proposal) =>
              normalizeProposalStatus(proposal.status) === statusOption.value,
          )
          .sort(
            (left, right) =>
              new Date(right.createdAt).getTime() -
              new Date(left.createdAt).getTime(),
          ),
      })),
    [items, statusOptions],
  )

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

  useEffect(() => {
    const topScrollbarTrack = topScrollbarTrackRef.current
    const bottomScrollbar = bottomScrollbarRef.current
    const boardContent = boardContentRef.current

    if (!topScrollbarTrack || !bottomScrollbar || !boardContent) {
      return
    }

    const syncTopScrollbar = () => {
      const viewportWidth = bottomScrollbar.clientWidth
      const contentWidth = boardContent.scrollWidth
      const maxScrollLeft = Math.max(contentWidth - viewportWidth, 0)
      const trackWidth = topScrollbarTrack.clientWidth

      if (contentWidth <= 0 || viewportWidth <= 0 || trackWidth <= 0) {
        setTopScrollbarThumbWidth(0)
        setTopScrollbarThumbOffset(0)
        return
      }

      const nextThumbWidth =
        contentWidth <= viewportWidth
          ? trackWidth
          : Math.max(
              (viewportWidth / contentWidth) * trackWidth,
              TOP_SCROLLBAR_MIN_THUMB_WIDTH,
            )
      const maxThumbOffset = Math.max(trackWidth - nextThumbWidth, 0)
      const nextThumbOffset =
        maxScrollLeft === 0
          ? 0
          : (bottomScrollbar.scrollLeft / maxScrollLeft) * maxThumbOffset

      setTopScrollbarThumbWidth(nextThumbWidth)
      setTopScrollbarThumbOffset(nextThumbOffset)
    }

    const handleBottomScroll = () => {
      syncTopScrollbar()
    }

    syncTopScrollbar()

    const resizeObserver = new ResizeObserver(() => {
      syncTopScrollbar()
    })

    resizeObserver.observe(topScrollbarTrack)
    resizeObserver.observe(bottomScrollbar)
    resizeObserver.observe(boardContent)
    bottomScrollbar.addEventListener('scroll', handleBottomScroll)
    window.addEventListener('resize', syncTopScrollbar)

    return () => {
      resizeObserver.disconnect()
      bottomScrollbar.removeEventListener('scroll', handleBottomScroll)
      window.removeEventListener('resize', syncTopScrollbar)
    }
  }, [columns.length, showAllColumns])

  const handleTopScrollbarPointerDown = (
    event: ReactMouseEvent<HTMLDivElement>,
  ) => {
    const track = topScrollbarTrackRef.current
    const bottomScrollbar = bottomScrollbarRef.current
    const thumbWidth = topScrollbarThumbWidth

    if (!track || !bottomScrollbar || thumbWidth <= 0) {
      return
    }

    const trackRect = track.getBoundingClientRect()
    const maxThumbOffset = Math.max(trackRect.width - thumbWidth, 0)
    const maxScrollLeft = Math.max(
      boardContentRef.current
        ? boardContentRef.current.scrollWidth - bottomScrollbar.clientWidth
        : 0,
      0,
    )

    if (maxScrollLeft <= 0 || maxThumbOffset <= 0) {
      return
    }

    const pointerOffsetInsideThumb = event.clientX - trackRect.left - topScrollbarThumbOffset
    const startedFromThumb =
      pointerOffsetInsideThumb >= 0 && pointerOffsetInsideThumb <= thumbWidth

    const updateScrollFromClientX = (clientX: number) => {
      const nextThumbOffset = startedFromThumb
        ? clientX - trackRect.left - pointerOffsetInsideThumb
        : clientX - trackRect.left - thumbWidth / 2
      const clampedThumbOffset = Math.min(
        Math.max(nextThumbOffset, 0),
        maxThumbOffset,
      )
      const nextScrollLeft =
        (clampedThumbOffset / maxThumbOffset) * maxScrollLeft

      bottomScrollbar.scrollLeft = nextScrollLeft
    }

    updateScrollFromClientX(event.clientX)

    const handlePointerMove = (moveEvent: MouseEvent) => {
      updateScrollFromClientX(moveEvent.clientX)
    }

    const handlePointerUp = () => {
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('mouseup', handlePointerUp)
    }

    window.addEventListener('mousemove', handlePointerMove)
    window.addEventListener('mouseup', handlePointerUp)
  }

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
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-label-md font-semibold text-on-surface">
            Visualização do kanban
          </p>
          <p className="text-body-sm text-on-surface-variant">
            Exibindo {showAllColumns ? 'todas as propostas' : `${KANBAN_INITIAL_VISIBLE_COUNT} propostas por coluna`} em ordem de data, das mais recentes para as mais antigas.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAllColumns((currentValue) => !currentValue)}
          className="rounded-xl border border-outline-variant bg-surface-container-low px-4 py-2 text-label-md font-semibold text-on-surface transition-all hover:bg-surface-container"
        >
          {showAllColumns ? 'Mostrar só 15' : 'Listar todas'}
        </button>
      </div>

      <div
        ref={topScrollbarTrackRef}
        role="scrollbar"
        aria-label="Barra de rolagem superior do kanban"
        aria-controls="proposals-kanban-board"
        aria-orientation="horizontal"
        aria-valuemin={0}
        aria-valuenow={Math.round(topScrollbarThumbOffset)}
        className="relative h-2 cursor-pointer rounded-full bg-outline-variant/45"
        onMouseDown={handleTopScrollbarPointerDown}
      >
        <div
          className="absolute top-0 h-2 rounded-full bg-outline/55 transition-colors hover:bg-outline/75"
          style={{
            width: `${topScrollbarThumbWidth}px`,
            transform: `translateX(${topScrollbarThumbOffset}px)`,
          }}
        />
      </div>

      <div
        id="proposals-kanban-board"
        ref={bottomScrollbarRef}
        className="overflow-x-auto pb-2"
      >
        <div ref={boardContentRef} className="flex min-w-max gap-4">
      {columns.map((column) => {
        const isDropTarget = canMoveCards && dragOverStatus === column.status
        const visibleItems = showAllColumns
          ? column.items
          : column.items.slice(0, KANBAN_INITIAL_VISIBLE_COUNT)

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
            className={`min-h-[420px] w-[14.75rem] min-w-[14.75rem] rounded-xl border bg-surface-container-low p-3 transition-colors ${
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
                visibleItems.map((proposal) => {
                  const isMoving = movingProposalId === proposal.id
                  const isPendingOwnedHighlight =
                    highlightOwnedPendingCards &&
                    normalizeProposalStatus(proposal.status) === 'pendente'
                  const isSharedProposal = proposal.isSharedWithCurrentUser
                  const isHoverCardOpen =
                    visibleHoverProposalId === proposal.id && isHoverCardVisible
                  const ownerDisplayName = isSharedProposal
                    ? proposal.ownerName
                    : proposal.brokerName
                  const ownerAvatarUrl = getProfileAvatarUrl(proposal.ownerAvatarPath)
                  const ownerInitial = ownerDisplayName.trim().charAt(0).toUpperCase() || 'C'

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
                            <dd className="mt-1 flex items-center gap-2">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-outline-variant bg-surface-container-high text-[11px] font-semibold text-primary">
                                {ownerAvatarUrl ? (
                                  <img
                                    src={ownerAvatarUrl}
                                    alt={`Foto de ${ownerDisplayName}`}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  ownerInitial
                                )}
                              </span>
                              <span
                                className="truncate font-medium text-on-surface"
                                title={ownerDisplayName}
                              >
                                {ownerDisplayName}
                              </span>
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

              {!showAllColumns && column.items.length > KANBAN_INITIAL_VISIBLE_COUNT ? (
                <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest px-4 py-3 text-center text-body-sm text-on-surface-variant">
                  +{column.items.length - KANBAN_INITIAL_VISIBLE_COUNT} proposta(s) ocultas nesta coluna.
                </div>
              ) : null}
            </div>
          </section>
        )
      })}
        </div>
      </div>
    </div>
  )
}
