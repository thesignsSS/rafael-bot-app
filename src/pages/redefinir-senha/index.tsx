import { useEffect } from 'react'
import { AuthShell } from '../../layouts/AuthShell'
import { AuthHeader } from '../../components/ui/AuthHeader'
import { Card } from '../../components/ui/Card'
import { usePasswordRecoveryAccess } from '../../hooks/usePasswordRecoveryAccess'
import { ResetPasswordForm } from './components/ResetPasswordForm'

export default function RedefinirSenhaPage() {
  const accessStatus = usePasswordRecoveryAccess()

  useEffect(() => {
    document.title = 'Rafael Bot - Redefinir senha'
  }, [])

  if (accessStatus === 'checking' || accessStatus === 'denied') {
    return null
  }

  return (
    <AuthShell>
      <Card>
        <AuthHeader subtitle="Redefinir senha" />
        <ResetPasswordForm />
      </Card>
    </AuthShell>
  )
}
