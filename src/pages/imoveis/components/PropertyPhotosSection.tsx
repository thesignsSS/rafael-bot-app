import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { FormSection } from '../../../components/ui/FormSection'
import { Icon } from '../../../components/ui/Icon'
import { Modal } from '../../../components/ui/Modal'
import type { PropertyPhotosController } from '../hooks/usePropertyPhotos'
import type { PropertyPhoto } from '../lib/propertiesApi'
import { MAX_PHOTOS_PER_PROPERTY, PHOTO_ACCEPT, formatFileSize, warningsFor } from '../lib/photoRules'

type Props = {
  controller: PropertyPhotosController
  /** Na tela de detalhe as fotos são só leitura (10.8). */
  readOnly?: boolean
}

/** Celular tem câmera: mostra "Tirar fotos". No computador, só "Escolher fotos" (CA-11.9). */
function useIsTouchDevice() {
  const [isTouch] = useState(() => window.matchMedia?.('(pointer: coarse)').matches ?? false)
  return isTouch
}

/** Seção 11 · protótipos 13 e 18 (bloco "Fotos do imóvel"). */
export function PropertyPhotosSection({ controller, readOnly = false }: Props) {
  const isTouch = useIsTouchDevice()
  const cameraInput = useRef<HTMLInputElement>(null)
  const galleryInput = useRef<HTMLInputElement>(null)
  const [removing, setRemoving] = useState<PropertyPhoto | null>(null)
  const [busy, setBusy] = useState(false)
  const canManage = controller.canManage && !readOnly
  const total = controller.photos.length + controller.local.length

  useEffect(() => {
    controller.notices.forEach((notice) => toast.error(notice.message, { id: notice.key }))
  }, [controller.notices])

  const handleFiles = (files: FileList | null) => {
    if (files && files.length > 0) void controller.addFiles(files)
  }

  const confirmRemove = async () => {
    if (!removing) return

    setBusy(true)

    try {
      await controller.remove(removing.id)
      toast.success('Foto removida')
      setRemoving(null)
    } catch {
      toast.error('Não foi possível remover a foto. Tente de novo.')
    } finally {
      setBusy(false)
    }
  }

  const makeCover = async (photoId: string) => {
    try {
      await controller.makeCover(photoId)
    } catch {
      toast.error('Não foi possível trocar a capa. Tente de novo.')
    }
  }

  return (
    <FormSection icon="photo_library" title="Fotos do imóvel" optional>
      {canManage ? (
        <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            {isTouch ? (
              <button
                type="button"
                onClick={() => cameraInput.current?.click()}
                className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-primary/40 bg-surface-container-lowest font-semibold text-primary"
              >
                <Icon name="photo_camera" size={20} />
                Tirar fotos
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => galleryInput.current?.click()}
              className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-primary/40 bg-surface-container-lowest font-semibold text-primary"
            >
              <Icon name="upload" size={20} />
              {isTouch ? 'Escolher várias' : 'Escolher fotos'}
            </button>
          </div>
          <input
            ref={cameraInput}
            type="file"
            accept={PHOTO_ACCEPT}
            capture="environment"
            multiple
            hidden
            onChange={(event) => {
              handleFiles(event.target.files)
              event.target.value = ''
            }}
          />
          <input
            ref={galleryInput}
            type="file"
            accept={PHOTO_ACCEPT}
            multiple
            hidden
            onChange={(event) => {
              handleFiles(event.target.files)
              event.target.value = ''
            }}
          />
          <p className="mt-3 text-body-sm text-on-surface-variant">
            Até {MAX_PHOTOS_PER_PROPERTY} fotos por imóvel, JPG ou PNG. A primeira é a capa.
          </p>
          <p className="mt-3 flex gap-2 rounded-lg bg-primary/10 p-3 text-body-sm text-on-surface">
            <Icon name="info" size={18} className="mt-0.5 shrink-0 text-primary" />
            Use só fotos que você pode divulgar. Evite rostos de pessoas, placas e documentos.
          </p>
        </div>
      ) : null}

      {controller.loadState === 'loading' ? (
        <p className="mt-4 flex items-center gap-2 text-body-md text-on-surface-variant">
          <Icon name="sync" size={18} className="animate-spin" />
          Carregando fotos…
        </p>
      ) : null}

      {controller.loadState === 'error' ? (
        <p className="mt-4 text-body-md text-error" role="alert">
          Não foi possível carregar as fotos.{' '}
          <button type="button" onClick={() => void controller.reload()} className="font-semibold underline">
            Tentar de novo
          </button>
        </p>
      ) : null}

      {controller.loadState === 'ready' && total === 0 ? (
        <p className="mt-4 text-body-md text-on-surface-variant">
          {canManage
            ? 'Nenhuma foto ainda. As fotos ajudam a reconhecer o imóvel e serão usadas no anúncio.'
            : 'Nenhuma foto cadastrada.'}
        </p>
      ) : null}

      {total > 0 ? (
        <>
          <p className="mb-2 mt-5 text-label-md font-semibold text-on-surface">
            {total} {total === 1 ? 'foto adicionada' : 'fotos adicionadas'}
          </p>
          <ul className="divide-y divide-outline-variant/60 rounded-lg border border-outline-variant/60">
            {controller.photos.map((photo) => (
              <PhotoRow
                key={photo.id}
                thumbnailUrl={photo.thumbnailUrl}
                name={photo.originalName}
                sizeBytes={photo.sizeBytes}
                isCover={photo.isCover}
                warnings={warningsFor(photo.width, photo.height)}
                onMakeCover={canManage && !photo.isCover ? () => void makeCover(photo.id) : undefined}
                onRemove={canManage ? () => setRemoving(photo) : undefined}
              />
            ))}
            {controller.local.map((item, index) => (
              <PhotoRow
                key={item.key}
                thumbnailUrl={item.previewUrl}
                name={item.file.name}
                sizeBytes={item.file.size}
                // No cadastro novo a primeira escolhida vira a capa ao salvar.
                isCover={controller.photos.length === 0 && index === 0}
                warnings={warningsFor(item.width, item.height)}
                status={item.status}
                error={item.error}
                onRetry={item.status === 'failed' ? () => void controller.retry(item.key) : undefined}
                onMakeCover={
                  item.status === 'waiting' && controller.photos.length === 0 && index > 0
                    ? () => controller.makeLocalCover(item.key)
                    : undefined
                }
                onRemove={item.status !== 'uploading' ? () => controller.discardLocal(item.key) : undefined}
              />
            ))}
          </ul>
        </>
      ) : null}

      {removing ? (
        <Modal titleId="remover-foto" title="Remover esta foto?" onClose={() => setRemoving(null)}>
          <p className="text-body-md text-on-surface-variant">
            {removing.originalName} sai do imóvel. {removing.isCover ? 'A próxima foto vira a capa.' : ''}
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setRemoving(null)}
              className="h-10 rounded-lg border border-outline-variant px-4 text-sm font-semibold text-on-surface"
            >
              Manter foto
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void confirmRemove()}
              className="h-10 rounded-lg bg-error px-4 text-sm font-semibold text-on-error disabled:opacity-60"
            >
              Remover foto
            </button>
          </div>
        </Modal>
      ) : null}
    </FormSection>
  )
}

