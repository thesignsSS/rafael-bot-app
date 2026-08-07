import { Icon } from '../../../components/ui/Icon'
import { formatCreatedAt, formatCurrencyBRL } from '../lib/engenhariaUtils'
import type { EngenhariaRequestListItem } from '../types/engenhariaRequest'
import { EngenhariaStatusBadge } from './EngenhariaStatusBadge'

type EngenhariaRequestsTableProps = {
  items: EngenhariaRequestListItem[]
  isAdmin: boolean
  isLoading: boolean
  error: string | null
  onView: (requestId: string) => void
  onEdit: (requestId: string) => void
  onDelete: (requestId: string, requestCode: string) => void
}

export function EngenhariaRequestsTable({
  items,
  isAdmin,
  isLoading,
  error,
  onView,
  onEdit,
  onDelete,
}: EngenhariaRequestsTableProps) {
  const columnCount = isAdmin ? 8 : 7

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-outline-variant bg-surface-container-low">
            <th className="px-6 py-4 text-label-md font-semibold text-on-surface">
              Código
            </th>
            <th className="px-6 py-4 text-label-md font-semibold text-on-surface">
              Acompanhante
            </th>
            <th className="px-6 py-4 text-label-md font-semibold text-on-surface">
              Tipo de Imóvel
            </th>
            <th className="px-6 py-4 text-label-md font-semibold text-on-surface">
              Valor
            </th>
            <th className="px-6 py-4 text-label-md font-semibold text-on-surface">
              Situação
            </th>
            {isAdmin ? (
              <th className="px-6 py-4 text-label-md font-semibold text-on-surface">
                Corretor
              </th>
            ) : null}
            <th className="px-6 py-4 text-label-md font-semibold text-on-surface">
              Data
            </th>
            <th className="px-6 py-4 text-right text-label-md font-semibold text-on-surface">
              Ações
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
                Carregando solicitações...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={columnCount} className="px-6 py-12 text-center text-body-md text-error">
                {error}
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td
                colSpan={columnCount}
                className="px-6 py-12 text-center text-body-md text-on-surface-variant"
              >
                Nenhuma solicitação de engenharia encontrada.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id} className="transition-colors hover:bg-surface-container">
                <td className="px-6 py-4 text-body-md font-medium text-primary">
                  {item.requestCode}
                </td>
                <td className="px-6 py-4 text-body-md text-on-surface">
                  {item.accompanyingName}
                </td>
                <td className="px-6 py-4 text-body-md text-on-surface">
                  {item.propertyKind}
                </td>
                <td className="px-6 py-4 text-body-md text-on-surface">
                  {formatCurrencyBRL(item.propertyValue)}
                </td>
                <td className="px-6 py-4 text-body-md">
                  <EngenhariaStatusBadge
                    status={item.status}
                    statusLabel={item.statusLabel}
                  />
                </td>
                {isAdmin ? (
                  <td className="px-6 py-4 text-body-md text-on-surface-variant">
                    {item.ownerName}
                  </td>
                ) : null}
                <td className="px-6 py-4 text-body-md text-on-surface-variant">
                  {formatCreatedAt(item.createdAt)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onView(item.id)}
                      aria-label={`Ver solicitação ${item.requestCode}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
                    >
                      <Icon name="visibility" size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(item.id)}
                      aria-label={`Editar solicitação ${item.requestCode}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
                    >
                      <Icon name="edit" size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item.id, item.requestCode)}
                      aria-label={`Excluir solicitação ${item.requestCode}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-error/10 hover:text-error"
                    >
                      <Icon name="delete" size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
