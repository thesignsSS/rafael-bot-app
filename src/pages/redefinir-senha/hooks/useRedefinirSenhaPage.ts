import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { usePasswordRecoveryAccess } from '../../../hooks/usePasswordRecoveryAccess'

export function useRedefinirSenhaPage() {
  useDocumentTitle('Rafael Bot - Redefinir senha')

  const accessStatus = usePasswordRecoveryAccess()

  return { accessStatus }
}
