import type {
  FormSubmissionDocument,
  SubmitFormPayload,
  SubmitFormResponse,
} from '../types/proposal'

const formSubmissionApiUrl = import.meta.env.VITE_FORM_SUBMISSION_API_URL
const formSubmissionApiKey = import.meta.env.VITE_FORM_SUBMISSION_API_KEY

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const result = String(reader.result)
      const base64 = result.includes(',') ? result.split(',')[1] : result
      resolve(base64)
    }

    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export async function filesToSubmissionDocuments(
  files: File[],
): Promise<FormSubmissionDocument[]> {
  return Promise.all(
    files.map(async (file) => ({
      filename: file.name,
      contentBase64: await fileToBase64(file),
    })),
  )
}

export async function submitProposalToBot(payload: SubmitFormPayload) {
  if (!formSubmissionApiUrl) {
    throw new Error('URL de envio do formulário não configurada.')
  }

  if (!formSubmissionApiKey) {
    throw new Error('Chave de API de envio do formulário não configurada.')
  }

  const response = await fetch(formSubmissionApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${formSubmissionApiKey}`,
    },
    body: JSON.stringify(payload),
  })

  const data = (await response.json().catch(() => null)) as
    | SubmitFormResponse
    | null

  if (response.status !== 201 || data?.ok !== true) {
    throw new Error(getSubmissionErrorMessage(response.status, data?.error))
  }

  return data
}

function getSubmissionErrorMessage(status: number, apiError?: string) {
  if (apiError) {
    return apiError
  }

  if (status === 400) {
    return 'Dados inválidos. Revise o formulário e os arquivos anexados.'
  }

  if (status === 401) {
    return 'Não autorizado. Verifique a chave de API configurada.'
  }

  if (status === 404) {
    return 'Endpoint de envio não encontrado.'
  }

  if (status >= 500) {
    return 'Falha no servidor do bot. Tente novamente em instantes.'
  }

  if (status >= 200 && status < 300) {
    return 'Resposta inesperada do servidor do bot.'
  }

  return 'Falha ao enviar documentação.'
}
