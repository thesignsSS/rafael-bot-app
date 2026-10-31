import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../../../../components/ui/Icon'
import { Modal } from '../../../../components/ui/Modal'
import { formatReais } from '../../../../lib/money'
import { PropertyPicker } from '../../../imoveis/components/PropertyPicker'
import { PropertyStatusPill } from '../../../imoveis/components/PropertyStatusPill'
import type { PropertyType } from '../../../home/types/proposal'
import type { ProposalPropertyController } from '../../hooks/useProposalProperty'
import { ProposalInfoField } from './ProposalInfoField'

type ProposalPropertyCardProps = {
  propertyType: PropertyType
  city: string
  state: string
  /** Imóvel cadastrado (BKL-093, seção 13). */
  linked: ProposalPropertyController
}

export function ProposalPropertyCard({
  propertyType,
  city,
  state,
  linked,
}: ProposalPropertyCardProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [confirmingRemoval, setConfirmingRemoval] = useState(false)
  const property = linked.view?.property ?? null
  const canChange = Boolean(linked.view?.canChange)

  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
      <div className="mb-4 flex items-center gap-2 text-primary">
        <Icon name="apartment" size={22} />
        <h3 className="text-headline-md font-semibold text-on-surface">
          Dados do Imóvel
        </h3>
      </div>

      {property ? (
        <div className="mb-5 rounded-lg border border-outline-variant/70 bg-surface-container-low p-4">
          <p className="text-label-md font-semibold text-on-surface">
            {property.street}
            {property.number ? `, ${property.number}` : ''}
          </p>
          <p className="text-body-sm text-on-surface-variant">
            {property.neighborhood} · {property.municipality}/{property.state}
          </p>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-body-sm text-on-surface-variant">
            <span>
              {property.typeLabel} · {formatReais(property.salePrice)} · {property.referenceCode}
            </span>
            <PropertyStatusPill status={property.status} label={property.statusLabel} />
          </p>
          {linked.view?.modalityWarning ? (
            <p className="mt-2 rounded-md bg-amber-50 p-2 text-body-sm text-amber-800">{linked.view.modalityWarning}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {/* 13.13: o detalhe respeita as permissões de quem abre. */}
            <Link
              to={`/imoveis/${property.id}`}
              className="flex min-h-10 items-center gap-1 rounded-lg border border-outline-variant px-3 text-sm font-semibold text-on-surface hover:border-primary"
            >
              <Icon name="open_in_new" size={18} />
              Ver imóvel
            </Link>
            {canChange ? (
              <>
                <button
                  type="button"
                  disabled={linked.isSaving}
                  onClick={() => setPickerOpen(true)}
                  className="min-h-10 rounded-lg border border-outline-variant px-3 text-sm font-semibold text-on-surface hover:border-primary disabled:opacity-60"
                >
                  Trocar imóvel
                </button>
                <button
                  type="button"
                  disabled={linked.isSaving}
                  onClick={() => setConfirmingRemoval(true)}
                  className="min-h-10 rounded-lg px-3 text-sm font-semibold text-on-surface-variant hover:text-error disabled:opacity-60"
                >
                  Remover
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : canChange ? (
        <button
          type="button"
          disabled={linked.isSaving}
          onClick={() => setPickerOpen(true)}
          className="mb-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-primary/60 text-sm font-semibold text-primary hover:bg-primary/5 disabled:opacity-60"
        >
          <Icon name="home_work" size={20} />
          Vincular imóvel cadastrado
        </button>
      ) : null}

      <div className="space-y-4">
        <ProposalInfoField label="Status do Imóvel" value={propertyType} />
        <ProposalInfoField label="Município" value={city} />
        <ProposalInfoField label="UF" value={state} />
      </div>

      {pickerOpen ? (
        <PropertyPicker
          context="proposta"
          selectedId={property?.id}
          onPick={(picked) => {
            setPickerOpen(false)
            void linked.change(picked.id)
          }}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}

      {confirmingRemoval && property ? (
        <Modal titleId="remover-imovel-proposta" title="Remover o imóvel da proposta?" onClose={() => setConfirmingRemoval(false)}>
          <p className="text-body-md text-on-surface-variant">
            A proposta continua, sem imóvel cadastrado. Se não houver outra proposta ativa com {property.referenceCode}, ele volta
            a Disponível.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirmingRemoval(false)}
              className="h-10 rounded-lg border border-outline-variant px-4 text-sm font-semibold text-on-surface"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmingRemoval(false)
                void linked.change(null)
              }}
              className="h-10 rounded-lg bg-error px-4 text-sm font-semibold text-on-error"
            >
              Remover imóvel
            </button>
          </div>
        </Modal>
      ) : null}
    </section>
  )
}
