import { useState } from 'react'
import { toast } from 'sonner'
import { Icon } from '../../../../components/ui/Icon'
import { useAuth } from '../../../../contexts/auth-context'
import { sendProposalEmail } from '../../lib/proposalsApi'
import {
  DEFAULT_PROPOSAL_EMAIL_RECIPIENT,
  PROPOSAL_EMAIL_TEMPLATES,
  type ProposalEmailTemplateId,
} from '../../lib/proposalEmailTemplates'
import type { ProposalComment, ProposalDetail } from '../../types/proposal-detail'
import { ProposalEmailRecipientsModal } from './ProposalEmailRecipientsModal'

function formatSentAt(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

type ProposalEmailSectionProps = {
  proposal: ProposalDetail
  history: ProposalComment[]
  onSent: () => void
}

export function ProposalEmailSection({
  proposal,
  history,
  onSent,
}: ProposalEmailSectionProps) {
  const { user } = useAuth()
  const [activeTemplateId, setActiveTemplateId] =
    useState<ProposalEmailTemplateId | null>(null)
  const [isSending, setIsSending] = useState(false)

  const activeTemplate = PROPOSAL_EMAIL_TEMPLATES.find(
    (template) => template.id === activeTemplateId,
  )

  const handleSend = async (recipients: string[]) => {
    if (!user?.id || !activeTemplate) {
      return
    }

    try {
      setIsSending(true)
      await sendProposalEmail(proposal.id, {
        brokerUserId: user.id,
        to: recipients,
        subject: activeTemplate.subject,
        text: activeTemplate.buildText({
          clientName: proposal.client.name,
          clientCpf: proposal.client.cpf,
        }),
      })
      toast.success('E-mail enviado com sucesso.')
      setActiveTemplateId(null)
      onSent()
    } catch (sendError) {
      toast.error(
        sendError instanceof Error
          ? sendError.message
          : 'Não foi possível enviar o e-mail.',
      )
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
      <div className="mb-2 flex items-center gap-2 text-primary">
        <Icon name="mail" size={22} />
        <h3 className="text-headline-md font-semibold text-on-surface">
          Modelos de e-mail
        </h3>
      </div>
      <p className="text-body-md text-on-surface-variant">
        Envie um e-mail já pronto com os dados do cliente para o correspondente
        bancário. Visível apenas para administradores.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        {PROPOSAL_EMAIL_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => setActiveTemplateId(template.id)}
            className="inline-flex items-center gap-2 rounded-lg border border-outline px-4 py-2.5 text-label-md font-semibold text-primary transition-all hover:bg-surface-container"
          >
            <Icon name="send" size={18} />
            {template.buttonLabel}
          </button>
        ))}
      </div>

      <div className="mt-8 border-t border-outline-variant pt-6">
        <h4 className="text-label-lg font-bold text-on-surface">
          Histórico de envios
        </h4>

        {history.length === 0 ? (
          <p className="mt-2 text-body-sm text-on-surface-variant">
            Nenhum e-mail enviado por esta aba ainda.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {[...history]
              .sort(
                (left, right) =>
                  new Date(right.createdAt).getTime() -
                  new Date(left.createdAt).getTime(),
              )
              .map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-lg border border-outline-variant/70 bg-surface-container-lowest p-3"
                >
                  <p className="text-body-md text-on-surface">{entry.message}</p>
                  <p className="mt-1 text-body-sm text-on-surface-variant">
                    {entry.authorName} · {formatSentAt(entry.createdAt)}
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>

      {activeTemplate ? (
        <ProposalEmailRecipientsModal
          isOpen
          isSending={isSending}
          templateLabel={activeTemplate.buttonLabel}
          subject={activeTemplate.subject}
          bodyPreview={activeTemplate.buildText({
            clientName: proposal.client.name,
            clientCpf: proposal.client.cpf,
          })}
          defaultRecipient={DEFAULT_PROPOSAL_EMAIL_RECIPIENT}
          onClose={() => {
            if (!isSending) {
              setActiveTemplateId(null)
            }
          }}
          onSend={(recipients) => void handleSend(recipients)}
        />
      ) : null}
    </div>
  )
}
