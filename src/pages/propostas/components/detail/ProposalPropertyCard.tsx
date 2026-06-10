import { Icon } from '../../../../components/ui/Icon'
import type { PropertyType } from '../../../home/types/proposal'
import { ProposalInfoField } from './ProposalInfoField'

type ProposalPropertyCardProps = {
  propertyType: PropertyType
  location: string
}

export function ProposalPropertyCard({
  propertyType,
  location,
}: ProposalPropertyCardProps) {
  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
      <div className="mb-4 flex items-center gap-2 text-primary">
        <Icon name="apartment" size={22} />
        <h3 className="text-headline-md font-semibold text-on-surface">
          Dados do Imóvel
        </h3>
      </div>

      <div className="space-y-4">
        <ProposalInfoField label="Status do Imóvel" value={propertyType} />
        <ProposalInfoField label="Localização" value={location} />
      </div>
    </section>
  )
}
