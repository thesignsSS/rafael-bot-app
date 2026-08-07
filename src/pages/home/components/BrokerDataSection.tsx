import { Icon } from '../../../components/ui/Icon'
import { formatBrazilianPhone } from '../../../lib/phone'
import { Field } from '../../../components/ui/Field'
import { FormSection } from '../../../components/ui/FormSection'

type BrokerDataSectionProps = {
  brokerPhone: string
  onBrokerPhoneChange: (value: string) => void
}

export function BrokerDataSection({
  brokerPhone,
  onBrokerPhoneChange,
}: BrokerDataSectionProps) {
  return (
    <FormSection icon="support_agent" title="Dados do Corretor" optional>
      <div className="max-w-md">
        <Field label="WhatsApp do Corretor">
          <div className="relative">
            <input
              value={brokerPhone}
              onChange={(event) =>
                onBrokerPhoneChange(formatBrazilianPhone(event.target.value))
              }
              placeholder="(85) 99999-9999"
              inputMode="tel"
              maxLength={15}
              className="proposal-input pr-12"
            />
            <Icon
              name="chat"
              size={20}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500"
            />
          </div>
        </Field>
      </div>
    </FormSection>
  )
}
