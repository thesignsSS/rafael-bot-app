import { useCallback, useState, type ChangeEvent } from 'react'
import { toast } from 'sonner'
import { fileKey } from '../lib/proposalUtils'
import {
  validateClientCpfValue,
  validateClientEmailValue,
  validateClientPhoneValue,
} from '../lib/proposalValidation'
import type { PropertyType } from '../types/proposal'
import { useCityCombobox } from './useCityCombobox'

export function useProposalForm() {
  const cityCombobox = useCityCombobox()

  const [clientName, setClientName] = useState('')
  const [clientCpf, setClientCpf] = useState('')
  const [clientCpfError, setClientCpfError] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientPhoneError, setClientPhoneError] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [propertyType, setPropertyType] = useState<PropertyType>('Novo')
  const [extraFiles, setExtraFiles] = useState<File[]>([])
  const [additionalInfo, setAdditionalInfo] = useState('')

  const handleClientCpfChange = useCallback(
    (value: string) => {
      setClientCpf(value)
      if (clientCpfError) {
        setClientCpfError('')
      }
    },
    [clientCpfError],
  )

  const handleClientPhoneChange = useCallback(
    (value: string) => {
      setClientPhone(value)
      if (clientPhoneError) {
        setClientPhoneError('')
      }
    },
    [clientPhoneError],
  )

  const handleClientEmailChange = useCallback(
    (value: string) => {
      setClientEmail(value)
      if (emailError) {
        setEmailError('')
      }
    },
    [emailError],
  )

  const validateClientEmail = useCallback(() => {
    const error = validateClientEmailValue(clientEmail)
    setEmailError(error ?? '')
    return error === null
  }, [clientEmail])

  const validateClientCpf = useCallback(() => {
    const error = validateClientCpfValue(clientCpf)
    setClientCpfError(error ?? '')
    return error === null
  }, [clientCpf])

  const validateClientPhone = useCallback(() => {
    const error = validateClientPhoneValue(clientPhone)
    setClientPhoneError(error ?? '')
    return error === null
  }, [clientPhone])

  const handleExtraFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(event.target.files ?? [])

      setExtraFiles((currentFiles) => {
        const currentFileKeys = new Set(currentFiles.map(fileKey))
        const newFiles = selectedFiles.filter(
          (file) => !currentFileKeys.has(fileKey(file)),
        )

        return [...currentFiles, ...newFiles]
      })

      event.target.value = ''
    },
    [],
  )

  const removeExtraFile = useCallback((fileToRemove: File) => {
    setExtraFiles((currentFiles) =>
      currentFiles.filter((file) => fileKey(file) !== fileKey(fileToRemove)),
    )
  }, [])

  const { validateCity } = cityCombobox

  const handleSubmit = useCallback(() => {
    if (!clientName.trim()) {
      toast.error('Informe o nome do cliente para enviar a documentação.')
      return
    }

    if (!validateClientCpf()) {
      toast.error('Informe o CPF do cliente antes de enviar.')
      return
    }

    if (!validateClientPhone()) {
      toast.error('Informe o telefone do cliente antes de enviar.')
      return
    }

    if (!validateClientEmail()) {
      toast.error('Revise o e-mail do cliente antes de enviar.')
      return
    }

    if (!validateCity()) {
      toast.error('Selecione o município do imóvel antes de enviar.')
      return
    }

    toast.success('Documentação pronta para análise.')
  }, [
    clientName,
    validateClientCpf,
    validateClientPhone,
    validateClientEmail,
    validateCity,
  ])

  const clientLabel = clientName.trim() || 'Ainda não informado'
  const emailLabel = clientEmail.trim() || 'Ainda não informado'

  return {
    clientName,
    setClientName,
    clientCpf,
    clientCpfError,
    clientPhone,
    clientPhoneError,
    clientEmail,
    emailError,
    propertyType,
    setPropertyType,
    extraFiles,
    additionalInfo,
    setAdditionalInfo,
    clientLabel,
    emailLabel,
    handleClientCpfChange,
    handleClientPhoneChange,
    handleClientEmailChange,
    validateClientCpf,
    validateClientPhone,
    validateClientEmail,
    handleExtraFileChange,
    removeExtraFile,
    handleSubmit,
    ...cityCombobox,
  }
}
