import { useCallback, useEffect, useRef, useState } from 'react'
import {
  PropertyApiError,
  fetchPhotos,
  removePhoto,
  setCoverPhoto,
  uploadPhoto,
  type PropertyPhoto,
} from '../lib/propertiesApi'
import { MAX_PHOTOS_PER_PROPERTY, readDimensions, rejectReason } from '../lib/photoRules'

/** Foto escolhida que ainda não está registrada no bot. */
export type LocalPhoto = {
  key: string
  file: File
  previewUrl: string
  width: number | null
  height: number | null
  status: 'waiting' | 'uploading' | 'failed'
  error: string | null
}

export type PhotoNotice = { key: string; message: string }

let sequence = 0

async function toLocal(file: File): Promise<LocalPhoto> {
  const dimensions = await readDimensions(file)
  sequence += 1

  return {
    key: `local-${sequence}`,
    file,
    previewUrl: URL.createObjectURL(file),
    width: dimensions?.width ?? null,
    height: dimensions?.height ?? null,
    status: 'waiting',
    error: null,
  }
}

/**
 * Fotos de um imóvel (seção 11). Sem `propertyId` (cadastro novo), as fotos
 * ficam guardadas até o imóvel ser salvo (11.13) e sobem por `uploadPending`.
 * Com `propertyId`, cada foto sobe assim que é escolhida.
 */
export function usePropertyPhotos(propertyId: string | null, initialFailed: File[] = []) {
  const [photos, setPhotos] = useState<PropertyPhoto[]>([])
  const [local, setLocal] = useState<LocalPhoto[]>([])
  const [canManage, setCanManage] = useState(propertyId === null)
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>(propertyId ? 'loading' : 'ready')
  const [notices, setNotices] = useState<PhotoNotice[]>([])
  const localRef = useRef(local)
  localRef.current = local

  const reload = useCallback(async () => {
    if (!propertyId) return

    setLoadState('loading')

    try {
      const result = await fetchPhotos(propertyId)
      setPhotos(result.items)
      setCanManage(result.canManage)
      setLoadState('ready')
    } catch {
      setLoadState('error')
    }
  }, [propertyId])

  useEffect(() => {
    void reload()
  }, [reload])

  // Libera as prévias quando o componente sai da tela.
  useEffect(() => () => localRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl)), [])

  const sendOne = useCallback(
    async (targetPropertyId: string, item: LocalPhoto): Promise<boolean> => {
      setLocal((current) => current.map((p) => (p.key === item.key ? { ...p, status: 'uploading', error: null } : p)))

      try {
        const photo = await uploadPhoto(
          targetPropertyId,
          item.file,
          item.width && item.height ? { width: item.width, height: item.height } : null,
        )
        setPhotos((current) => [...current, photo].sort((a, b) => Number(b.isCover) - Number(a.isCover) || a.position - b.position))
        setLocal((current) => current.filter((p) => p.key !== item.key))
        URL.revokeObjectURL(item.previewUrl)

        return true
      } catch (error) {
        const message =
          error instanceof PropertyApiError
            ? (Object.values(error.fields)[0] ?? error.message)
            : 'A foto não foi enviada. Confira sua conexão e tente de novo.'
        setLocal((current) => current.map((p) => (p.key === item.key ? { ...p, status: 'failed', error: message } : p)))

        return false
      }
    },
    [],
  )

  /** 11.7 e 11.9: recusa só os arquivos inválidos e segue com o resto da seleção. */
  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      const accepted: File[] = []
      const rejected: PhotoNotice[] = []
      const room = MAX_PHOTOS_PER_PROPERTY - photos.length - localRef.current.length

      for (const file of Array.from(files)) {
        const reason = rejectReason(file)

        if (reason) {
          rejected.push({ key: `${file.name}-${file.size}`, message: `${file.name}: ${reason}` })
        } else if (accepted.length >= room) {
          rejected.push({
            key: `${file.name}-limite`,
            message: `${file.name}: este imóvel já tem o máximo de ${MAX_PHOTOS_PER_PROPERTY} fotos`,
          })
        } else {
          accepted.push(file)
        }
      }

      setNotices(rejected)

      const items = await Promise.all(accepted.map(toLocal))
      setLocal((current) => [...current, ...items])

      if (propertyId) {
        for (const item of items) await sendOne(propertyId, item)
      }
    },
    [photos.length, propertyId, sendOne],
  )

  // Fotos que falharam no cadastro novo chegam aqui para tentar de novo.
  const initialFailedRef = useRef(initialFailed)
  useEffect(() => {
    const files = initialFailedRef.current

    if (!propertyId || files.length === 0) return

    initialFailedRef.current = []
    void Promise.all(files.map(toLocal)).then((items) =>
      setLocal((current) => [
        ...current,
        ...items.map((item) => ({ ...item, status: 'failed' as const, error: 'A foto não foi enviada. Tente de novo.' })),
      ]),
    )
  }, [propertyId])

  /** Cadastro novo: sobe as fotos guardadas e devolve as que falharam. */
  const uploadPending = useCallback(
    async (newPropertyId: string): Promise<File[]> => {
      const failed: File[] = []

      for (const item of localRef.current) {
        if (!(await sendOne(newPropertyId, item))) failed.push(item.file)
      }

      return failed
    },
    [sendOne],
  )

  const retry = useCallback(
    async (key: string) => {
      const item = localRef.current.find((p) => p.key === key)

      if (item && propertyId) await sendOne(propertyId, item)
    },
    [propertyId, sendOne],
  )

  const discardLocal = useCallback((key: string) => {
    setLocal((current) => {
      const item = current.find((p) => p.key === key)
      if (item) URL.revokeObjectURL(item.previewUrl)
      return current.filter((p) => p.key !== key)
    })
  }, [])

  /** No cadastro novo, a primeira foto escolhida é a capa (11.3); aqui a escolha é local. */
  const makeLocalCover = useCallback((key: string) => {
    setLocal((current) => {
      const item = current.find((p) => p.key === key)
      return item ? [item, ...current.filter((p) => p.key !== key)] : current
    })
  }, [])

  const makeCover = useCallback(
    async (photoId: string) => {
      if (!propertyId) return

      await setCoverPhoto(propertyId, photoId)
      setPhotos((current) =>
        current
          .map((p) => ({ ...p, isCover: p.id === photoId }))
          .sort((a, b) => Number(b.isCover) - Number(a.isCover) || a.position - b.position),
      )
    },
    [propertyId],
  )

  const remove = useCallback(
    async (photoId: string) => {
      if (!propertyId) return

      await removePhoto(propertyId, photoId)
      await reload()
    },
    [propertyId, reload],
  )

  return {
    photos,
    local,
    canManage,
    loadState,
    notices,
    reload,
    addFiles,
    uploadPending,
    retry,
    discardLocal,
    makeLocalCover,
    makeCover,
    remove,
  }
}

export type PropertyPhotosController = ReturnType<typeof usePropertyPhotos>
