import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '../../../../components/ui/Icon'

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
  onClose: () => void
  onSend: (recipients: string[]) => void
}

export function ProposalEmailRecipientsModal({
  isOpen,
  isSending,
  templateLabel,
  subject,
  bodyPreview,
  defaultRecipient,
  onClose,
  onSend,
}: ProposalEmailRecipientsModalProps) {
  const [recipients, setRecipients] = useState<string[]>([defaultRecipient])

  useEffect(() => {
    if (isOpen) {
      setRecipients([defaultRecipient])
    }
  }, [isOpen, defaultRecipient])

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

          <div className="mt-5 rounded-2xl border border-outline-variant bg-surface p-4">
            <div className="flex items-center gap-3 border-b border-outline-variant pb-3">
              <span className="min-w-16 text-body-sm font-medium text-on-surface-variant">
                Assunto
              </span>
              <span className="text-body-md text-on-surface">{subject}</span>
            </div>
            <div className="mt-3 text-body-md leading-7 text-on-surface">
              {bodyPreview.split('\n').map((line, index) =>
                line.length > 0 ? (
                  <p key={`${line}-${index}`} className="break-words whitespace-pre-wrap">
                    {line}
                  </p>
                ) : (
                  <div key={`spacer-${index}`} className="h-3" />
                ),
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
            onClick={() => onSend(trimmedRecipients.filter(Boolean))}
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
