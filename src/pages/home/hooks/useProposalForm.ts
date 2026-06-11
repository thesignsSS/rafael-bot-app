import { useCallback, useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../../../contexts/auth-context'
import { supabase } from '../../../lib/supabase'
import { fileKey } from '../lib/proposalUtils'
import {
  isSupportedFile,
  validateClientCpfValue,
  validateClientEmailValue,
  validateClientPhoneValue,
} from '../lib/proposalValidation'
import {
  filesToSubmissionDocuments,
  submitProposalToBot,
} from '../lib/submitProposal'
import type { PropertyType } from '../types/proposal'
import { useCityCombobox } from './useCityCombobox'

export function useProposalForm() {
  const navigate = useNavigate()
  const { currentUserProfile } = useAuth()
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
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      const unsupportedFiles = selectedFiles.filter((file) => !isSupportedFile(file))
      const supportedFiles = selectedFiles.filter(isSupportedFile)

      if (unsupportedFiles.length > 0) {
        toast.error(
          `Arquivo(s) com extensão não suportada: ${unsupportedFiles
            .map((file) => file.name)
            .join(', ')}`,
        )
      }

      setExtraFiles((currentFiles) => {
        const currentFileKeys = new Set(currentFiles.map(fileKey))
        const newFiles = supportedFiles.filter(
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

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) {
      return
    }

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

    const unsupportedFiles = extraFiles.filter((file) => !isSupportedFile(file))

    if (unsupportedFiles.length > 0) {
      toast.error('Remova arquivos com extensão não suportada antes de enviar.')
      return
    }

    try {
      setIsSubmitting(true)

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error('Sessão expirada. Faça login novamente para enviar a proposta.')
      }

      const brokerName =
        currentUserProfile?.fullName ||
        (typeof user.user_metadata.full_name === 'string'
          ? user.user_metadata.full_name
          : user.email ?? 'Corretor')

      const documents = await filesToSubmissionDocuments(extraFiles)

      const submission = await submitProposalToBot({
        brokerUserId: user.id,
        brokerName,
        clientName: clientName.trim(),
        formData: {
          'Nome do Cliente Completo': clientName.trim(),
          'CPF do Cliente': clientCpf.trim(),
          'Telefone do Cliente': clientPhone.trim(),
          'E-mail do Cliente': clientEmail.trim(),
          'Tipo do Imóvel': propertyType,
          'Município do Imóvel': cityCombobox.city,
          'UF do Imóvel': 'CE',
          'Informações Adicionais': additionalInfo.trim(),
        },
        documents,
      })

      if (!submission.proposalId) {
        throw new Error('Proposta criada sem identificador para abrir o detalhe.')
      }

      if (submission.savedClient === false) {
        toast.warning(
          'Arquivos enviados com sucesso, mas o cadastro do cliente não foi persistido.',
        )
      } else {
        const proposalLabel = submission.proposalCode
          ? ` ${submission.proposalCode}`
          : ''

        toast.success(
          `Proposta${proposalLabel} enviada com sucesso. Arquivos recebidos e cliente cadastrado.`,
        )
      }

      navigate(`/propostas/${submission.proposalId}`)
    } catch (error) {
      console.error('Falha ao enviar proposta para o bot:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Falha ao enviar documentação. Tente novamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }, [
    isSubmitting,
    clientName,
    clientCpf,
    clientPhone,
    clientEmail,
    propertyType,
    additionalInfo,
    extraFiles,
    cityCombobox.city,
    validateClientCpf,
    validateClientPhone,
    validateClientEmail,
    validateCity,
    currentUserProfile?.fullName,
    navigate,
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
    isSubmitting,
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
