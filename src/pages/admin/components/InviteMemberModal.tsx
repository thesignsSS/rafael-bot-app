import { useState, type FormEvent } from 'react'
import { Modal } from '../../../components/ui/Modal'
import type { TeamRole } from '../lib/teamApi'

type InviteMemberModalProps = {
  onClose: () => void
  onSubmit: (input: { email: string; fullName: string; role: TeamRole }) => Promise<void>
}

export function InviteMemberModal({ onClose, onSubmit }: InviteMemberModalProps) {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<TeamRole>('broker')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!email.trim() || !fullName.trim() || isSubmitting) {
      return
    }

    try {
      setIsSubmitting(true)
      await onSubmit({ email: email.trim(), fullName: fullName.trim(), role })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      titleId="invite-member-title"
      title="Convidar usuário"
      onClose={onClose}
    >
      <p className="text-body-sm text-on-surface-variant">
        O Effectus gera uma senha temporária. Ela aparece na próxima tela, uma
        única vez — copie e envie para a pessoa convidada.
      </p>

      <form className="mt-5 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
        <label className="block">
          <span className="mb-2 block text-label-md font-semibold text-on-surface">
            Nome completo
          </span>
          <input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Nome da pessoa convidada"
            required
            className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-label-md font-semibold text-on-surface">
            E-mail
          </span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="pessoa@email.com"
            required
            className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-label-md font-semibold text-on-surface">
            Papel
          </span>
          <select
            value={role}
            onChange={(event) =>
              setRole(event.target.value === 'admin' ? 'admin' : 'broker')
            }
            className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="broker">Corretor</option>
            <option value="admin">Administrador</option>
          </select>
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-outline px-5 py-2.5 text-label-md font-semibold text-primary transition-colors hover:bg-surface-container"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-primary px-5 py-2.5 text-label-md font-semibold text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Convidando...' : 'Convidar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
