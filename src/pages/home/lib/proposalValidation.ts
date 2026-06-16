import {
  emailPattern,
  getFileExtension,
  supportedFileExtensions,
} from './proposalUtils'

export function validateClientEmailValue(email: string): string | null {
  const trimmedEmail = email.trim()

  if (!trimmedEmail) {
    return 'Informe o e-mail do cliente.'
  }

  if (!emailPattern.test(trimmedEmail)) {
    return 'Digite um e-mail válido.'
  }

  return null
}

export function validateClientCpfValue(cpf: string): string | null {
  if (!cpf.trim()) {
    return 'Informe o CPF do cliente.'
  }

  return null
}

export function validateClientPhoneValue(phone: string): string | null {
  if (!phone.trim()) {
    return 'Informe o telefone do cliente.'
  }

  return null
}

export function validateCityValue(city: string): string | null {
  if (!city) {
    return 'Selecione o município do imóvel.'
  }

  return null
}

export function validateStateValue(state: string): string | null {
  if (!state.trim()) {
    return 'Selecione o estado do imóvel.'
  }

  return null
}

export function validateRequiredDocuments(files: File[]): string | null {
  if (files.length === 0) {
    return 'Anexe pelo menos um documento para enviar a proposta.'
  }

  return null
}

export function isSupportedFile(file: File) {
  const extension = getFileExtension(file.name)

  return supportedFileExtensions.some(
    (supportedExtension) => supportedExtension === extension,
  )
}
