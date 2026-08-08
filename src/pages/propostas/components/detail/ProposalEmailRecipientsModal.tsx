import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '../../../../components/ui/Icon'
import type { ProposalDocument } from '../../types/proposal-detail'

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

type ProposalEmailRecipientsModalProps = {
  isOpen: boolean
  isSending: boolean
  templateLabel: string
  subject: string
  bodyPreview: string
  defaultRecipient: string
  existingAttachments: ProposalDocument[]
  proposalDocuments: ProposalDocument[]
  isUploadingAttachment: boolean
  onUploadAttachment: (files: File[]) => void
  onClose: () => void
  onSend: (recipients: string[], attachmentIds: string[], bodyText: string) => void
}

function DocumentChecklist({
  documents,
  selectedIds,
  onToggle,
}: {
  documents: ProposalDocument[]
  selectedIds: string[]
  onToggle: (documentId: string) => void
}) {
  return (
    <div className="space-y-1.5">
      {documents.map((document) => (
        <label
          key={document.id}
          className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface px-3 py-2"
        >
          <input
            type="checkbox"
            checked={selectedIds.includes(document.id)}
            onChange={() => onToggle(document.id)}
            className="h-4 w-4 shrink-0 accent-primary"
          />
          <span className="truncate text-body-sm text-on-surface">
            {document.displayName ?? document.originalFilename}
          </span>
        </label>
      ))}
    </div>
  )
}

