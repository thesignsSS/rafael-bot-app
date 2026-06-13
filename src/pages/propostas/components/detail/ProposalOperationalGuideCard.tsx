import { Icon } from '../../../../components/ui/Icon'
import type {
  ProposalOperationalGuide,
  ProposalOperationalTask,
} from '../../lib/proposalOperationalGuide'

type PendingDocumentDraft = {
  file: File
  key: string
}

type ProposalOperationalGuideCardProps = {
  guide: ProposalOperationalGuide
  pendingReason?: string
  pendingDocuments: PendingDocumentDraft[]
  isBusy?: boolean
  canUploadPendingDocuments: boolean
  canResend: boolean
  onOpenComments: () => void
  onOpenPendingDocuments: () => void
  onRemovePendingDocument: (file: File) => void
  onResend: () => void
  onOpenAssistant: () => void
}

const taskStatusClassName: Record<ProposalOperationalTask['status'], string> = {
  pendente: 'border-outline-variant bg-white text-on-surface',
  em_andamento: 'border-sky-200 bg-sky-50 text-sky-950',
  concluido: 'border-emerald-200 bg-emerald-50 text-emerald-950',
}

const taskStatusIcon: Record<ProposalOperationalTask['status'], string> = {
  pendente: 'radio_button_unchecked',
  em_andamento: 'progress_activity',
  concluido: 'check_circle',
}

export function ProposalOperationalGuideCard({
  guide,
  pendingReason = '',
  pendingDocuments,
  isBusy = false,
  canUploadPendingDocuments,
  canResend,
  onOpenComments,
  onOpenPendingDocuments,
  onRemovePendingDocument,
  onResend,
  onOpenAssistant,
}: ProposalOperationalGuideCardProps) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-sky-100 bg-[linear-gradient(135deg,#f8fbff_0%,#eef5ff_55%,#fdfefe_100%)] shadow-[0px_18px_40px_rgba(36,99,235,0.08)]">
      <div className="flex flex-col gap-5 px-6 py-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-[0px_10px_24px_rgba(0,74,198,0.18)]">
              <Icon name="fact_check" size={22} />
            </span>
            <div>
              <p className="text-label-sm font-semibold uppercase tracking-[0.16em] text-primary/80">
                {guide.headline}
              </p>
              <h3 className="text-headline-md font-semibold text-on-surface">
                Próximo passo: {guide.nextStepLabel}
              </h3>
            </div>
          </div>

          <p className="mt-4 max-w-2xl text-body-md text-on-surface-variant">
            {guide.summary}
          </p>

          {pendingReason ? (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
              <p className="text-label-sm font-semibold uppercase tracking-[0.12em] text-amber-900">
                Motivo atual da pendência
              </p>
              <p className="mt-2 whitespace-pre-wrap text-body-md text-amber-950">
                {pendingReason}
              </p>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onOpenComments}
              className="rounded-xl bg-primary px-4 py-2.5 text-label-md font-semibold text-on-primary transition-all hover:bg-primary-container"
            >
              Ver comentários
            </button>
            {canUploadPendingDocuments ? (
              <button
                type="button"
                onClick={onOpenPendingDocuments}
                disabled={isBusy}
                className="rounded-xl border border-outline bg-white px-4 py-2.5 text-label-md font-semibold text-primary transition-all hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
              >
                Enviar documentos
              </button>
            ) : null}
            <button
              type="button"
              onClick={onOpenAssistant}
              className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-label-md font-semibold text-sky-900 transition-all hover:bg-sky-100"
            >
              Pedir resumo ao assistente
            </button>
          </div>

          {pendingDocuments.length > 0 ? (
            <div className="mt-5 rounded-2xl border border-outline-variant bg-white/85 p-4 shadow-[0px_8px_24px_rgba(19,27,46,0.05)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-label-md font-semibold text-on-surface">
                    Arquivos separados para o reenvio
                  </p>
                  <p className="mt-1 text-body-sm text-on-surface-variant">
                    Revise só o que faz sentido para esta tratativa.
                  </p>
                </div>
                <span className="rounded-full bg-surface-container px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant">
                  {pendingDocuments.length === 1
                    ? '1 arquivo'
                    : `${pendingDocuments.length} arquivos`}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {pendingDocuments.map((document) => (
                  <div
                    key={document.key}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-outline-variant bg-surface px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-label-md font-semibold text-on-surface">
                        {document.file.name}
                      </p>
                      <p className="text-body-sm text-on-surface-variant">
                        {formatFileSize(document.file.size)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemovePendingDocument(document.file)}
                      disabled={isBusy}
                      className="rounded-lg border border-outline px-3 py-2 text-label-md font-semibold text-primary transition-all hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="min-w-0 rounded-2xl border border-white/70 bg-white/80 p-4 shadow-[0px_10px_24px_rgba(19,27,46,0.06)] lg:w-[320px]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-label-sm font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
                Situação
              </p>
              <p className="mt-1 text-body-md font-semibold text-on-surface">
                {guide.statusLabel}
              </p>
            </div>
            {canResend ? (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                Pronta para reenvio
              </span>
            ) : (
              <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                Em tratativa
              </span>
            )}
          </div>

          <div className="mt-4 space-y-3">
            {guide.tasks.map((task) => (
              <div
                key={task.id}
                className={`rounded-2xl border px-4 py-3 ${taskStatusClassName[task.status]}`}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-current">
                    <Icon name={taskStatusIcon[task.status]} size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-body-sm font-semibold">{task.title}</p>
                    {task.detail ? (
                      <p className="mt-1 text-body-sm opacity-80">{task.detail}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {canResend || pendingDocuments.length > 0 ? (
            <div className="mt-4 rounded-2xl border border-outline-variant bg-surface p-4">
              <p className="text-body-sm text-on-surface-variant">
                {canResend
                  ? 'Os ajustes já foram preparados. Você pode reenviar a proposta para análise.'
                  : 'Depois de separar os arquivos e concluir os ajustes, o reenvio será liberado aqui.'}
              </p>

              <button
                type="button"
                onClick={onResend}
                disabled={!canResend || isBusy}
                className="mt-4 w-full rounded-xl bg-primary px-4 py-3 text-label-md font-semibold text-on-primary transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isBusy && canResend ? 'Reenviando...' : 'Reenviar para análise'}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

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
