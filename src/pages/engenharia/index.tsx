import { Icon } from '../../components/ui/Icon'
import { usePreferences } from '../../contexts/preferences-context'
import { DeleteEngenhariaRequestModal } from './components/DeleteEngenhariaRequestModal'
import { EngenhariaKanbanBoard } from './components/EngenhariaKanbanBoard'
import { EngenhariaRequestsActionHeader } from './components/EngenhariaRequestsActionHeader'
import { EngenhariaRequestsTable } from './components/EngenhariaRequestsTable'
import { useEngenhariaRequestsPage } from './hooks/useEngenhariaRequestsPage'

export default function EngenhariaRequestsPage() {
  const page = useEngenhariaRequestsPage()
  const { preferences, updatePreferences } = usePreferences()
  const isFilteredEmpty = !page.isLoading && page.items.length === 0

  return (
    <div className="mx-auto max-w-6xl">
      <EngenhariaRequestsActionHeader
        isAdmin={page.isAdmin}
        onNewRequest={page.goToNewRequest}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Icon
            name="search"
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            value={page.search}
            onChange={(event) => page.setSearch(event.target.value)}
            placeholder="Buscar por nome ou código"
            className="proposal-input !pl-10"
          />
        </div>

        <div className="inline-flex rounded-xl border border-outline-variant bg-surface-container-low p-1">
          <button
            type="button"
            onClick={() => updatePreferences({ engenhariaLayout: 'table' })}
            className={`rounded-lg px-3 py-2 text-label-sm font-semibold transition-all ${
              preferences.engenhariaLayout === 'table'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            Tabela
          </button>
          <button
            type="button"
            onClick={() => updatePreferences({ engenhariaLayout: 'kanban' })}
            className={`rounded-lg px-3 py-2 text-label-sm font-semibold transition-all ${
              preferences.engenhariaLayout === 'kanban'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            Kanban
          </button>
        </div>
      </div>

      {preferences.engenhariaLayout === 'table' ? (
        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
          <EngenhariaRequestsTable
            items={page.items}
            isAdmin={page.isAdmin}
            isLoading={page.isLoading}
            error={page.error}
            onView={page.goToRequestDetail}
            onEdit={page.goToEditRequest}
            onDelete={page.openDeleteModal}
          />
        </div>
      ) : (
        <EngenhariaKanbanBoard
          items={page.items}
          isEmpty={isFilteredEmpty}
          isLoading={page.isLoading}
          error={page.error}
          canMoveCards={page.isAdmin}
          isAdmin={page.isAdmin}
          movingRequestId={page.movingRequestId}
          onSelectRequest={page.goToRequestDetail}
          onMoveRequest={page.moveRequest}
        />
      )}

      <DeleteEngenhariaRequestModal
        isOpen={page.requestPendingDeletion !== null}
        isDeleting={page.isDeleting}
        requestCode={page.requestPendingDeletion?.requestCode ?? ''}
        onClose={page.closeDeleteModal}
        onConfirm={page.confirmDelete}
      />
    </div>
  )
}
