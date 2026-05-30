import { useState } from 'react'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'

export function useRecuperarSenhaPage() {
  useDocumentTitle('Rafael Bot - Recuperar senha')

  const [pendingEmail, setPendingEmail] = useState<string | null>(null)

  return { pendingEmail, onEmailSent: setPendingEmail }
}
