import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { usePasswordRecoveryAccess } from '../../../hooks/usePasswordRecoveryAccess'

export function useRedefinirSenhaPage() {
  useDocumentTitle('Effectus - Redefinir senha')

  const accessStatus = usePasswordRecoveryAccess()

  return { accessStatus }
}
