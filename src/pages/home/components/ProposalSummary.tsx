import { Button } from '../../../components/ui/Button'
import { Icon } from '../../../components/ui/Icon'
import type { PropertyType } from '../types/proposal'
import { SummaryRow } from './SummaryRow'

type ProposalSummaryProps = {
  clientLabel: string
  emailLabel: string
  propertyType: PropertyType
  bankLabel: string
  stateLabel: string
  cityLabel: string
  hasClientName: boolean
  hasClientEmail: boolean
  hasEmailError: boolean
  hasBank: boolean
  hasCity: boolean
  isSubmitting: boolean
  onSubmit: () => void | Promise<void>
}

export function ProposalSummary({
  clientLabel,
  emailLabel,
  propertyType,
  bankLabel,
  stateLabel,
  cityLabel,
  hasClientName,
  hasClientEmail,
  hasEmailError,
  hasBank,
  hasCity,
  isSubmitting,
  onSubmit,
}: ProposalSummaryProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
      <div className="rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-sm">
        <h2 className="text-headline-md font-bold text-on-surface">Resumo da Proposta</h2>
        <dl className="mt-5 space-y-4 text-body-md">
          <SummaryRow label="Cliente" value={clientLabel} muted={!hasClientName} />
          <SummaryRow
            label="E-mail"
            value={emailLabel}
            muted={!hasClientEmail || hasEmailError}
          />
          <SummaryRow label="Tipo do imóvel" value={propertyType} />
          <SummaryRow label="Banco" value={bankLabel} muted={!hasBank} />
          <SummaryRow label="Estado" value={stateLabel} />
          <SummaryRow label="Município" value={cityLabel} muted={!hasCity} />
        </dl>
      </div>

      <div className="space-y-5">
        <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-5">
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
              <Icon name="verified_user" size={24} />
            </div>
            <div>
              <p className="font-bold text-on-surface">
                Seus arquivos estão seguros
              </p>
              <p className="mt-1 text-body-sm text-on-surface-variant">
                Todos os documentos são enviados com segurança e armazenados
                para análise.
              </p>
            </div>
          </div>
        </div>
        <Button
          onClick={onSubmit}
          loading={isSubmitting}
          icon="send"
          className="h-14 text-base uppercase tracking-normal"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar documentação'}
        </Button>
      </div>
    </section>
  )
}
