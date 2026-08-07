import { Icon } from '../../components/ui/Icon'
import { DeleteEngenhariaRequestModal } from './components/DeleteEngenhariaRequestModal'
import { EngenhariaRequestsActionHeader } from './components/EngenhariaRequestsActionHeader'
import { EngenhariaRequestsTable } from './components/EngenhariaRequestsTable'
import { useEngenhariaRequestsPage } from './hooks/useEngenhariaRequestsPage'

export default function EngenhariaRequestsPage() {
  const page = useEngenhariaRequestsPage()

  return (
    <div className="mx-auto max-w-6xl">
      <EngenhariaRequestsActionHeader
        isAdmin={page.isAdmin}
        onNewRequest={page.goToNewRequest}
      />

      <div className="mb-4 max-w-sm">
        <div className="relative">
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
      </div>

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
