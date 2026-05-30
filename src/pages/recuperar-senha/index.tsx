import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AuthShell } from '../../layouts/AuthShell'
import { Card } from '../../components/ui/Card'
import { LoginHeader } from '../login/components/LoginHeader'

export default function RecuperarSenhaPage() {
  useEffect(() => {
    document.title = 'Rafael Bot - Recuperar senha'
  }, [])

  return (
    <AuthShell>
      <Card>
        <LoginHeader />
        <div className="space-y-4 text-center">
          <h2 className="text-headline-md font-semibold text-on-surface">
            Recuperar senha
          </h2>
          <p className="text-body-md text-on-surface-variant">
            Em construção.
          </p>
          <Link
            to="/login"
            className="inline-block text-label-md font-medium text-primary hover:underline"
          >
            Voltar ao login
          </Link>
        </div>
      </Card>
    </AuthShell>
  )
}
