import { useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { Field } from '../../../components/ui/Field'
import { FormSection } from '../../../components/ui/FormSection'
import { Icon } from '../../../components/ui/Icon'
import { Modal } from '../../../components/ui/Modal'
import { MoneyInput } from '../../../components/ui/MoneyInput'
import type { PropertyPhotosController } from '../hooks/usePropertyPhotos'
import { usePropertyForm } from '../hooks/usePropertyForm'
import { PropertyPhotosSection } from './PropertyPhotosSection'
import { BRAZILIAN_STATES, PROPERTY_TYPE_OPTIONS, type Property } from '../types'

type PropertyFormProps = {
  /** Nulo = cadastro novo. */
  property: Property | null
  photos: PropertyPhotosController
  onSaved: (saved: Property) => void | Promise<void>
  onCancel: () => void
}

const inputClass = (error?: string) => `proposal-input ${error ? 'proposal-input-error' : ''}`

/** Cadastro e edição de imóvel (spec BKL-093, seção 8; protótipos 13, 18 e 20). */
export function PropertyForm({ property, photos, onSaved, onCancel }: PropertyFormProps) {
  const form = usePropertyForm(property, onSaved)
  const [confirmingCancel, setConfirmingCancel] = useState(false)
  const { values, errors } = form
  const isNew = property === null
  const typeLocked = !isNew && !property.permissions.canCorrectType
  const responsibleLocked = !isNew && !property.permissions.canTransfer

  // 8.12: formulário preenchido pede confirmação antes de descartar.
  // Fotos escolhidas e ainda não enviadas também contam (CA-11.8).
  const hasPendingPhotos = photos.local.length > 0
  const handleCancel = () => (form.isDirty || hasPendingPhotos ? setConfirmingCancel(true) : onCancel())

  return (
    <div className="pb-28">
      <div className="space-y-5">
        <FormSection icon="home_work" title="Dados principais">
          <fieldset aria-describedby="tipo-ajuda">
            <legend className="text-label-md font-semibold text-on-surface">
              Tipo do imóvel <span className="text-error" aria-hidden>*</span>
            </legend>
            <div className="mt-2 flex flex-wrap gap-2" role="radiogroup">
              {PROPERTY_TYPE_OPTIONS.map((option) => {
                const selected = values.type === option.value

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={typeLocked}
                    onClick={() => form.setField('type', option.value)}
                    className={`min-h-11 rounded-full border px-4 text-label-md font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                      selected
                        ? 'border-primary bg-primary text-on-primary'
                        : 'border-outline-variant bg-surface-container-lowest text-on-surface hover:border-primary'
                    }`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
            <p id="tipo-ajuda" className="mt-2 text-body-sm text-on-surface-variant">
              {typeLocked
                ? 'O tipo não muda depois do cadastro. Se estiver errado, peça ao administrador para corrigir.'
                : 'Escolha um. Ele define os documentos da engenharia.'}
            </p>
            {errors.type ? (
              <p className="mt-1 text-body-sm text-error" role="alert">
                {errors.type}
              </p>
            ) : null}
          </fieldset>

          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Valor de venda" required error={errors.salePrice}>
              <MoneyInput
                valueCents={values.salePriceCents}
                onChange={(cents) => form.setField('salePriceCents', cents)}
                hasError={Boolean(errors.salePrice)}
              />
            </Field>
            <Field label="Código de referência" hint="opcional, gerado se ficar em branco" error={errors.referenceCode}>
              <input
                value={values.referenceCode}
                onChange={(event) => form.setField('referenceCode', event.target.value)}
                maxLength={30}
                placeholder="Ex.: AP-0132"
                className={inputClass(errors.referenceCode)}
              />
            </Field>
            <Field label="Empreendimento ou construtora" hint="opcional" error={errors.developmentName}>
              <input
                value={values.developmentName}
                onChange={(event) => form.setField('developmentName', event.target.value)}
                maxLength={200}
                className={inputClass(errors.developmentName)}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection icon="location_on" title="Endereço">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-6">
            <div className="sm:col-span-2">
              <Field label="UF" required error={errors['address.state']}>
                <select
                  value={values.state}
                  onChange={(event) => form.setState(event.target.value)}
                  className={inputClass(errors['address.state'])}
                >
                  <option value="">Escolha</option>
                  {BRAZILIAN_STATES.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="sm:col-span-4">
              <Field label="Município" required error={errors['address.municipality']}>
                <select
                  value={values.municipalityIbgeCode}
                  onChange={(event) => form.setMunicipality(event.target.value)}
                  disabled={!values.state || form.municipalitiesState === 'loading'}
                  className={inputClass(errors['address.municipality'])}
                >
                  <option value="">
                    {!values.state
                      ? 'Escolha a UF primeiro'
                      : form.municipalitiesState === 'loading'
                        ? 'Carregando municípios…'
                        : 'Escolha o município'}
                  </option>
                  {/* Imóvel salvo sem código do IBGE (IBGE estava fora do ar) continua aparecendo. */}
                  {values.municipality && !values.municipalityIbgeCode ? (
                    <option value="">{values.municipality}</option>
                  ) : null}
                  {form.municipalities.map((item) => (
                    <option key={item.ibgeCode} value={item.ibgeCode}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </Field>
              {form.municipalitiesState === 'error' ? (
                <p className="mt-1 text-body-sm text-error" role="alert">
                  Não foi possível carregar os municípios.{' '}
                  <button type="button" onClick={form.retryMunicipalities} className="font-semibold underline">
                    Tentar de novo
                  </button>
                </p>
              ) : null}
            </div>
            <div className="sm:col-span-3">
              <Field label="Bairro" required error={errors['address.neighborhood']}>
                <input
                  value={values.neighborhood}
                  onChange={(event) => form.setField('neighborhood', event.target.value)}
                  className={inputClass(errors['address.neighborhood'])}
                />
              </Field>
            </div>
            <div className="sm:col-span-3">
              <Field label="CEP" hint="opcional" error={errors['address.postalCode']}>
                <input
                  value={values.postalCode}
                  onChange={(event) => form.setField('postalCode', event.target.value)}
                  inputMode="numeric"
                  maxLength={9}
                  placeholder="00000-000"
                  className={inputClass(errors['address.postalCode'])}
                />
              </Field>
            </div>
            <div className="sm:col-span-6">
              <Field label="Logradouro" required error={errors['address.street']}>
                <input
                  value={values.street}
                  onChange={(event) => form.setField('street', event.target.value)}
                  placeholder="Ex.: Rua Silva Jatahy"
                  className={inputClass(errors['address.street'])}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Número" hint="opcional" error={errors['address.number']}>
                <input
                  value={values.number}
                  onChange={(event) => form.setField('number', event.target.value)}
                  className={inputClass(errors['address.number'])}
                />
              </Field>
            </div>
            <div className="sm:col-span-4">
              <Field label="Complemento" hint="opcional" error={errors['address.complement']}>
                <input
                  value={values.complement}
                  onChange={(event) => form.setField('complement', event.target.value)}
                  placeholder="Ex.: Apto 1001"
                  className={inputClass(errors['address.complement'])}
                />
              </Field>
            </div>
          </div>
        </FormSection>

        <FormSection icon="badge" title="Corretor responsável">
          <Field
            label="Corretor responsável"
            error={errors.responsibleBrokerId}
            hint={responsibleLocked ? 'só o administrador transfere' : undefined}
          >
            <select
              value={values.responsibleBrokerId}
              onChange={(event) => form.setField('responsibleBrokerId', event.target.value)}
              disabled={responsibleLocked}
              className={inputClass(errors.responsibleBrokerId)}
            >
              {form.brokers.length === 0 && property ? (
                <option value={property.responsibleBrokerId}>{property.responsibleBroker.name ?? 'Corretor'}</option>
              ) : null}
              {form.brokers.map((broker) => (
                <option key={broker.id} value={broker.id}>
                  {broker.fullName ?? 'Sem nome'}
                </option>
              ))}
            </select>
          </Field>
          {isNew ? (
            <p className="mt-2 text-body-sm text-on-surface-variant">
              Vem preenchido com você. Se escolher outro corretor, ele passa a ser o dono do imóvel e você deixa de
              poder editá-lo.
            </p>
          ) : null}
        </FormSection>

        <PropertyPhotosSection controller={photos} />

        <FormSection icon="description" title="Mais dados do imóvel" optional>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Área privativa (m²)" hint="opcional" error={errors.privateAreaM2}>
              <input
                value={values.privateAreaM2}
                onChange={(event) => form.setField('privateAreaM2', event.target.value)}
                inputMode="decimal"
                className={inputClass(errors.privateAreaM2)}
              />
            </Field>
            <Field label="Área total (m²)" hint="terreno usa esta" error={errors.totalAreaM2}>
              <input
                value={values.totalAreaM2}
                onChange={(event) => form.setField('totalAreaM2', event.target.value)}
                inputMode="decimal"
                className={inputClass(errors.totalAreaM2)}
              />
            </Field>
            <Field label="Matrícula" hint="opcional" error={errors.registrationNumber}>
              <input
                value={values.registrationNumber}
                onChange={(event) => form.setField('registrationNumber', event.target.value)}
                className={inputClass(errors.registrationNumber)}
              />
            </Field>
          </div>

          <fieldset className="mt-5">
            <legend className="text-label-md font-semibold text-on-surface">Possui avaliação?</legend>
            <div className="mt-2 flex gap-2" role="radiogroup">
              {[
                { value: false, label: 'Não' },
                { value: true, label: 'Sim' },
              ].map((option) => (
                <button
                  key={option.label}
                  type="button"
                  role="radio"
                  aria-checked={values.hasAppraisal === option.value}
                  onClick={() => form.setHasAppraisal(option.value)}
                  className={`min-h-11 rounded-full border px-5 text-label-md font-semibold transition-colors ${
                    values.hasAppraisal === option.value
                      ? 'border-primary bg-primary text-on-primary'
                      : 'border-outline-variant bg-surface-container-lowest text-on-surface hover:border-primary'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Valor avaliado" required={values.hasAppraisal} error={errors.appraisalValue}>
              <MoneyInput
                valueCents={values.appraisalValueCents}
                onChange={(cents) => form.setField('appraisalValueCents', cents)}
                disabled={!values.hasAppraisal}
                hasError={Boolean(errors.appraisalValue)}
              />
            </Field>
            <Field label="Validade da avaliação" required={values.hasAppraisal} error={errors.appraisalValidUntil}>
              <input
                type="date"
                value={values.appraisalValidUntil}
                onChange={(event) => form.setField('appraisalValidUntil', event.target.value)}
                disabled={!values.hasAppraisal}
                className={inputClass(errors.appraisalValidUntil)}
              />
            </Field>
          </div>

          <div className="mt-5">
            <Field label="Observações internas" hint="só a equipe vê" error={errors.internalNotes}>
              <textarea
                value={values.internalNotes}
                onChange={(event) => form.setField('internalNotes', event.target.value)}
                rows={4}
                maxLength={5000}
                className={`${inputClass(errors.internalNotes)} !h-auto py-3`}
              />
            </Field>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              Todos os corretores da imobiliária veem este campo. Não inclua dados do vendedor.
            </p>
          </div>
        </FormSection>
      </div>

      {/* Barra de ação fixa (tela de tarefa). */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-outline-variant/60 bg-surface-container-lowest/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          {form.formError ? (
            <p className="flex items-center gap-2 text-body-sm text-error sm:mr-auto" role="alert">
              <Icon name="error" size={18} />
              {form.formError}
            </p>
          ) : null}
          <button
            type="button"
            onClick={handleCancel}
            className="h-[var(--control-height)] rounded-lg border border-outline-variant px-6 text-sm font-semibold text-on-surface hover:border-primary"
          >
            Cancelar
          </button>
          <Button loading={form.isSubmitting} onClick={() => void form.submit()} className="sm:!w-auto sm:px-8">
            Salvar imóvel
          </Button>
        </div>
      </div>

      {confirmingCancel ? (
        <Modal titleId="descartar-imovel" title="Descartar o que foi preenchido?" onClose={() => setConfirmingCancel(false)}>
          <p className="text-body-md text-on-surface-variant">
            {isNew
              ? 'O imóvel não será cadastrado e as fotos escolhidas não serão enviadas.'
              : 'As alterações não salvas serão perdidas.'}
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirmingCancel(false)}
              className="h-10 rounded-lg border border-outline-variant px-4 text-sm font-semibold text-on-surface"
            >
              Continuar editando
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="h-10 rounded-lg bg-error px-4 text-sm font-semibold text-on-error"
            >
              Descartar
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
