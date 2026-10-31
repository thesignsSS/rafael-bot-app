import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../../contexts/auth-context'
import {
  PropertyApiError,
  createProperty,
  fetchBrokers,
  fetchMunicipalities,
  updateProperty,
} from '../lib/propertiesApi'
import type { Broker, FieldErrors, Municipality, Property, PropertyPayload, PropertyType } from '../types'

export type PropertyFormValues = {
  type: PropertyType | ''
  salePriceCents: number
  referenceCode: string
  developmentName: string
  state: string
  municipality: string
  municipalityIbgeCode: string
  neighborhood: string
  street: string
  number: string
  complement: string
  postalCode: string
  responsibleBrokerId: string
  privateAreaM2: string
  totalAreaM2: string
  registrationNumber: string
  hasAppraisal: boolean
  appraisalValueCents: number
  appraisalValidUntil: string
  internalNotes: string
}

function initialValues(property: Property | null, currentUserId: string): PropertyFormValues {
  return {
    // Nenhum tipo vem marcado no cadastro (8.3, CA-8.1).
    type: property?.type ?? '',
    salePriceCents: property ? Math.round(property.salePrice * 100) : 0,
    referenceCode: property?.referenceCode ?? '',
    developmentName: property?.developmentName ?? '',
    state: property?.address.state ?? '',
    municipality: property?.address.municipality ?? '',
    municipalityIbgeCode: property?.address.municipalityIbgeCode ?? '',
    neighborhood: property?.address.neighborhood ?? '',
    street: property?.address.street ?? '',
    number: property?.address.number ?? '',
    complement: property?.address.complement ?? '',
    postalCode: property?.address.postalCode ?? '',
    // Vem preenchido com quem cadastra (8.9).
    responsibleBrokerId: property?.responsibleBrokerId ?? currentUserId,
    privateAreaM2: property?.privateAreaM2?.toString() ?? '',
    totalAreaM2: property?.totalAreaM2?.toString() ?? '',
    registrationNumber: property?.registrationNumber ?? '',
    hasAppraisal: Boolean(property?.appraisal),
    appraisalValueCents: property?.appraisal ? Math.round(property.appraisal.value * 100) : 0,
    appraisalValidUntil: property?.appraisal?.validUntil ?? '',
    internalNotes: property?.internalNotes ?? '',
  }
}

/** Mesmas regras do bot (validação no servidor é a que vale); aqui só evita ida e volta. */
function validate(values: PropertyFormValues): FieldErrors {
  const errors: FieldErrors = {}

  if (!values.type) errors.type = 'Escolha o tipo do imóvel'
  if (values.salePriceCents <= 0) errors.salePrice = 'Informe o valor de venda'
  if (!values.state) errors['address.state'] = 'Escolha a UF'
  if (!values.municipality) errors['address.municipality'] = 'Escolha o município'
  if (!values.neighborhood.trim()) errors['address.neighborhood'] = 'Informe o bairro'
  if (!values.street.trim()) errors['address.street'] = 'Informe o logradouro'

  const cep = values.postalCode.replace(/\D/g, '')
  if (cep && cep.length !== 8) errors['address.postalCode'] = 'O CEP precisa ter 8 números'

  if (values.hasAppraisal) {
    if (values.appraisalValueCents <= 0) errors.appraisalValue = 'Informe o valor avaliado'
    if (!values.appraisalValidUntil) errors.appraisalValidUntil = 'Informe até quando a avaliação vale'
  }

  return errors
}

