import { useEffect, useState } from 'react'
import { AuthShell } from '../../layouts/AuthShell'
import { AuthHeader } from '../../components/ui/AuthHeader'
import { Card } from '../../components/ui/Card'
import { CadastroForm } from './components/CadastroForm'
import { SignupConfirmScreen } from './components/SignupConfirmScreen'

export default function CadastroPage() {
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Rafael Bot - Cadastro'
  }, [])

  return (
    <AuthShell>
      <Card>
        <AuthHeader subtitle={pendingEmail ? undefined : 'Crie sua conta'} />
        {pendingEmail ? (
          <SignupConfirmScreen email={pendingEmail} />
        ) : (
          <CadastroForm onSignupPending={setPendingEmail} />
        )}
      </Card>
    </AuthShell>
  )
}
