import { Icon } from '../../../../components/ui/Icon'
import { formatCreatedAt, formatCurrencyBRL } from '../../lib/engenhariaUtils'
import type { EngenhariaRequestDetail } from '../../types/engenhariaRequest'

function formatFileSize(sizeInBytes: number) {
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} B`
  }

  const sizeInKb = sizeInBytes / 1024

  if (sizeInKb < 1024) {
    return `${sizeInKb.toFixed(1)} KB`
  }

  return `${(sizeInKb / 1024).toFixed(1)} MB`
}

type EngenhariaRequestSummaryProps = {
  request: EngenhariaRequestDetail
}

export function EngenhariaRequestSummary({ request }: EngenhariaRequestSummaryProps) {
  return (
    <div className="rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-sm sm:p-6">
      <h2 className="text-headline-md font-bold text-on-surface">
        Informações da Solicitação
      </h2>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <p className="text-label-md font-semibold text-on-surface-variant">
            Tipo de Imóvel
          </p>
          <p className="mt-1 text-body-md text-on-surface">{request.propertyKind}</p>
        </div>
        <div>
          <p className="text-label-md font-semibold text-on-surface-variant">
            Valor do Imóvel
          </p>
          <p className="mt-1 text-body-md text-on-surface">
            {formatCurrencyBRL(request.propertyValue)}
          </p>
        </div>
        <div>
          <p className="text-label-md font-semibold text-on-surface-variant">Contato</p>
          <p className="mt-1 text-body-md text-on-surface">{request.contactPhone}</p>
        </div>
        <div>
          <p className="text-label-md font-semibold text-on-surface-variant">
            Nome de quem irá acompanhar a engenharia
          </p>
          <p className="mt-1 text-body-md text-on-surface">
            {request.accompanyingName}
          </p>
        </div>
        <div>
          <p className="text-label-md font-semibold text-on-surface-variant">
            Solicitado em
          </p>
          <p className="mt-1 text-body-md text-on-surface">
            {formatCreatedAt(request.createdAt)}
          </p>
        </div>
      </div>

      <div className="mt-8 border-t border-outline-variant pt-6">
        <h3 className="text-label-lg font-bold text-on-surface">
          Documentos Anexados
        </h3>

        {request.documents.length === 0 ? (
          <p className="mt-2 text-body-sm text-on-surface-variant">
            Nenhum documento anexado.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {request.documents.map((document) => (
              <div
                key={document.id}
                className="flex items-center gap-3 rounded-lg border border-outline-variant/70 bg-surface-container-lowest p-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon name="draft" size={20} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-label-md font-semibold text-on-surface">
                    {document.originalFilename}
                  </p>
                  <p className="text-body-sm text-on-surface-variant">
                    {formatFileSize(document.sizeBytes)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
