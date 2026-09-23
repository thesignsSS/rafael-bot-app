import { useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'
import { useAuth } from '../../contexts/auth-context'
import { supabase } from '../../lib/supabase'

export function ForcePasswordChangeModal() {
  const { user } = useAuth()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (isSubmitting || !user?.email) {
      return
    }

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
      setIsSubmitting(true)

      const { error: sameCredentialError } = await supabase.auth.signInWithPassword(
        {
          email: user.email,
          password: normalizedPassword,
        },
      )

      if (!sameCredentialError) {
        toast.error('A nova senha não pode ser igual à senha atual.')
        return
      }

      const { error } = await supabase.auth.updateUser({
        password: normalizedPassword,
        data: {
          ...(user.user_metadata ?? {}),
          must_change_password: false,
        },
      })

      if (error) {
        throw error
      }

      toast.success('Senha alterada com sucesso.')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Não foi possível alterar sua senha.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#131b2e]/70 p-3 backdrop-blur-sm sm:p-6"
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="force-password-change-title"
        className="w-full max-w-md rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_28px_80px_rgba(0,0,0,0.32)]"
      >
        <h2
          id="force-password-change-title"
          className="text-headline-md font-semibold text-on-surface"
        >
          Defina sua nova senha
        </h2>
        <p className="mt-2 text-body-sm text-on-surface-variant">
          Por segurança, você precisa trocar a senha temporária antes de
          continuar. Escolha uma nova senha, diferente da atual, para acessar
          o Effectus.
        </p>

        <form className="mt-5 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <label className="block">
            <span className="mb-2 block text-label-md font-semibold text-on-surface">
              Nova senha
            </span>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Mínimo de 6 caracteres"
              required
              autoFocus
              className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-label-md font-semibold text-on-surface">
              Confirmar nova senha
            </span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repita a nova senha"
              required
              className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary px-5 py-2.5 text-label-md font-semibold text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar e continuar'}
            </button>
          </div>
        </form>
      </section>
    </div>,
    document.body,
  )
}
