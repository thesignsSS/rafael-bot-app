import { Icon } from '../../../../components/ui/Icon'
import { ProposalInfoField } from './ProposalInfoField'

type ProposalClientCardProps = {
  name: string
  cpf: string
  phone: string
  email: string
}

export function ProposalClientCard({
  name,
  cpf,
  phone,
  email,
}: ProposalClientCardProps) {
  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
      <div className="mb-4 flex items-center gap-2 text-primary">
        <Icon name="person_outline" size={22} />
        <h3 className="text-headline-md font-semibold text-on-surface">
          Dados do Cliente
        </h3>
      </div>

      <div className="space-y-4">
        <ProposalInfoField label="Nome Completo" value={name} />
        <ProposalInfoField label="CPF" value={cpf} />
        <ProposalInfoField label="Telefone" value={phone} />
        <ProposalInfoField label="E-mail" value={email} />
      </div>
    </section>
  )
}
