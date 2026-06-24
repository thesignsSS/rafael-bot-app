import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'
import { useAuth } from '../../../../contexts/auth-context'
import { Icon } from '../../../../components/ui/Icon'
import { filesToSubmissionDocuments } from '../../../home/lib/submitProposal'
import {
  deleteProposalDocument,
  fetchProposalDetail,
  updateProposal,
  uploadProposalDocuments,
} from '../../lib/proposalsApi'
import type { ProposalDetail } from '../../types/proposal-detail'
import { DASHBOARD_HEADER_FEEDBACK_EVENT } from '../../../../lib/dashboard-header-feedback'

const PRODUCT_OPTIONS = [
  'Conta',
  'Cartão',
  'Portabilidade de salário',
  'Seguridade',
  'Open finance',
  'Cadastramento de chave Pix',
  'Investimento',
  'Outro',
] as const

const INCOME_TYPE_OPTIONS = [
  'Renda formal',
  'Renda informal',
  'Renda mista',
] as const

const COMMON_DOCUMENT_FIELDS = [
  {
    id: 'registration_form',
    label: 'Ficha cadastro',
    instructions: 'Anexe a ficha cadastro com ocupação e telefones atualizados.',
  },
  {
    id: 'identity_document',
    label: 'Documento de identidade do(s) cliente(s)',
    instructions: 'Anexe os documentos de identidade de todos os clientes envolvidos.',
  },
] as const

const FORMAL_INCOME_DOCUMENT_FIELDS = [
  {
    id: 'formal_income_document',
    label: 'Documento de renda formal',
    instructions:
      'Anexe contracheque, IRPF original e retificadoras, comprovantes de DARFs e demais comprovantes formais, quando houver.',
  },
] as const

const INFORMAL_INCOME_DOCUMENT_FIELDS = [
  {
    id: 'informal_income_document',
    label: 'Documento de comprovação de renda informal',
    instructions:
      'Anexe extratos dos últimos 6 meses de todas as contas correntes e outros documentos que comprovem renda, como notas fiscais e contratos de prestação de serviços.',
  },
] as const

const PJ_DOCUMENT_FIELDS = [
  {
    id: 'pj_income_document',
    label: 'Documentos para renda oriunda de PJ',
    instructions:
      'Anexe contrato social e alterações, extratos da conta PJ, IRPJ, PGDAS ou ECF.',
    optional: true,
  },
] as const

const PROFESSIONAL_DOCUMENT_FIELDS = [
  {
    id: 'professional_registry_document',
    label: 'Registro no conselho de classe',
    instructions:
      'Anexe o comprovante de registro no respectivo conselho de classe, se o cliente possuir.',
    optional: true,
  },
] as const

const INCOME_VALIDATION_FORM_DATA_KEY = 'validacao_renda'

function formatCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, '')

  if (!digits) {
    return ''
  }

  const amount = Number(digits) / 100

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount)
}

type ProposalIncomeValidationFormProps = {
  proposal: ProposalDetail
  isAdmin: boolean
  isFinalized: boolean
  onFinalize: () => void
  onPersistedFormDataChange?: (formData: Record<string, unknown>) => void
}

type DocumentFieldConfig = {
  id: string
  label: string
  instructions: string
  optional?: boolean
}

type SavedIncomeValidationDocument = {
  id?: string
  name: string
  sizeBytes?: number
}

type DocumentFieldFiles = Record<string, SavedIncomeValidationDocument[]>

type SavedIncomeValidationData = {
  products?: string[]
  propertyValidationType?: 'Individual' | 'Na Planta'
  propertyValue?: string
  downPaymentValue?: string
  financingInstallmentValue?: string
  builderInstallmentValue?: string
  postSignatureValue?: string
  activityDescription?: string
  incomeType?: (typeof INCOME_TYPE_OPTIONS)[number]
  documentsByField?: DocumentFieldFiles
  finalized?: boolean
}

function isSavedIncomeValidationData(
  value: unknown,
): value is SavedIncomeValidationData {
  return typeof value === 'object' && value !== null
}