export function ProposalEmailRecipientsModal({
  isOpen,
  isSending,
  templateLabel,
  subject,
  bodyPreview,
  defaultRecipient,
  existingAttachments,
  proposalDocuments,
  isUploadingAttachment,
  onUploadAttachment,
  onClose,
  onSend,
}: ProposalEmailRecipientsModalProps) {
  const [recipients, setRecipients] = useState<string[]>([defaultRecipient])
  const [selectedAttachmentIds, setSelectedAttachmentIds] = useState<string[]>([])
  const [bodyDraft, setBodyDraft] = useState(bodyPreview)
  const [isEditingBody, setIsEditingBody] = useState(false)
  const [isProposalDocumentsListOpen, setIsProposalDocumentsListOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setRecipients([defaultRecipient])
      setSelectedAttachmentIds([])
      setBodyDraft(bodyPreview)
      setIsEditingBody(false)
      setIsProposalDocumentsListOpen(false)
    }
  }, [isOpen, defaultRecipient, bodyPreview])

  if (!isOpen) {
    return null
  }

  const trimmedRecipients = recipients.map((recipient) => recipient.trim())
  const hasAtLeastOneRecipient = trimmedRecipients.some(Boolean)
  const hasInvalidRecipient = trimmedRecipients.some(
    (recipient) => recipient.length > 0 && !isValidEmail(recipient),
  )
  const canSend = hasAtLeastOneRecipient && !hasInvalidRecipient && !isSending

  const updateRecipient = (index: number, value: string) => {
    setRecipients((current) =>
      current.map((recipient, currentIndex) =>
        currentIndex === index ? value : recipient,
      ),
    )
  }

  const addRecipient = () => {
    setRecipients((current) => [...current, ''])
  }

  const removeRecipient = (targetIndex: number) => {
    setRecipients((current) => current.filter((_, index) => index !== targetIndex))
  }

  const toggleAttachment = (documentId: string) => {
    setSelectedAttachmentIds((current) =>
      current.includes(documentId)
        ? current.filter((id) => id !== documentId)
        : [...current, documentId],
    )
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#131b2e]/55 p-4 backdrop-blur-[2px]">
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-[0px_24px_60px_rgba(0,0,0,0.28)]">
        <div className="shrink-0 border-b border-outline-variant bg-surface-container px-5 py-3">
          <p className="text-label-md font-semibold text-on-surface">
            Enviar e-mail — {templateLabel}
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-2">
            <span className="text-body-sm font-medium text-on-surface-variant">
              Destinatários
            </span>

            {recipients.map((recipient, index) => {
              const trimmedRecipient = recipient.trim()
              const recipientHasError =
                trimmedRecipient.length > 0 && !isValidEmail(trimmedRecipient)

              return (
                <div key={`recipient-${index}`} className="flex items-center gap-2">
                  <input
                    type="email"
                    value={recipient}
                    onChange={(event) => updateRecipient(index, event.target.value)}
                    placeholder="destinatario@empresa.com"
                    className={`w-full rounded-xl border bg-surface px-4 py-3 text-body-md text-on-surface outline-none transition-all focus:ring-2 ${
                      recipientHasError
                        ? 'border-error text-error focus:border-error focus:ring-error/20'
                        : 'border-outline-variant focus:border-primary focus:ring-primary/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => removeRecipient(index)}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-outline text-on-surface-variant transition-all hover:border-error/40 hover:bg-error/10 hover:text-error"
                    aria-label="Remover destinatário"
                  >
                    <Icon name="close" size={18} />
                  </button>
                  {index === recipients.length - 1 ? (
                    <button
                      type="button"
                      onClick={addRecipient}
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-outline text-primary transition-all hover:bg-surface-container"
                      aria-label="Adicionar destinatário"
                    >
                      <Icon name="add" size={18} />
                    </button>
                  ) : null}
                </div>
              )
            })}

            {hasInvalidRecipient ? (
              <p className="text-body-sm text-error">
                Preencha todos os destinatários com e-mails válidos.
              </p>
            ) : !hasAtLeastOneRecipient ? (
              <p className="text-body-sm text-error">
                Informe ao menos um destinatário para enviar o e-mail.
              </p>
            ) : null}
          </div>

          <div className="mt-5 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-body-sm font-medium text-on-surface-variant">
                Anexos
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setIsProposalDocumentsListOpen((currentValue) => !currentValue)
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-outline px-3 py-1.5 text-label-sm font-semibold text-primary transition-all hover:bg-surface-container"
                >
                  <Icon name="folder_open" size={16} />
                  Usar documento da proposta
                </button>
                <label
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-outline px-3 py-1.5 text-label-sm font-semibold text-primary transition-all hover:bg-surface-container ${
                    isUploadingAttachment ? 'cursor-not-allowed opacity-60' : ''
                  }`}
                >
                  <Icon name="attach_file" size={16} />
                  {isUploadingAttachment ? 'Enviando...' : 'Anexar novo documento'}
                  <input
                    type="file"
                    multiple
                    disabled={isUploadingAttachment}
                    className="sr-only"
                    onChange={(event) => {
                      const files = Array.from(event.target.files ?? [])
                      event.target.value = ''

                      if (files.length > 0) {
                        onUploadAttachment(files)
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {isProposalDocumentsListOpen ? (
              proposalDocuments.length === 0 ? (
                <p className="text-body-sm text-on-surface-variant">
                  Esta proposta ainda não tem documentos anexados.
                </p>
              ) : (
                <DocumentChecklist
                  documents={proposalDocuments}
                  selectedIds={selectedAttachmentIds}
                  onToggle={toggleAttachment}
                />
              )
            ) : null}

            {existingAttachments.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">
                Nenhum documento enviado por aqui ainda.
              </p>
            ) : (
              <DocumentChecklist
                documents={existingAttachments}
                selectedIds={selectedAttachmentIds}
                onToggle={toggleAttachment}
              />
            )}
          </div>

          <div className="mt-5 rounded-2xl border border-outline-variant bg-surface p-4">
            <div className="flex items-center gap-3 border-b border-outline-variant pb-3">
              <span className="min-w-16 text-body-sm font-medium text-on-surface-variant">
                Assunto
              </span>
              <span className="text-body-md text-on-surface">{subject}</span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-body-sm font-medium text-on-surface-variant">
                Corpo do e-mail
              </span>
              <button
                type="button"
                onClick={() => setIsEditingBody((currentValue) => !currentValue)}
                className="inline-flex items-center gap-2 rounded-lg border border-outline px-3 py-1.5 text-label-sm font-semibold text-primary transition-all hover:bg-surface-container"
              >
                <Icon name="edit" size={14} />
                {isEditingBody ? 'Concluir edição' : 'Editar'}
              </button>
            </div>

            <div className="mt-2 text-body-md leading-7 text-on-surface">
              {isEditingBody ? (
                <textarea
                  value={bodyDraft}
                  onChange={(event) => setBodyDraft(event.target.value)}
                  rows={12}
                  className="w-full resize-y rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md leading-7 text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              ) : (
                bodyDraft.split('\n').map((line, index) =>
                  line.length > 0 ? (
                    <p key={`${line}-${index}`} className="break-words whitespace-pre-wrap">
                      {line}
                    </p>
                  ) : (
                    <div key={`spacer-${index}`} className="h-3" />
                  ),
                )
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t border-outline-variant bg-surface-container px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="rounded-lg border border-outline px-4 py-2 text-label-md font-semibold text-primary transition-all hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() =>
              onSend(trimmedRecipients.filter(Boolean), selectedAttachmentIds, bodyDraft)
            }
            disabled={!canSend}
            className="rounded-lg bg-primary px-4 py-2 text-label-md font-semibold text-on-primary transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSending ? 'Enviando...' : 'Enviar e-mail'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
