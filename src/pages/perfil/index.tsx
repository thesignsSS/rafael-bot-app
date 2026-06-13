import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../../contexts/auth-context'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { supabase } from '../../lib/supabase'

export default function PerfilPage() {
  const { user, currentUserProfile, role, refreshProfile } = useAuth()
  const [fullName, setFullName] = useState(currentUserProfile?.fullName ?? '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  useDocumentTitle('Meu Perfil | Effectus')

  useEffect(() => {
    setFullName(currentUserProfile?.fullName ?? '')
  }, [currentUserProfile?.fullName])

  const email = user?.email ?? 'Não informado'
  const roleLabel = useMemo(
    () => (role === 'admin' ? 'Administrador' : 'Corretor'),
    [role],
  )
  const hasNameChanges = fullName.trim() !== (currentUserProfile?.fullName ?? '').trim()

  async function handleSaveProfile() {
    const normalizedFullName = fullName.trim()

    if (normalizedFullName.length < 3) {
      toast.error('Informe um nome com pelo menos 3 caracteres.')
      return
    }

    if (!user) {
      toast.error('Sessão expirada. Faça login novamente.')
      return
    }

    try {
      setIsSavingProfile(true)

      const nextMetadata = {
        ...(user.user_metadata ?? {}),
        full_name: normalizedFullName,
      }

      const [
        { error: authError },
        { error: profileError },
        { error: proposalsError },
      ] = await Promise.all([
        supabase.auth.updateUser({
          data: nextMetadata,
        }),
        supabase
          .from('profiles')
          .update({
            full_name: normalizedFullName,
          })
          .eq('id', user.id),
        supabase
          .from('proposals')
          .update({
            broker_name: normalizedFullName,
          })
          .eq('broker_user_id', user.id),
      ])

      if (authError) {
        throw authError
      }

      if (profileError) {
        throw profileError
      }

      if (proposalsError) {
        throw proposalsError
      }

      await refreshProfile()
      toast.success('Nome atualizado com sucesso.')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Não foi possível atualizar seu perfil.',
      )
    } finally {
      setIsSavingProfile(false)
    }
  }

  async function handleUpdatePassword() {
    const normalizedPassword = newPassword.trim()

    if (normalizedPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }

    if (normalizedPassword !== confirmPassword.trim()) {
      toast.error('A confirmação de senha não confere.')
      return
    }

    try {
      setIsSavingPassword(true)

      const { error } = await supabase.auth.updateUser({
        password: normalizedPassword,
      })

      if (error) {
        throw error
      }

      setNewPassword('')
      setConfirmPassword('')
      toast.success('Senha atualizada com sucesso.')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Não foi possível atualizar sua senha.',
      )
    } finally {
      setIsSavingPassword(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl animate-fade-up space-y-6">
      <section className="rounded-[28px] border border-outline-variant bg-[linear-gradient(135deg,#ffffff_0%,#f5f8ff_100%)] p-6 shadow-[0px_10px_32px_rgba(19,27,46,0.08)] sm:p-8">
        <p className="text-label-sm font-semibold uppercase tracking-[0.16em] text-primary/80">
          Perfil
        </p>
        <h1 className="mt-2 text-headline-xl font-semibold text-on-surface">
          Gerencie seus dados de acesso
        </h1>
        <p className="mt-3 max-w-2xl text-body-md text-on-surface-variant">
          Atualize o nome exibido no sistema e redefina sua senha sem sair do fluxo
          de trabalho.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-headline-md font-semibold text-on-surface">
                Dados do perfil
              </h2>
              <p className="mt-2 text-body-sm text-on-surface-variant">
                Esse nome aparece no cabeçalho, no chat e nos registros operacionais.
              </p>
            </div>

            <span className="rounded-full bg-primary-container px-3 py-1 text-label-sm font-semibold text-on-primary-container">
              {roleLabel}
            </span>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="profile-email"
                className="mb-2 block text-label-md font-semibold text-on-surface"
              >
                E-mail
              </label>
              <input
                id="profile-email"
                value={email}
                disabled
                className="w-full rounded-xl border border-outline-variant bg-surface-container px-4 py-3 text-body-md text-on-surface-variant outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="profile-full-name"
                className="mb-2 block text-label-md font-semibold text-on-surface"
              >
                Nome completo
              </label>
              <input
                id="profile-full-name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Seu nome completo"
                className="w-full rounded-xl border border-outline-variant bg-white px-4 py-3 text-body-md text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => void handleSaveProfile()}
                disabled={isSavingProfile || !hasNameChanges}
                className="rounded-xl bg-primary px-5 py-3 text-label-md font-semibold text-on-primary transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSavingProfile ? 'Salvando...' : 'Salvar nome'}
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
          <h2 className="text-headline-md font-semibold text-on-surface">
            Redefinir senha
          </h2>
          <p className="mt-2 text-body-sm text-on-surface-variant">
            Escolha uma nova senha para continuar acessando o Effectus com mais
            segurança.
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="profile-new-password"
                className="mb-2 block text-label-md font-semibold text-on-surface"
              >
                Nova senha
              </label>
              <input
                id="profile-new-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Digite a nova senha"
                className="w-full rounded-xl border border-outline-variant bg-white px-4 py-3 text-body-md text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label
                htmlFor="profile-confirm-password"
                className="mb-2 block text-label-md font-semibold text-on-surface"
              >
                Confirmar nova senha
              </label>
              <input
                id="profile-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repita a nova senha"
                className="w-full rounded-xl border border-outline-variant bg-white px-4 py-3 text-body-md text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="rounded-xl border border-outline-variant bg-surface p-4">
              <p className="text-body-sm text-on-surface-variant">
                Dica: use pelo menos 6 caracteres e evite repetir senhas usadas em
                outros sistemas.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => void handleUpdatePassword()}
                disabled={isSavingPassword || !newPassword.trim() || !confirmPassword.trim()}
                className="rounded-xl bg-primary px-5 py-3 text-label-md font-semibold text-on-primary transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSavingPassword ? 'Atualizando...' : 'Atualizar senha'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
