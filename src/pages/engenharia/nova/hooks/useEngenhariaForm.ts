import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../../../../contexts/auth-context'
import { formatBrazilianPhone } from '../../../../lib/phone'
import { supabase } from '../../../../lib/supabase'
import {
  formatPropertyValueInput,
  parsePropertyValueToNumber,
} from '../../lib/engenhariaUtils'
import {
  getMissingDocumentLabels,
  validateAccompanyingNameValue,
  validateContactValue,
  validatePropertyKindValue,
  validatePropertyValueValue,
} from '../../lib/engenhariaValidation'
import {
  documentsToSubmissionPayload,
  submitEngenhariaRequest,
} from '../lib/submitEngenhariaRequest'
import type { PropertyKind } from '../../types/engenharia'

export function useEngenhariaForm() {
  const { currentUserProfile } = useAuth()
  const navigate = useNavigate()

  const [propertyKind, setPropertyKind] = useState<PropertyKind | ''>('')
  const [propertyKindError, setPropertyKindError] = useState('')
  const [propertyValue, setPropertyValue] = useState('')
  const [propertyValueError, setPropertyValueError] = useState('')
  const [contact, setContact] = useState('')
  const [contactError, setContactError] = useState('')
  const [accompanyingName, setAccompanyingName] = useState('')
  const [accompanyingNameError, setAccompanyingNameError] = useState('')
  const [documents, setDocuments] = useState<Partial<Record<string, File>>>({})
  const [documentsError, setDocumentsError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePropertyKindChange = useCallback((value: PropertyKind | '') => {
    setPropertyKind(value)
    setPropertyKindError('')
    setDocumentsError('')
  }, [])

  const handlePropertyValueChange = useCallback((value: string) => {
    setPropertyValue(formatPropertyValueInput(value))
    setPropertyValueError('')
  }, [])

  const handleContactChange = useCallback((value: string) => {
    setContact(formatBrazilianPhone(value))
    setContactError('')
  }, [])

  const handleAccompanyingNameChange = useCallback((value: string) => {
    setAccompanyingName(value)
    setAccompanyingNameError('')
  }, [])

  const setDocument = useCallback((key: string, file: File) => {
    setDocuments((currentDocuments) => ({ ...currentDocuments, [key]: file }))
    setDocumentsError('')
  }, [])

  const removeDocument = useCallback((key: string) => {
    setDocuments((currentDocuments) => {
      const nextDocuments = { ...currentDocuments }
      delete nextDocuments[key]
      return nextDocuments
    })
  }, [])

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) {
      return
    }

    const kindError = validatePropertyKindValue(propertyKind)
    setPropertyKindError(kindError ?? '')

    const valueError = validatePropertyValueValue(propertyValue)
    setPropertyValueError(valueError ?? '')

    const contactValidationError = validateContactValue(contact)
    setContactError(contactValidationError ?? '')

    const nameError = validateAccompanyingNameValue(accompanyingName)
    setAccompanyingNameError(nameError ?? '')

    const missingDocuments = getMissingDocumentLabels(propertyKind, documents)
    const missingDocumentsError = missingDocuments.length
      ? `Anexe: ${missingDocuments.join(', ')}.`
      : ''
    setDocumentsError(missingDocumentsError)

    if (
      kindError ||
      valueError ||
      contactValidationError ||
      nameError ||
      missingDocumentsError ||
      !propertyKind
    ) {
      toast.error('Revise os campos destacados antes de enviar.')
      return
    }

    try {
      setIsSubmitting(true)

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error('Sessão expirada. Faça login novamente para enviar a solicitação.')
      }

      const brokerName =
        currentUserProfile?.fullName ||
        (typeof user.user_metadata.full_name === 'string'
          ? user.user_metadata.full_name
          : user.email ?? 'Corretor')

      const documentsPayload = await documentsToSubmissionPayload(documents)

      const result = await submitEngenhariaRequest({
        brokerUserId: user.id,
        brokerName,
        propertyKind,
        propertyValue: parsePropertyValueToNumber(propertyValue),
        contactPhone: contact.trim(),
        accompanyingName: accompanyingName.trim(),
        documents: documentsPayload,
      })

      const requestLabel = result.requestCode ? ` ${result.requestCode}` : ''
      toast.success(
        `Solicitação de engenharia${requestLabel} enviada com sucesso.`,
      )

      navigate('/engenharia')
    } catch (error) {
      console.error('Falha ao enviar solicitação de engenharia:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Falha ao enviar a solicitação de engenharia. Tente novamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }, [
    isSubmitting,
    propertyKind,
    propertyValue,
    contact,
    accompanyingName,
    documents,
    currentUserProfile?.fullName,
    navigate,
  ])

  return {
    propertyKind,
    propertyKindError,
    propertyValue,
    propertyValueError,
    contact,
    contactError,
    accompanyingName,
    accompanyingNameError,
    documents,
    documentsError,
    isSubmitting,
    handlePropertyKindChange,
    handlePropertyValueChange,
    handleContactChange,
    handleAccompanyingNameChange,
    setDocument,
    removeDocument,
    handleSubmit,
  }
}