function resolveIncomeValidationProducts(
  savedIncomeValidationData: SavedIncomeValidationData | null,
) {
  if (
    Array.isArray(savedIncomeValidationData?.products) &&
    savedIncomeValidationData.products.length > 0
  ) {
    const filteredProducts = savedIncomeValidationData.products.filter(
      (item): item is (typeof PRODUCT_OPTIONS)[number] =>
        PRODUCT_OPTIONS.includes(item as (typeof PRODUCT_OPTIONS)[number]),
    )

    if (filteredProducts.length > 0) {
      return filteredProducts
    }
  }

  return ['Conta'] as Array<(typeof PRODUCT_OPTIONS)[number]>
}

export function ProposalIncomeValidationForm({
  proposal,
  isAdmin,
  isFinalized,
  onFinalize,
  onPersistedFormDataChange,
}: ProposalIncomeValidationFormProps) {
  const { user } = useAuth()
  const savedIncomeValidationData = isSavedIncomeValidationData(
    proposal.formData?.[INCOME_VALIDATION_FORM_DATA_KEY],
  )
    ? (proposal.formData[INCOME_VALIDATION_FORM_DATA_KEY] as SavedIncomeValidationData)
    : null
  const [products, setProducts] = useState<Array<(typeof PRODUCT_OPTIONS)[number]>>(
    resolveIncomeValidationProducts(savedIncomeValidationData),
  )
  const [propertyValidationType, setPropertyValidationType] = useState<
    'Individual' | 'Na Planta'
  >(savedIncomeValidationData?.propertyValidationType ?? 'Individual')
  const [propertyValue, setPropertyValue] = useState(
    savedIncomeValidationData?.propertyValue ?? '',
  )
  const [downPaymentValue, setDownPaymentValue] = useState(
    savedIncomeValidationData?.downPaymentValue ?? '',
  )
  const [financingInstallmentValue, setFinancingInstallmentValue] = useState(
    savedIncomeValidationData?.financingInstallmentValue ?? '',
  )
  const [builderInstallmentValue, setBuilderInstallmentValue] = useState(
    savedIncomeValidationData?.builderInstallmentValue ?? '',
  )
  const [postSignatureValue, setPostSignatureValue] = useState(
    savedIncomeValidationData?.postSignatureValue ?? '',
  )
  const [activityDescription, setActivityDescription] = useState(
    savedIncomeValidationData?.activityDescription ?? '',
  )
  const [incomeType, setIncomeType] = useState<
    (typeof INCOME_TYPE_OPTIONS)[number]
  >(savedIncomeValidationData?.incomeType ?? 'Renda formal')
  const [documentFiles, setDocumentFiles] = useState<DocumentFieldFiles>(
    savedIncomeValidationData?.documentsByField ?? {},
  )
  const [uploadingFieldIds, setUploadingFieldIds] = useState<string[]>([])
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false)
  const [autosaveState, setAutosaveState] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle')
  const hasHydratedAutosaveRef = useRef(false)
  const isHydratingFromProposalRef = useRef(false)
  const baseFormDataRef = useRef(proposal.formData ?? {})
  const autosaveTimeoutRef = useRef<number | null>(null)
  const persistIncomeValidationDataRef = useRef<
    ((overrides?: Partial<SavedIncomeValidationData>) => Promise<void>) | null
  >(null)
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const isFeedbackVisibleRef = useRef(false)
  const hasScheduledAutosaveRef = useRef(false)
  const pendingSaveRequestsRef = useRef(0)

  const propertyCity = proposal.property.city
  const clientEmail = proposal.client.email
  const clientPhone = proposal.client.phone

  const showHeaderFeedback = () => {
    if (isFeedbackVisibleRef.current) {
      return
    }

    isFeedbackVisibleRef.current = true
    window.dispatchEvent(
      new CustomEvent(DASHBOARD_HEADER_FEEDBACK_EVENT, {
        detail: {
          visible: true,
          message: 'Salvo com sucesso.',
        },
      }),
    )
  }

  const hideHeaderFeedbackIfFinished = () => {
    if (hasScheduledAutosaveRef.current || pendingSaveRequestsRef.current > 0) {
      return
    }

    if (!isFeedbackVisibleRef.current) {
      return
    }

    isFeedbackVisibleRef.current = false
    window.dispatchEvent(
      new CustomEvent(DASHBOARD_HEADER_FEEDBACK_EVENT, {
        detail: { visible: false },
      }),
    )
  }

  const markAutosaveScheduled = () => {
    hasScheduledAutosaveRef.current = true
    showHeaderFeedback()
  }

  const beginSaveRequest = () => {
    pendingSaveRequestsRef.current += 1
    showHeaderFeedback()
  }

  const finishSaveRequest = () => {
    pendingSaveRequestsRef.current = Math.max(0, pendingSaveRequestsRef.current - 1)
    hideHeaderFeedbackIfFinished()
  }

  const handleCurrencyChange =
    (setter: (value: string) => void) => (event: ChangeEvent<HTMLInputElement>) => {
      setter(formatCurrencyInput(event.target.value))
    }

  const handleFilesChange =
    (fieldId: string) => async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? [])
    event.target.value = ''

    if (selectedFiles.length === 0) {
      return
    }

    if (!user?.id) {
      toast.error('Usuário não autenticado para salvar documentos.')
      return
    }

    try {
      setAutosaveState('saving')
      setUploadingFieldIds((currentFieldIds) =>
        currentFieldIds.includes(fieldId) ? currentFieldIds : [...currentFieldIds, fieldId],
      )
      beginSaveRequest()
      const documents = await filesToSubmissionDocuments(selectedFiles)
      await uploadProposalDocuments(proposal.id, user.id, documents)

      const updatedProposal = await fetchProposalDetail(proposal.id, user.id)

      const usedIds = new Set(
        Object.values(documentFiles)
          .flat()
          .map((document) => document.id)
          .filter((id): id is string => typeof id === 'string' && id.length > 0),
      )

      const uploadedEntries = selectedFiles.map((file) => {
        const matchedDocument = updatedProposal.documents.find((document) => {
          if (usedIds.has(document.id)) {
            return false
          }

          return document.originalFilename === file.name
        })

        if (matchedDocument) {
          usedIds.add(matchedDocument.id)
        }

        return {
          id: matchedDocument?.id,
          name: file.name,
          sizeBytes: matchedDocument?.sizeBytes ?? file.size,
        }
      })

      markAutosaveScheduled()
      setDocumentFiles((currentFiles) => ({
        ...currentFiles,
        [fieldId]: [...(currentFiles[fieldId] ?? []), ...uploadedEntries],
      }))
      toast.success(
        selectedFiles.length === 1
          ? 'Documento salvo automaticamente.'
          : 'Documentos salvos automaticamente.',
      )
    } catch (uploadError) {
      setAutosaveState('error')
      toast.error(
        uploadError instanceof Error
          ? uploadError.message
          : 'Não foi possível salvar os documentos.',
      )
    } finally {
      setUploadingFieldIds((currentFieldIds) =>
        currentFieldIds.filter((currentFieldId) => currentFieldId !== fieldId),
      )
      finishSaveRequest()
    }
  }

  const openFilePicker = (fieldId: string) => {
    inputRefs.current[fieldId]?.click()
  }

  const removeDocument = async (fieldId: string, targetIndex: number) => {
    const targetDocument = (documentFiles[fieldId] ?? [])[targetIndex]

    if (!targetDocument) {
      return
    }

    if (targetDocument.id && user?.id) {
      try {
        setAutosaveState('saving')
        beginSaveRequest()
        await deleteProposalDocument(proposal.id, targetDocument.id, user.id)
      } catch (deleteError) {
        toast.error(
          deleteError instanceof Error
            ? deleteError.message
            : 'Não foi possível remover o documento.',
        )
        return
      } finally {
        finishSaveRequest()
      }
    }

    markAutosaveScheduled()
    setDocumentFiles((currentFiles) => ({
      ...currentFiles,
      [fieldId]: (currentFiles[fieldId] ?? []).filter(
        (_, index) => index !== targetIndex,
      ),
    }))
  }

  const incomeSpecificDocumentFields: DocumentFieldConfig[] =
    incomeType === 'Renda formal'
      ? [...FORMAL_INCOME_DOCUMENT_FIELDS]
      : incomeType === 'Renda informal'
      ? [
          ...INFORMAL_INCOME_DOCUMENT_FIELDS,
          ...PJ_DOCUMENT_FIELDS,
          ...PROFESSIONAL_DOCUMENT_FIELDS,
        ]
      : [
          ...FORMAL_INCOME_DOCUMENT_FIELDS,
          ...INFORMAL_INCOME_DOCUMENT_FIELDS,
          ...PJ_DOCUMENT_FIELDS,
          ...PROFESSIONAL_DOCUMENT_FIELDS,
        ]

  const documentFields: DocumentFieldConfig[] = [
    ...COMMON_DOCUMENT_FIELDS,
    ...incomeSpecificDocumentFields,
  ]
  const areBaseFieldsFilled =
    products.length > 0 &&
    propertyValue.trim().length > 0 &&
    downPaymentValue.trim().length > 0 &&
    financingInstallmentValue.trim().length > 0 &&
    activityDescription.trim().length > 0 &&
    incomeType.trim().length > 0
  const arePlantFieldsFilled =
    propertyValidationType !== 'Na Planta' ||
    (builderInstallmentValue.trim().length > 0 &&
      postSignatureValue.trim().length > 0)
  const areDocumentsFilled = documentFields.every(
    (field) => field.optional || (documentFiles[field.id] ?? []).length > 0,
  )
  const canFinalizeIncomeValidation =
    !isAdmin && !isFinalized && areBaseFieldsFilled && arePlantFieldsFilled && areDocumentsFilled
  const isFormLocked = isFinalized && !isAdmin

  const buildSavedIncomeValidationData =
    (): SavedIncomeValidationData => ({
      products,
      propertyValidationType,
      propertyValue,
      downPaymentValue,
      financingInstallmentValue,
      builderInstallmentValue,
      postSignatureValue,
      activityDescription,
      incomeType,
      documentsByField: documentFiles,
      finalized: isFinalized,
    })

  const buildNextIncomeValidationFormData = (
    overrides?: Partial<SavedIncomeValidationData>,
  ) => {
    const nextData = {
      ...buildSavedIncomeValidationData(),
      ...overrides,
    }

    return {
      nextData,
      nextFormData: {
        ...baseFormDataRef.current,
        [INCOME_VALIDATION_FORM_DATA_KEY]: nextData,
      },
    }
  }

  const persistIncomeValidationData = async (
    overrides?: Partial<SavedIncomeValidationData>,
  ) => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado para salvar a validação de renda.')
    }

    const { nextFormData } = buildNextIncomeValidationFormData(overrides)

    await updateProposal(proposal.id, {
      brokerUserId: user.id,
      brokerPhone: proposal.brokerPhone.trim(),
      clientName: proposal.client.name.trim(),
      clientCpf: proposal.client.cpf.trim(),
      clientEmail: proposal.client.email.trim(),
      clientPhone: proposal.client.phone.trim(),
      propertyType: proposal.property.type,
      propertyCity: proposal.property.city.trim(),
      propertyState: proposal.property.state.trim(),
      additionalInfo: proposal.additionalInfo.trim(),
      formData: nextFormData,
    })

    baseFormDataRef.current = nextFormData
    onPersistedFormDataChange?.(nextFormData)
  }

  const finalizeIncomeValidation = async () => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado para finalizar a validação de renda.')
    }

    if (autosaveTimeoutRef.current !== null) {
      window.clearTimeout(autosaveTimeoutRef.current)
      autosaveTimeoutRef.current = null
    }

    hasScheduledAutosaveRef.current = false

    const { nextFormData } = buildNextIncomeValidationFormData({ finalized: true })

    await updateProposal(proposal.id, {
      brokerUserId: user.id,
      formData: nextFormData,
    })

    baseFormDataRef.current = nextFormData
    onPersistedFormDataChange?.(nextFormData)
  }

  persistIncomeValidationDataRef.current = persistIncomeValidationData

  useEffect(() => {
    baseFormDataRef.current = proposal.formData ?? {}
  }, [proposal.formData])

  useEffect(() => {
    isHydratingFromProposalRef.current = true
    setProducts(resolveIncomeValidationProducts(savedIncomeValidationData))
    setPropertyValidationType(
      savedIncomeValidationData?.propertyValidationType ?? 'Individual',
    )
    setPropertyValue(savedIncomeValidationData?.propertyValue ?? '')
    setDownPaymentValue(savedIncomeValidationData?.downPaymentValue ?? '')
    setFinancingInstallmentValue(
      savedIncomeValidationData?.financingInstallmentValue ?? '',
    )
    setBuilderInstallmentValue(
      savedIncomeValidationData?.builderInstallmentValue ?? '',
    )
    setPostSignatureValue(savedIncomeValidationData?.postSignatureValue ?? '')
    setActivityDescription(savedIncomeValidationData?.activityDescription ?? '')
    setIncomeType(savedIncomeValidationData?.incomeType ?? 'Renda formal')
    setDocumentFiles(savedIncomeValidationData?.documentsByField ?? {})
  }, [proposal.id, savedIncomeValidationData])

  useEffect(() => {
    if (!hasHydratedAutosaveRef.current) {
      hasHydratedAutosaveRef.current = true
      return
    }

    if (isHydratingFromProposalRef.current) {
      isHydratingFromProposalRef.current = false
      return
    }

    if (!user?.id || isFormLocked) {
      return
    }

    if (autosaveTimeoutRef.current !== null) {
      window.clearTimeout(autosaveTimeoutRef.current)
    }

    setAutosaveState('saving')
    markAutosaveScheduled()

    autosaveTimeoutRef.current = window.setTimeout(async () => {
      autosaveTimeoutRef.current = null
      hasScheduledAutosaveRef.current = false
      beginSaveRequest()

      try {
        await persistIncomeValidationData()
        setAutosaveState('saved')
      } catch (autosaveError) {
        setAutosaveState('error')
        toast.error(
          autosaveError instanceof Error
            ? autosaveError.message
            : 'Não foi possível salvar a validação de renda.',
        )
      } finally {
        finishSaveRequest()
      }
    }, 800)

    return () => {
      if (autosaveTimeoutRef.current !== null) {
        window.clearTimeout(autosaveTimeoutRef.current)
      }
    }
  }, [
    activityDescription,
    builderInstallmentValue,
    documentFiles,
    downPaymentValue,
    incomeType,
    isFormLocked,
    isFinalized,
    postSignatureValue,
    products,
    propertyValidationType,
    propertyValue,
    proposal.additionalInfo,
    proposal.brokerPhone,
    proposal.client.cpf,
    proposal.client.email,
    proposal.client.name,
    proposal.client.phone,
    proposal.id,
    proposal.property.city,
    proposal.property.state,
    proposal.property.type,
    financingInstallmentValue,
    user?.id,
  ])

  useEffect(() => {
    return () => {
      const shouldFlushPendingAutosave =
        autosaveTimeoutRef.current !== null &&
        hasScheduledAutosaveRef.current &&
        !!user?.id &&
        !isFormLocked &&
        persistIncomeValidationDataRef.current !== null

      if (autosaveTimeoutRef.current !== null) {
        window.clearTimeout(autosaveTimeoutRef.current)
        autosaveTimeoutRef.current = null
      }

      if (shouldFlushPendingAutosave) {
        hasScheduledAutosaveRef.current = false
        void persistIncomeValidationDataRef.current?.().catch(() => undefined)
      }

      hasScheduledAutosaveRef.current = false
      pendingSaveRequestsRef.current = 0

      if (isFeedbackVisibleRef.current) {
        isFeedbackVisibleRef.current = false
        window.dispatchEvent(
          new CustomEvent(DASHBOARD_HEADER_FEEDBACK_EVENT, {
            detail: { visible: false },
          }),
        )
      }
    }
  }, [isFormLocked, user?.id])

  const toggleProduct = (option: (typeof PRODUCT_OPTIONS)[number]) => {
    if (isFormLocked) {
      return
    }

    setProducts((currentProducts) =>
      currentProducts.includes(option)
        ? currentProducts.filter((item) => item !== option)
        : [...currentProducts, option],
    )
  }

  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-2 text-primary">
        <Icon name="fact_check" size={22} />
        <h3 className="text-headline-md font-semibold text-on-surface">
          Validação de Renda
        </h3>
      </div>

      <p className="mt-2 text-body-sm text-on-surface-variant">
        Preencha as informações obrigatórias desta etapa e organize a documentação
        que será anexada ao processo.
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div className="flex h-full flex-col gap-2">
          <span className="text-label-md font-semibold text-on-surface">
            Produto
          </span>
          <div className="flex-1 rounded-xl border border-outline-variant bg-surface p-3">
            <div className="grid gap-2 sm:grid-cols-2">
              {PRODUCT_OPTIONS.map((option) => {
                const isSelected = products.includes(option)

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleProduct(option)}
                    aria-pressed={isSelected}
                    disabled={isFormLocked}
                    className={`flex min-h-9 items-center justify-between gap-2 rounded-lg border px-2.5 py-2 text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-outline-variant bg-surface-container-lowest text-on-surface hover:border-primary/50'
                    } ${isFormLocked ? 'cursor-not-allowed opacity-60' : ''}`}
                  >
                    <span className="text-body-sm">{option}</span>
                    <span
                      className={`flex h-4 w-4 flex-none items-center justify-center rounded-full border transition-all ${
                        isSelected
                          ? 'border-primary bg-primary text-white'
                          : 'border-outline-variant text-transparent'
                      }`}
                    >
                      <Icon name="check" size={12} />
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex h-full flex-col gap-2">
          <span className="text-label-md font-semibold text-on-surface">
            Informações extras
          </span>
          <div className="flex-1 rounded-xl border border-outline-variant bg-surface p-3">
            <div className="space-y-3 rounded-lg bg-surface-container-low px-3 py-3">
              <div>
                <p className="text-label-sm font-semibold text-on-surface-variant">
                  Localização do imóvel
                </p>
                <p className="mt-1 text-body-sm text-on-surface">{propertyCity}</p>
              </div>

              <div>
                <p className="text-label-sm font-semibold text-on-surface-variant">
                  E-mail do cliente
                </p>
                <p className="mt-1 break-all text-body-sm text-on-surface">
                  {clientEmail}
                </p>
              </div>

              <div>
                <p className="text-label-sm font-semibold text-on-surface-variant">
                  Telefone do cliente
                </p>
                <p className="mt-1 text-body-sm text-on-surface">{clientPhone}</p>
              </div>
            </div>
          </div>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-label-md font-semibold text-on-surface">
            Valor do imóvel
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={propertyValue}
            onChange={handleCurrencyChange(setPropertyValue)}
            disabled={isFormLocked}
            placeholder="R$ 0,00"
            className="rounded-xl border border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-label-md font-semibold text-on-surface">
            Valor da entrada
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={downPaymentValue}
            onChange={handleCurrencyChange(setDownPaymentValue)}
            disabled={isFormLocked}
            placeholder="R$ 0,00"
            className="rounded-xl border border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-label-md font-semibold text-on-surface">
            Prestação do financiamento
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={financingInstallmentValue}
            onChange={handleCurrencyChange(setFinancingInstallmentValue)}
            disabled={isFormLocked}
            placeholder="R$ 0,00"
            className="rounded-xl border border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-label-md font-semibold text-on-surface">
            Tipo do imóvel
          </span>
          <div className="flex flex-col gap-3 sm:flex-row">
          {(['Individual', 'Na Planta'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setPropertyValidationType(option)}
              disabled={isFormLocked}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-label-md font-semibold transition-all ${
                propertyValidationType === option
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-primary/50'
              } ${isFormLocked ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                  propertyValidationType === option
                    ? 'border-primary bg-primary text-white'
                    : 'border-outline-variant'
                }`}
              >
                {propertyValidationType === option ? (
                  <span className="h-2 w-2 rounded-full bg-white" />
                ) : null}
              </span>
              {option}
            </button>
          ))}
        </div>
        </div>
      </div>

      {propertyValidationType === 'Na Planta' ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-label-md font-semibold text-on-surface">
              Valor da prestação a ser paga à construtora
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={builderInstallmentValue}
              onChange={handleCurrencyChange(setBuilderInstallmentValue)}
              disabled={isFormLocked}
              placeholder="R$ 0,00"
              className="rounded-xl border border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-label-md font-semibold text-on-surface">
              Valor pago após assinatura do contrato
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={postSignatureValue}
              onChange={handleCurrencyChange(setPostSignatureValue)}
              disabled={isFormLocked}
              placeholder="R$ 0,00"
              className="rounded-xl border border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
        </div>
      ) : null}

      <div className="mt-6 grid gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-label-md font-semibold text-on-surface">
            Descrição detalhada da atividade
          </span>
          <textarea
            value={activityDescription}
            onChange={(event) =>
              setActivityDescription(event.target.value.slice(0, 10000))
            }
            disabled={isFormLocked}
            rows={8}
            maxLength={10000}
            placeholder="Descreva a atividade que gera a renda do cliente, ocupação e telefones atualizados."
            className="rounded-xl border border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <span className="text-right text-body-sm text-on-surface-variant">
            {activityDescription.length}/10000 caracteres
          </span>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-label-md font-semibold text-on-surface">
            Tipo de renda
          </span>
          <select
            value={incomeType}
            onChange={(event) =>
              setIncomeType(
                event.target.value as (typeof INCOME_TYPE_OPTIONS)[number],
              )
            }
            disabled={isFormLocked}
            className="rounded-xl border border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {INCOME_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 rounded-xl border border-outline-variant bg-surface-container-low p-5">
        <div className="flex items-center gap-2 text-primary">
          <Icon name="attach_file" size={20} />
          <h4 className="text-label-lg font-semibold text-on-surface">
            Documentos
          </h4>
        </div>

        <p className="mt-2 text-body-sm text-on-surface-variant">
          Anexe a documentação necessária para a etapa de validação de renda.
        </p>

        <div className="mt-4 rounded-xl border border-outline-variant bg-surface-container p-4">
          <p className="text-label-md font-semibold text-on-surface">
            Instruções para envio
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-body-sm text-on-surface-variant">
            <li>Anexe os documentos de identidade de todos os clientes da proposta.</li>
            <li>Inclua os comprovantes de renda conforme o tipo de renda selecionado.</li>
          </ul>
        </div>

        <div className="mt-5 grid gap-4">
          {documentFields.map((field) => {
            const files = documentFiles[field.id] ?? []
            const isUploading = uploadingFieldIds.includes(field.id)

            return (
              <div
                key={field.id}
                className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4"
              >
                <div className="flex flex-col gap-2">
                  <p className="text-label-md font-semibold text-on-surface">
                    {field.label}
                    {field.optional ? (
                      <span className="ml-2 text-body-sm font-medium text-on-surface-variant">
                        (opcional)
                      </span>
                    ) : null}
                  </p>
                  <p className="text-body-sm text-on-surface-variant">
                    {field.instructions}
                  </p>
                </div>

                <input
                  ref={(element) => {
                    inputRefs.current[field.id] = element
                  }}
                  type="file"
                  className="sr-only"
                  disabled={isFormLocked}
                  onChange={handleFilesChange(field.id)}
                />

                {files.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => openFilePicker(field.id)}
                    disabled={isFormLocked || isUploading}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-outline px-4 py-3 text-label-md font-semibold text-primary transition-all hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Icon
                      name={isUploading ? 'progress_activity' : 'upload_file'}
                      size={20}
                      className={isUploading ? 'animate-spin' : undefined}
                    />
                    {isUploading ? 'Enviando arquivo...' : 'Adicionar arquivo'}
                  </button>
                ) : null}

                <div className="mt-4 rounded-xl border border-dashed border-outline-variant bg-surface p-4">
                  {isUploading ? (
                    <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-3 text-primary">
                      <Icon
                        name="progress_activity"
                        size={18}
                        className="animate-spin"
                      />
                      <div>
                        <p className="text-body-md font-medium">Enviando documento...</p>
                        <p className="text-body-sm text-on-surface-variant">
                          Aguarde a conclusao do upload para continuar.
                        </p>
                      </div>
                    </div>
                  ) : files.length > 0 ? (
                    <div className="space-y-3">
                      {files.map((document, index) => (
                        <div
                          key={`${field.id}-${document.id ?? document.name}-${index}`}
                          className="flex items-center justify-between gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-body-md font-medium text-on-surface">
                              {document.name}
                            </p>
                            <p className="text-body-sm text-on-surface-variant">
                              {(((document.sizeBytes ?? 0) || 0) / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          {!isFinalized ? (
                            <button
                              type="button"
                              onClick={() => void removeDocument(field.id, index)}
                              disabled={isFormLocked}
                              className="rounded-lg p-2 text-on-surface-variant transition-all hover:bg-error/10 hover:text-error"
                              aria-label={`Remover ${document.name}`}
                            >
                              <Icon name="delete" size={18} />
                            </button>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-body-md text-on-surface-variant">
                      Nenhum arquivo adicionado para este item.
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4 rounded-xl border border-primary/30 bg-primary/10 p-4 shadow-[0px_8px_24px_rgba(0,0,0,0.08)]">
          <p className="text-label-md font-semibold text-on-surface">
            Fluxo de validação
          </p>
          <p className="mt-2 text-body-md font-medium text-on-surface">
            A validação será realizada mediante contato com o cliente. Em um
            segundo momento, haverá o atendimento comercial presencial ou por
            telefone.
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-body-sm text-on-surface-variant">
            {autosaveState === 'saving'
              ? 'Salvando automaticamente...'
              : autosaveState === 'saved'
              ? 'Dados salvos automaticamente.'
              : autosaveState === 'error'
              ? 'Falha ao salvar automaticamente.'
              : 'As alterações desta etapa são salvas automaticamente.'}
          </p>
        </div>

        {!isAdmin ? (
          <div className="mt-6 flex flex-col items-end gap-2">
            {isFinalized ? (
              <p className="text-body-sm text-primary">
                Validação de renda finalizada. Esta etapa não pode mais ser alterada.
              </p>
            ) : (
              <p className="text-body-sm text-on-surface-variant">
                O botão será liberado quando todos os campos e documentos forem preenchidos.
              </p>
            )}

            <div className="flex flex-wrap justify-end gap-3">
              {!isFinalized ? (
                <button
                  type="button"
                  disabled={!canFinalizeIncomeValidation}
                  onClick={() => setIsFinalizeModalOpen(true)}
                  className="rounded-xl bg-primary px-5 py-3 text-label-md font-semibold text-on-primary transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Finalizar
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {isAdmin && isFinalized ? (
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              className="rounded-xl bg-primary px-5 py-3 text-label-md font-semibold text-on-primary transition-all hover:bg-primary-container"
            >
              Enviar
            </button>
          </div>
        ) : null}
      </div>

      {isFinalizeModalOpen
        ? createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
          <div className="w-full max-w-xl rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0px_24px_60px_rgba(0,0,0,0.25)]">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-orange-500/16 p-2 text-orange-400">
                <Icon name="warning" size={22} />
              </div>
              <div className="flex-1">
                <h4 className="text-title-lg font-semibold text-on-surface">
                  Confirmar finalização
                </h4>
                <p className="mt-2 text-body-md text-on-surface-variant">
                  Se a validação de renda for finalizada, não poderá ser alterada e
                  será disponibilizada para envio.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsFinalizeModalOpen(false)}
                className="rounded-xl border border-outline px-4 py-2.5 text-label-md font-semibold text-on-surface transition-all hover:bg-surface-container"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    setAutosaveState('saving')
                    beginSaveRequest()
                    await finalizeIncomeValidation()
                    setAutosaveState('saved')
                    onFinalize()
                    setIsFinalizeModalOpen(false)
                  } catch (finalizeError) {
                    setAutosaveState('error')
                    toast.error(
                      finalizeError instanceof Error
                        ? finalizeError.message
                        : 'Não foi possível finalizar a validação de renda.',
                    )
                  } finally {
                    finishSaveRequest()
                  }
                }}
                className="rounded-xl bg-primary px-4 py-2.5 text-label-md font-semibold text-on-primary transition-all hover:bg-primary-container"
              >
                Confirmar finalização
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )
        : null}
    </section>
  )
}
