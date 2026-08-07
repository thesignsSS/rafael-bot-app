import { useNavigate } from 'react-router-dom'
import { Button } from '../../../../components/ui/Button'
import { Icon } from '../../../../components/ui/Icon'
import { useEngenhariaForm } from '../hooks/useEngenhariaForm'
import { EngenhariaDocumentsSection } from './EngenhariaDocumentsSection'
import { RequestInfoSection } from './RequestInfoSection'

export function EngenhariaForm() {
  const form = useEngenhariaForm()
  const navigate = useNavigate()

  return (
    <div className="relative">
      {form.isSubmitting ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-background/78 backdrop-blur-[2px]">
          <div className="flex min-w-64 items-center gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest px-5 py-4 shadow-lg">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon name="sync" size={24} className="animate-spin" />
            </div>
            <div>
              <p className="text-label-md font-semibold text-on-surface">
                Enviando solicitação
              </p>
              <p className="text-body-sm text-on-surface-variant">
                Aguarde enquanto registramos a análise de engenharia.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div
        className={
          form.isSubmitting ? 'pointer-events-none select-none opacity-70' : ''
        }
        aria-busy={form.isSubmitting}
      >
        <button
          type="button"
          onClick={() => navigate('/engenharia')}
          className="group mb-4 flex items-center gap-1 text-label-md font-medium text-on-surface-variant transition-colors hover:text-primary"
        >
          <Icon name="arrow_back" size={18} />
          Voltar para a listagem
        </button>

        <section className="mb-8 flex items-start gap-4 border-b border-outline-variant/60 pb-7">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon name="engineering" size={32} />
          </div>
          <div>
            <h1 className="text-headline-xl font-bold text-on-surface">
              Solicitar Engenharia
            </h1>
            <p className="mt-1 max-w-3xl text-body-md text-on-surface-variant">
              Preencha as informações abaixo para solicitar a análise de
              engenharia do imóvel.
            </p>
          </div>
        </section>

        <div className="rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-sm sm:p-6">
          <RequestInfoSection
            propertyKind={form.propertyKind}
            propertyKindError={form.propertyKindError}
            propertyValue={form.propertyValue}
            propertyValueError={form.propertyValueError}
            contact={form.contact}
            contactError={form.contactError}
            accompanyingName={form.accompanyingName}
            accompanyingNameError={form.accompanyingNameError}
            onPropertyKindChange={form.handlePropertyKindChange}
            onPropertyValueChange={form.handlePropertyValueChange}
            onContactChange={form.handleContactChange}
            onAccompanyingNameChange={form.handleAccompanyingNameChange}
          />

          <EngenhariaDocumentsSection
            documents={form.documents}
            documentsError={form.documentsError}
            onSelectDocument={form.setDocument}
            onRemoveDocument={form.removeDocument}
          />
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            icon="engineering"
            loading={form.isSubmitting}
            onClick={form.handleSubmit}
            className="!w-auto px-8"
          >
            Solicitar Engenharia
          </Button>
        </div>
      </div>
    </div>
  )
}
