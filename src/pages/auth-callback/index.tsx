import { AuthShell } from '../../layouts/AuthShell'
import { useAutoLoginCallback } from '../../hooks/useAutoLoginCallback'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

export default function AuthCallbackPage() {
  useDocumentTitle('Effectus - Entrando')
  useAutoLoginCallback()

  return (
    <AuthShell>
      <p className="text-body-md text-on-surface-variant">Entrando...</p>
    </AuthShell>
  )
}
