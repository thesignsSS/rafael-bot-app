import { useEffect, useState } from 'react'
import { AuthShell } from '../../layouts/AuthShell'
import { AuthHeader } from '../../components/ui/AuthHeader'
import { Card } from '../../components/ui/Card'
import { ForgotPasswordForm } from './components/ForgotPasswordForm'
import { ResetEmailConfirmScreen } from './components/ResetEmailConfirmScreen'

export default function RecuperarSenhaPage() {
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Rafael Bot - Recuperar senha'
  }, [])

  return (
    <AuthShell>
      <Card>
        <AuthHeader subtitle={pendingEmail ? undefined : 'Recuperar senha'} />
        {pendingEmail ? (
          <ResetEmailConfirmScreen email={pendingEmail} />
        ) : (
          <ForgotPasswordForm onEmailSent={setPendingEmail} />
        )}
      </Card>
    </AuthShell>
  )
}
