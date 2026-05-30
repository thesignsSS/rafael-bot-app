import { useState } from 'react'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'

export function useCadastroPage() {
  useDocumentTitle('Rafael Bot - Cadastro')

  const [pendingEmail, setPendingEmail] = useState<string | null>(null)

  return { pendingEmail, onSignupPending: setPendingEmail }
}
