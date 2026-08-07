import { additionalInfoMaxLength } from '../lib/proposalUtils'
import { FormSection } from '../../../components/ui/FormSection'

type AdditionalInfoSectionProps = {
  additionalInfo: string
  onAdditionalInfoChange: (value: string) => void
}

export function AdditionalInfoSection({
  additionalInfo,
  onAdditionalInfoChange,
}: AdditionalInfoSectionProps) {
  return (
    <FormSection
      icon="edit_note"
      title="Informações Adicionais"
      description="Inclua observações, contexto ou instruções importantes para análise"
      optional
    >
      <textarea
        value={additionalInfo}
        onChange={(event) => onAdditionalInfoChange(event.target.value)}
        maxLength={additionalInfoMaxLength}
        rows={8}
        placeholder="Digite informações adicionais sobre a proposta, o cliente ou os documentos enviados."
        className="proposal-textarea"
      />
      <div className="mt-2 flex justify-end">
        <span className="text-body-sm text-outline">
          {additionalInfo.length.toLocaleString('pt-BR')} /{' '}
          {additionalInfoMaxLength.toLocaleString('pt-BR')} caracteres
        </span>
      </div>
    </FormSection>
  )
}
