import { Icon } from '../../../components/ui/Icon'
import { useProposalForm } from '../hooks/useProposalForm'
import { AdditionalInfoSection } from './AdditionalInfoSection'
import { BrokerDataSection } from './BrokerDataSection'
import { ClientDataSection } from './ClientDataSection'
import { DocumentsSection } from './DocumentsSection'
import { PropertyDataSection } from './PropertyDataSection'
import { ProposalSummary } from './ProposalSummary'

export function ProposalForm() {
  const form = useProposalForm()

  return (
    <>
      <section className="mb-8 flex items-start gap-4 border-b border-outline-variant/60 pb-7">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primary">
          <Icon name="note_add" size={32} />
        </div>
        <div>
          <h1 className="text-headline-xl font-bold text-on-surface">
            Nova Proposta
          </h1>
          <p className="mt-1 max-w-3xl text-body-md text-on-surface-variant">
            Preencha os dados do cliente e anexe os documentos para análise de
            crédito imobiliário.
          </p>
        </div>
      </section>

      <div className="space-y-6">
        <BrokerDataSection
          brokerPhone={form.brokerPhone}
          onBrokerPhoneChange={form.setBrokerPhone}
        />

        <ClientDataSection
          clientName={form.clientName}
          clientCpf={form.clientCpf}
          clientCpfError={form.clientCpfError}
          clientPhone={form.clientPhone}
          clientPhoneError={form.clientPhoneError}
          clientEmail={form.clientEmail}
          emailError={form.emailError}
          onClientNameChange={form.setClientName}
          onClientCpfChange={form.handleClientCpfChange}
          onClientPhoneChange={form.handleClientPhoneChange}
          onClientEmailChange={form.handleClientEmailChange}
          onValidateClientCpf={form.validateClientCpf}
          onValidateClientPhone={form.validateClientPhone}
          onValidateClientEmail={form.validateClientEmail}
        />

        <PropertyDataSection
          propertyType={form.propertyType}
          propertyState={form.propertyState}
          stateError={form.stateError}
          city={form.city}
          citySearch={form.citySearch}
          cityError={form.cityError}
          citiesError={form.citiesError}
          isLoadingCities={form.isLoadingCities}
          isCityDropdownOpen={form.isCityDropdownOpen}
          filteredCities={form.filteredCities}
          comboboxRef={form.comboboxRef}
          onPropertyTypeChange={form.setPropertyType}
          onPropertyStateChange={form.setPropertyState}
          onCitySearchChange={form.handleCitySearchChange}
          onOpenCityDropdown={form.openCityDropdown}
          onToggleCityDropdown={form.toggleCityDropdown}
          onSelectCity={form.selectCity}
        />

        <DocumentsSection
          extraFiles={form.extraFiles}
          onExtraFileChange={form.handleExtraFileChange}
          onExtraFilesDrop={form.addExtraFiles}
          onRemoveExtraFile={form.removeExtraFile}
        />

        <AdditionalInfoSection
          additionalInfo={form.additionalInfo}
          onAdditionalInfoChange={form.setAdditionalInfo}
        />

        <ProposalSummary
          clientLabel={form.clientLabel}
          emailLabel={form.emailLabel}
          propertyType={form.propertyType}
          stateLabel={form.propertyState}
          cityLabel={form.cityLabel}
          hasClientName={Boolean(form.clientName.trim())}
          hasClientEmail={Boolean(form.clientEmail.trim())}
          hasEmailError={Boolean(form.emailError)}
          hasCity={Boolean(form.city)}
          isSubmitting={form.isSubmitting}
          onSubmit={form.handleSubmit}
        />
      </div>
    </>
  )
}