function toPayload(values: PropertyFormValues): PropertyPayload {
  const optional = (value: string) => (value.trim() ? value.trim() : null)
  const area = (value: string) => (value.trim() ? Number(value.replace(',', '.')) : null)

  return {
    referenceCode: optional(values.referenceCode),
    type: values.type || null,
    salePrice: values.salePriceCents / 100,
    developmentName: optional(values.developmentName),
    address: {
      state: values.state,
      municipality: values.municipality,
      municipalityIbgeCode: optional(values.municipalityIbgeCode),
      neighborhood: values.neighborhood.trim(),
      street: values.street.trim(),
      number: optional(values.number),
      complement: optional(values.complement),
      postalCode: optional(values.postalCode),
    },
    privateAreaM2: area(values.privateAreaM2),
    totalAreaM2: area(values.totalAreaM2),
    registrationNumber: optional(values.registrationNumber),
    hasAppraisal: values.hasAppraisal,
    appraisalValue: values.hasAppraisal ? values.appraisalValueCents / 100 : null,
    appraisalValidUntil: values.hasAppraisal ? values.appraisalValidUntil : null,
    internalNotes: optional(values.internalNotes),
    responsibleBrokerId: optional(values.responsibleBrokerId),
  }
}

export function usePropertyForm(property: Property | null, onSaved: (saved: Property) => void | Promise<void>) {
  const { currentUserProfile } = useAuth()
  const currentUserId = currentUserProfile?.id ?? ''
  const [initial] = useState(() => initialValues(property, currentUserId))
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [brokers, setBrokers] = useState<Broker[]>([])
  const [municipalities, setMunicipalities] = useState<Municipality[]>([])
  const [municipalitiesState, setMunicipalitiesState] = useState<'idle' | 'loading' | 'error'>('idle')

  const isDirty = useMemo(() => JSON.stringify(values) !== JSON.stringify(initial), [values, initial])

  useEffect(() => {
    fetchBrokers()
      .then(setBrokers)
      .catch(() => setBrokers([]))
  }, [])

  const loadMunicipalities = useCallback((state: string) => {
    if (!state) {
      setMunicipalities([])
      return
    }

    setMunicipalitiesState('loading')
    fetchMunicipalities(state)
      .then((items) => {
        setMunicipalities(items)
        setMunicipalitiesState('idle')
      })
      .catch(() => setMunicipalitiesState('error'))
  }, [])

  useEffect(() => {
    loadMunicipalities(initial.state)
  }, [initial.state, loadMunicipalities])

  const setField = useCallback(<K extends keyof PropertyFormValues>(key: K, value: PropertyFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
  }, [])

  /** UF manda no município (8.2): trocar a UF limpa o município escolhido. */
  const setState = useCallback(
    (state: string) => {
      setValues((current) => ({ ...current, state, municipality: '', municipalityIbgeCode: '' }))
      loadMunicipalities(state)
    },
    [loadMunicipalities],
  )

  const setMunicipality = useCallback(
    (ibgeCode: string) => {
      const found = municipalities.find((item) => item.ibgeCode === ibgeCode)
      setValues((current) => ({
        ...current,
        municipality: found?.name ?? '',
        municipalityIbgeCode: found?.ibgeCode ?? '',
      }))
    },
    [municipalities],
  )

  /** 8.7: com "Não", valor e validade voltam a ficar vazios. */
  const setHasAppraisal = useCallback((hasAppraisal: boolean) => {
    setValues((current) => ({
      ...current,
      hasAppraisal,
      appraisalValueCents: hasAppraisal ? current.appraisalValueCents : 0,
      appraisalValidUntil: hasAppraisal ? current.appraisalValidUntil : '',
    }))
  }, [])

  const submit = useCallback(async () => {
    const localErrors = validate(values)
    setErrors(localErrors)
    setFormError(null)

    if (Object.keys(localErrors).length > 0) {
      setFormError('Confira os campos destacados')
      return
    }

    setIsSubmitting(true)

    try {
      const payload = toPayload(values)
      const saved = property ? await updateProperty(property.id, payload) : await createProperty(payload)
      await onSaved(saved)
    } catch (error) {
      if (error instanceof PropertyApiError) {
        setErrors(error.fields)
        setFormError(error.message)
      } else {
        setFormError('Não foi possível salvar. Confira sua conexão e tente de novo.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [onSaved, property, values])

  return {
    values,
    errors,
    formError,
    isSubmitting,
    isDirty,
    brokers,
    municipalities,
    municipalitiesState,
    setField,
    setState,
    setMunicipality,
    setHasAppraisal,
    retryMunicipalities: () => loadMunicipalities(values.state),
    submit,
  }
}
