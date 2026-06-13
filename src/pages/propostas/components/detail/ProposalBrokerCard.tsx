import { Icon } from '../../../../components/ui/Icon'
import { formatBrazilianPhone } from '../../../../lib/phone'
import { ProposalInfoField } from './ProposalInfoField'

type ProposalBrokerCardProps = {
  name: string
  phone: string
}

export function ProposalBrokerCard({ name, phone }: ProposalBrokerCardProps) {
  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
      <div className="mb-4 flex items-center gap-2 text-primary">
        <Icon name="support_agent" size={22} />
        <h3 className="text-headline-md font-semibold text-on-surface">
          Dados do Corretor
        </h3>
      </div>

      <div className="space-y-4">
        <ProposalInfoField label="Nome" value={name} />
        <ProposalInfoField label="WhatsApp" value={formatBrazilianPhone(phone)} />
      </div>
    </section>
  )
}
