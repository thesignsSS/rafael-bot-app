import { useMemo, useState, type KeyboardEvent } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { formatCreatedAt, formatCurrencyBRL } from '../lib/engenhariaUtils'
import {
  ENGENHARIA_REQUEST_STATUS_OPTIONS,
  type EngenhariaRequestListItem,
  type EngenhariaRequestStatus,
} from '../types/engenhariaRequest'

type EngenhariaKanbanBoardProps = {
  items: EngenhariaRequestListItem[]
  isEmpty: boolean
  isLoading?: boolean
  error?: string | null
  canMoveCards: boolean
  isAdmin: boolean
  movingRequestId?: string | null
  onSelectRequest: (requestId: string) => void
  onMoveRequest: (requestId: string, status: EngenhariaRequestStatus) => void
}

const COLUMN_ICON: Record<EngenhariaRequestStatus, string> = {
  solicitar_engenharia: 'assignment',
  pendencia: 'pending_actions',
  boleto_enviado: 'receipt_long',
  ordem_servico: 'engineering',
  engenharia_concluida: 'check_circle',
}

const COLUMN_TONE_CLASS_NAME: Record<EngenhariaRequestStatus, string> = {
  solicitar_engenharia: 'border-sky-400/30 bg-sky-500/10 text-sky-300',
  pendencia: 'border-amber-400/30 bg-amber-500/10 text-amber-300',
  boleto_enviado: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-400',
  ordem_servico: 'border-violet-400/30 bg-violet-500/10 text-violet-300',
  engenharia_concluida: 'border-green-400/30 bg-green-500/10 text-green-400',
}

const KANBAN_INITIAL_VISIBLE_COUNT = 10

export function EngenhariaKanbanBoard({
  items,
  isEmpty,
  isLoading = false,
  error = null,
  canMoveCards,
  isAdmin,
  movingRequestId = null,
  onSelectRequest,
  onMoveRequest,
}: EngenhariaKanbanBoardProps) {
  const [draggedRequestId, setDraggedRequestId] = useState<string | null>(null)
  const [dragOverStatus, setDragOverStatus] = useState<EngenhariaRequestStatus | null>(
    null,
  )
  const [showAllColumns, setShowAllColumns] = useState(false)

  const columns = useMemo(
    () =>
      ENGENHARIA_REQUEST_STATUS_OPTIONS.map((statusOption) => ({
        status: statusOption.value,
        label: statusOption.label,
        items: items
          .filter((request) => request.status === statusOption.value)
          .sort(
            (left, right) =>
              new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
          ),
      })),
    [items],
  )

  const handleRequestKeyDown = (
    event: KeyboardEvent<HTMLElement>,
    requestId: string,
  ) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    event.preventDefault()
    onSelectRequest(requestId)
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center text-body-md text-on-surface-variant shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
        Carregando solicitações...
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
        Nenhuma solicitação de engenharia encontrada.
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
            Exibindo{' '}
            {showAllColumns
              ? 'todas as solicitações'
              : `${KANBAN_INITIAL_VISIBLE_COUNT} solicitações por coluna`}{' '}
            em ordem de data, das mais recentes para as mais antigas.
            {canMoveCards ? ' Arraste um card para alterar a situação.' : ''}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAllColumns((currentValue) => !currentValue)}
          className="rounded-xl border border-outline-variant bg-surface-container-low px-4 py-2 text-label-md font-semibold text-on-surface transition-all hover:bg-surface-container"
        >
          {showAllColumns ? 'Mostrar menos' : 'Listar todas'}
        </button>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max gap-4">
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

                  const requestId =
                    event.dataTransfer.getData('text/plain') || draggedRequestId

                  if (requestId) {
                    onMoveRequest(requestId, column.status)
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
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${COLUMN_TONE_CLASS_NAME[column.status]}`}
                    >
                      <Icon name={COLUMN_ICON[column.status]} size={18} />
                    </span>
                    <h3 className="text-label-lg font-semibold text-on-surface">
                      {column.label}
                    </h3>
                  </div>

                  <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-surface-container px-1.5 text-label-sm font-semibold text-on-surface-variant">
                    {column.items.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {column.items.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest px-4 py-8 text-center text-body-sm text-on-surface-variant">
                      Sem solicitações nesta coluna.
                    </div>
                  ) : (
                    visibleItems.map((request) => {
                      const isMoving = movingRequestId === request.id

                      return (
                        <div
                          key={request.id}
                          role="button"
                          tabIndex={0}
                          draggable={canMoveCards && !isMoving}
                          onDragStart={(event) => {
                            if (!canMoveCards) {
                              return
                            }

                            setDraggedRequestId(request.id)
                            event.dataTransfer.effectAllowed = 'move'
                            event.dataTransfer.setData('text/plain', request.id)
                          }}
                          onDragEnd={() => {
                            setDraggedRequestId(null)
                            setDragOverStatus(null)
                          }}
                          onClick={() => onSelectRequest(request.id)}
                          onKeyDown={(event) => handleRequestKeyDown(event, request.id)}
                          className={`w-full min-w-0 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest p-4 text-left shadow-[0px_1px_3px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                            canMoveCards
                              ? 'cursor-grab active:cursor-grabbing'
                              : 'cursor-pointer'
                          } ${isMoving ? 'opacity-60' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="truncate text-label-md font-semibold text-primary">
                              {request.requestCode}
                            </p>
                            <span className="shrink-0 rounded-md bg-surface-container px-2 py-0.5 text-[11px] font-semibold text-on-surface-variant">
                              {request.propertyKind}
                            </span>
                          </div>

                          <p
                            className="mt-2 truncate text-body-md font-semibold text-on-surface"
                            title={request.accompanyingName}
                          >
                            {request.accompanyingName}
                          </p>

                          <dl className="mt-3 grid gap-2 text-body-sm">
                            <div className="min-w-0">
                              <dt className="text-on-surface-variant">Valor</dt>
                              <dd className="truncate font-medium text-on-surface">
                                {formatCurrencyBRL(request.propertyValue)}
                              </dd>
                            </div>
                            {isAdmin ? (
                              <div className="min-w-0">
                                <dt className="text-on-surface-variant">Corretor</dt>
                                <dd
                                  className="truncate font-medium text-on-surface"
                                  title={request.ownerName}
                                >
                                  {request.ownerName}
                                </dd>
                              </div>
                            ) : null}
                            <div className="min-w-0">
                              <dt className="text-on-surface-variant">Solicitado em</dt>
                              <dd className="truncate font-medium text-on-surface">
                                {formatCreatedAt(request.createdAt)}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      )
                    })
                  )}

                  {!showAllColumns && column.items.length > KANBAN_INITIAL_VISIBLE_COUNT ? (
                    <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest px-4 py-3 text-center text-body-sm text-on-surface-variant">
                      +{column.items.length - KANBAN_INITIAL_VISIBLE_COUNT} solicitação(ões)
                      ocultas nesta coluna.
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
