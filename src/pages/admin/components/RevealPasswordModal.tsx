import { useState } from 'react'
import { toast } from 'sonner'
import { Icon } from '../../../components/ui/Icon'
import { Modal } from '../../../components/ui/Modal'

type RevealPasswordModalProps = {
  title: string
  description: string
  password: string
  onClose: () => void
}

export function RevealPasswordModal({
  title,
  description,
  password,
  onClose,
}: RevealPasswordModalProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      toast.success('Senha copiada.')
    } catch {
      toast.error('Não foi possível copiar automaticamente. Selecione o texto.')
    }
  }

  return (
    <Modal titleId="reveal-password-title" title={title} onClose={onClose}>
      <p className="text-body-sm text-on-surface-variant">{description}</p>

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3">
        <code className="flex-1 select-all break-all text-body-lg font-semibold text-on-surface">
          {password}
        </code>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary-container"
          aria-label="Copiar senha"
          title="Copiar"
        >
          <Icon name={copied ? 'check' : 'content_copy'} size={20} />
        </button>
      </div>

      <p className="mt-3 text-body-sm text-amber-500">
        Essa senha só aparece agora. Se fechar sem copiar, será preciso
        redefini-la de novo.
      </p>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-primary px-5 py-2.5 text-label-md font-semibold text-on-primary transition-colors hover:bg-primary-container"
        >
          Já copiei, fechar
        </button>
      </div>
    </Modal>
  )
}