type PhotoRowProps = {
  thumbnailUrl: string
  name: string
  sizeBytes: number
  isCover: boolean
  warnings: string[]
  status?: 'waiting' | 'uploading' | 'failed'
  error?: string | null
  onMakeCover?: () => void
  onRemove?: () => void
  onRetry?: () => void
}

/** Linha de arquivo com miniatura de 40 px — nunca grade (seção 6, item 4). */
function PhotoRow({ thumbnailUrl, name, sizeBytes, isCover, warnings, status, error, onMakeCover, onRemove, onRetry }: PhotoRowProps) {
  return (
    <li className="flex items-center gap-3 px-3 py-2">
      <img src={thumbnailUrl} alt="" className="h-10 w-10 shrink-0 rounded object-cover" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-label-md font-semibold text-on-surface">{name}</p>
        <p className="text-body-sm text-on-surface-variant">
          Foto · {formatFileSize(sizeBytes)}
          {status === 'uploading' ? ' · enviando…' : ''}
          {status === 'waiting' ? ' · será enviada ao salvar' : ''}
        </p>
        {warnings.map((warning) => (
          <p key={warning} className="flex items-start gap-1 text-body-sm text-amber-700">
            <Icon name="warning" size={14} className="mt-0.5 shrink-0" />
            {warning}
          </p>
        ))}
        {error ? (
          <p className="text-body-sm text-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
      {isCover ? (
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-label-sm font-semibold text-primary">Capa</span>
      ) : null}
      {onRetry ? (
        <button type="button" onClick={onRetry} className="min-h-11 px-2 text-label-md font-semibold text-primary underline">
          Tentar de novo
        </button>
      ) : null}
      {onMakeCover ? (
        <button type="button" onClick={onMakeCover} className="min-h-11 px-2 text-label-md font-semibold text-primary underline">
          Usar como capa
        </button>
      ) : null}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remover ${name}`}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-on-surface-variant hover:bg-error/10 hover:text-error"
        >
          <Icon name="close" size={20} />
        </button>
      ) : null}
    </li>
  )
}
