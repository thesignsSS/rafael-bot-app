import { useEffect, useMemo, useRef, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'
import { toast } from 'sonner'
import { useAuth } from '../../contexts/auth-context'
import { usePreferences } from '../../contexts/preferences-context'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import {
  buildProfileAvatarPath,
  createCroppedAvatarBlob,
  getProfileAvatarUrl,
  PROFILE_AVATAR_MAX_UPLOAD_BYTES,
} from '../../lib/profile-avatar'
import { supabase } from '../../lib/supabase'

type ProfileTab = 'conta' | 'preferencias'

export default function PerfilPage() {
  const { user, currentUserProfile, role, refreshProfile } = useAuth()
  const { preferences, updateNotificationTypes, updatePreferences } = usePreferences()
  const [activeTab, setActiveTab] = useState<ProfileTab>('conta')
  const [fullName, setFullName] = useState(currentUserProfile?.fullName ?? '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [isSavingAvatar, setIsSavingAvatar] = useState(false)
  const [avatarDraftUrl, setAvatarDraftUrl] = useState<string | null>(null)
  const [avatarCrop, setAvatarCrop] = useState({ x: 0, y: 0 })
  const [avatarZoom, setAvatarZoom] = useState(1)
  const [avatarCroppedAreaPixels, setAvatarCroppedAreaPixels] = useState<Area | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useDocumentTitle('Meu Perfil | Effectus')

  useEffect(() => {
    setFullName(currentUserProfile?.fullName ?? '')
  }, [currentUserProfile?.fullName])

  useEffect(() => {
    return () => {
      if (avatarDraftUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(avatarDraftUrl)
      }
    }
  }, [avatarDraftUrl])

  const email = user?.email ?? 'Não informado'
  const roleLabel = useMemo(
    () => (role === 'admin' ? 'Administrador' : 'Corretor'),
    [role],
  )
  const avatarUrl = useMemo(
    () =>
      getProfileAvatarUrl(
        currentUserProfile?.avatarPath,
        currentUserProfile?.updatedAt,
      ),
    [currentUserProfile?.avatarPath, currentUserProfile?.updatedAt],
  )
  const hasNameChanges = fullName.trim() !== (currentUserProfile?.fullName ?? '').trim()

  function resetAvatarEditor() {
    setAvatarCrop({ x: 0, y: 0 })
    setAvatarZoom(1)
    setAvatarCroppedAreaPixels(null)
    setAvatarDraftUrl((currentUrl) => {
      if (currentUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(currentUrl)
      }

      return null
    })
  }

  function handleAvatarFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0]
    event.target.value = ''

    if (!nextFile) {
      return
    }

    if (!nextFile.type.startsWith('image/')) {
      toast.error('Selecione uma imagem JPG, PNG ou WebP.')
      return
    }

    if (nextFile.size > PROFILE_AVATAR_MAX_UPLOAD_BYTES) {
      toast.error('A imagem precisa ter no máximo 5 MB antes da otimização.')
      return
    }

    const objectUrl = URL.createObjectURL(nextFile)
    setAvatarCrop({ x: 0, y: 0 })
    setAvatarZoom(1)
    setAvatarCroppedAreaPixels(null)
    setAvatarDraftUrl((currentUrl) => {
      if (currentUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(currentUrl)
      }

      return objectUrl
    })
  }

  async function handleSaveAvatar() {
    if (!user || !avatarDraftUrl || !avatarCroppedAreaPixels) {
      toast.error('Selecione e ajuste a foto antes de salvar.')
      return
    }

    try {
      setIsSavingAvatar(true)

      const avatarBlob = await createCroppedAvatarBlob({
        imageUrl: avatarDraftUrl,
        crop: {
          x: avatarCroppedAreaPixels.x,
          y: avatarCroppedAreaPixels.y,
          width: avatarCroppedAreaPixels.width,
          height: avatarCroppedAreaPixels.height,
        },
      })

      const avatarPath = buildProfileAvatarPath(user.id)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(avatarPath, avatarBlob, {
          upsert: true,
          contentType: 'image/webp',
          cacheControl: '3600',
        })

      if (uploadError) {
        throw uploadError
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          avatar_path: avatarPath,
        })
        .eq('id', user.id)

      if (profileError) {
        throw profileError
      }

      await refreshProfile()
      resetAvatarEditor()
      toast.success('Foto de perfil atualizada.')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Não foi possível atualizar sua foto de perfil.',
      )
    } finally {
      setIsSavingAvatar(false)
    }
  }

  async function handleRemoveAvatar() {
    if (!user || !currentUserProfile?.avatarPath) {
      return
    }

    try {
      setIsSavingAvatar(true)

      const { error: removeError } = await supabase.storage
        .from('avatars')
        .remove([currentUserProfile.avatarPath])

      if (removeError) {
        throw removeError
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          avatar_path: null,
        })
        .eq('id', user.id)

      if (profileError) {
        throw profileError
      }

      await refreshProfile()
      toast.success('Foto de perfil removida.')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Não foi possível remover sua foto de perfil.',
      )
    } finally {
      setIsSavingAvatar(false)
    }
  }

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
    <>
    <div className="mx-auto max-w-4xl animate-fade-up space-y-6">
      <section className="rounded-[28px] border border-outline-variant bg-[linear-gradient(135deg,var(--color-surface-container-lowest)_0%,var(--color-surface-container-low)_100%)] p-6 shadow-[0px_10px_32px_rgba(19,27,46,0.08)] sm:p-8">
        <p className="text-label-sm font-semibold uppercase tracking-[0.16em] text-primary/80">
          Perfil
        </p>
        <h1 className="mt-2 text-headline-xl font-semibold text-on-surface">
          Conta e preferências
        </h1>
        <p className="mt-3 max-w-2xl text-body-md text-on-surface-variant">
          Atualize seus dados de acesso e personalize a forma como o Effectus se
          comporta no seu dia a dia.
        </p>
      </section>

      <div className="inline-flex rounded-2xl border border-outline-variant bg-surface-container-low p-1">
        {[
          { id: 'conta', label: 'Conta' },
          { id: 'preferencias', label: 'Preferências' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as ProfileTab)}
            className={`rounded-xl px-4 py-2 text-label-md font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'conta' ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-headline-md font-semibold text-on-surface">
                  Dados do perfil
                </h2>
              </div>

              <span className="rounded-full bg-primary-container px-3 py-1 text-label-sm font-semibold text-on-primary-container">
                {roleLabel}
              </span>
            </div>

            <div className="mt-6 space-y-5">
              <div className="flex flex-col gap-4 rounded-2xl border border-outline-variant bg-surface-container-low p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-outline-variant bg-surface-container-highest">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={`Foto de perfil de ${currentUserProfile?.fullName ?? 'usuário'}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-semibold text-primary">
                        {(currentUserProfile?.fullName ?? email).trim().slice(0, 1).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-label-md font-semibold text-on-surface">
                      Foto de perfil
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSavingAvatar}
                    className="rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2 text-label-md font-semibold text-on-surface transition-all hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {avatarUrl ? 'Trocar foto' : 'Adicionar foto'}
                  </button>
                  {avatarUrl ? (
                    <button
                      type="button"
                      onClick={() => void handleRemoveAvatar()}
                      disabled={isSavingAvatar}
                      className="rounded-xl border border-error/30 bg-error/8 px-4 py-2 text-label-md font-semibold text-error transition-all hover:bg-error/12 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Remover
                    </button>
                  ) : null}
                </div>
              </div>

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
                  className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                  className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                  className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4">
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
      ) : (
        <div className="space-y-6">
          <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
            <div className="flex flex-col gap-2">
              <h2 className="text-headline-md font-semibold text-on-surface">
                Preferências do aplicativo
              </h2>
              <p className="text-body-sm text-on-surface-variant">
                As alterações são salvas automaticamente neste dispositivo.
              </p>
            </div>

            <div className="mt-6 grid gap-6">
              <div className="rounded-xl border border-outline-variant bg-surface-container-low p-5">
                <h3 className="text-label-md font-semibold text-on-surface">Aparência</h3>
                <div className="mt-4 grid gap-5 lg:grid-cols-3">
                  <div>
                    <p className="text-body-sm font-semibold text-on-surface">Tema</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[
                        {
                          value: 'light',
                          label: 'Claro',
                          activeClass:
                            'border-[#d7def7] bg-[#eef3ff] text-[#23408a]',
                          inactiveClass:
                            'border-[#d7def7] bg-[#f8faff] text-[#5b6783] hover:bg-[#eef3ff] hover:text-[#23408a]',
                        },
                        {
                          value: 'dark',
                          label: 'Escuro',
                          activeClass:
                            'border-[#365da8] bg-[#1d2638] text-[#dbe7ff]',
                          inactiveClass:
                            'border-[#364154] bg-[#131927] text-[#aeb9cf] hover:bg-[#1d2638] hover:text-[#dbe7ff]',
                        },
                        {
                          value: 'graphite',
                          label: 'Grafite',
                          activeClass:
                            'border-[#536dba] bg-[#2a2f39] text-[#eef3ff]',
                          inactiveClass:
                            'border-[#434957] bg-[#1b1e24] text-[#bcc3d0] hover:bg-[#2a2f39] hover:text-[#eef3ff]',
                        },
                        {
                          value: 'rose',
                          label: 'Rosa',
                          activeClass:
                            'border-[#f28bc1] bg-[#f28bc1] text-[#4c1834]',
                          inactiveClass:
                            'border-[#7a476a] bg-[#341f31] text-[#efc3da] hover:bg-[#4a2850] hover:text-[#fff0f8]',
                        },
                        {
                          value: 'emerald',
                          label: 'Esmeralda',
                          activeClass:
                            'border-[#6fe8b7] bg-[#6fe8b7] text-[#093023]',
                          inactiveClass:
                            'border-[#3b6d60] bg-[#173129] text-[#bde8d7] hover:bg-[#21453b] hover:text-[#ebfff7]',
                        },
                        {
                          value: 'sunset',
                          label: 'Pôr do sol',
                          activeClass:
                            'border-[#ffb47d] bg-[#ffb47d] text-[#4f2200]',
                          inactiveClass:
                            'border-[#7f543b] bg-[#321d17] text-[#f1c6a5] hover:bg-[#4a2a20] hover:text-[#fff2eb]',
                        },
                      ].map(({ value, label, activeClass, inactiveClass }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            updatePreferences({
                              theme: value as typeof preferences.theme,
                            })
                          }
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-label-sm font-semibold transition-all ${
                            preferences.theme === value
                              ? `${activeClass} scale-[1.02] shadow-[0_0_0_2px_rgba(255,255,255,0.16),0_8px_18px_rgba(15,23,42,0.22)]`
                              : inactiveClass
                          }`}
                          aria-pressed={preferences.theme === value}
                        >
                          {preferences.theme === value ? (
                            <span className="text-[12px] leading-none" aria-hidden="true">
                              ✓
                            </span>
                          ) : null}
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-body-sm font-semibold text-on-surface">Tamanho da fonte</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[
                        ['medium', 'Médio'],
                        ['large', 'Grande'],
                      ].map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            updatePreferences({
                              fontSize: value as typeof preferences.fontSize,
                            })
                          }
                          className={`rounded-full px-3 py-2 text-label-sm font-semibold transition-all ${
                            preferences.fontSize === value
                              ? 'bg-primary text-on-primary'
                              : 'border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:text-on-surface'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-body-sm font-semibold text-on-surface">Densidade</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[
                        ['default', 'Padrão'],
                        ['compact', 'Compacta'],
                      ].map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            updatePreferences({
                              density: value as typeof preferences.density,
                            })
                          }
                          className={`rounded-full px-3 py-2 text-label-sm font-semibold transition-all ${
                            preferences.density === value
                              ? 'bg-primary text-on-primary'
                              : 'border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:text-on-surface'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-outline-variant bg-surface-container-low p-5">
                <h3 className="text-label-md font-semibold text-on-surface">Propostas</h3>
                <div className="mt-4">
                  <p className="text-body-sm font-semibold text-on-surface">
                    Layout padrão
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      ['table', 'Tabela'],
                      ['kanban', 'Kanban'],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          updatePreferences({
                            proposalsLayout: value as typeof preferences.proposalsLayout,
                          })
                        }
                        className={`rounded-full px-3 py-2 text-label-sm font-semibold transition-all ${
                          preferences.proposalsLayout === value
                            ? 'bg-primary text-on-primary'
                            : 'border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-outline-variant bg-surface-container-low p-5">
                <h3 className="text-label-md font-semibold text-on-surface">Chat</h3>
                <div className="mt-4 grid gap-5 lg:grid-cols-2">
                  <div>
                    <p className="text-body-sm font-semibold text-on-surface">Papel de parede</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[
                        ['classic', 'Clássico'],
                        ['subtle', 'Suave'],
                        ['none', 'Sem fundo'],
                      ].map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            updatePreferences({
                              chatWallpaper: value as typeof preferences.chatWallpaper,
                            })
                          }
                          className={`rounded-full px-3 py-2 text-label-sm font-semibold transition-all ${
                            preferences.chatWallpaper === value
                              ? 'bg-primary text-on-primary'
                              : 'border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:text-on-surface'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-body-sm font-semibold text-on-surface">
                      Comportamento do Enter
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[
                        ['send', 'Enter envia'],
                        ['newline', 'Ctrl+Enter envia'],
                      ].map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            updatePreferences({
                              enterBehavior: value as typeof preferences.enterBehavior,
                            })
                          }
                          className={`rounded-full px-3 py-2 text-label-sm font-semibold transition-all ${
                            preferences.enterBehavior === value
                              ? 'bg-primary text-on-primary'
                              : 'border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:text-on-surface'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-outline-variant bg-surface-container-low p-5">
                <h3 className="text-label-md font-semibold text-on-surface">Notificações</h3>
                <div className="mt-4 space-y-4">
                  <label className="flex items-center justify-between gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3">
                    <div>
                      <p className="text-body-md font-semibold text-on-surface">Som</p>
                      <p className="text-body-sm text-on-surface-variant">
                        Reproduz um aviso quando chegar uma notificação permitida.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.notifications.sound}
                      onChange={(event) =>
                        updatePreferences({
                          notifications: {
                            ...preferences.notifications,
                            sound: event.target.checked,
                          },
                        })
                      }
                      className="h-4 w-4 accent-[var(--color-primary)]"
                    />
                  </label>

                  <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
                    <p className="text-body-md font-semibold text-on-surface">
                      Tipos de notificação
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {[
                        ['proposal_updates', 'Atualizações de proposta'],
                        ['status_changes', 'Mudanças de status'],
                        ['comments', 'Comentários'],
                        ['invitations', 'Convites'],
                        ['chat_messages', 'Mensagens de chat'],
                      ].map(([value, label]) => (
                        <label
                          key={value}
                          className="flex items-center justify-between gap-3 rounded-lg border border-outline-variant px-3 py-2.5"
                        >
                          <span className="text-body-sm text-on-surface">{label}</span>
                          <input
                            type="checkbox"
                            checked={
                              preferences.notifications.types[
                                value as keyof typeof preferences.notifications.types
                              ]
                            }
                            onChange={(event) =>
                              updateNotificationTypes({
                                [value]: event.target.checked,
                              })
                            }
                            className="h-4 w-4 accent-[var(--color-primary)]"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
    {avatarDraftUrl ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#131b2e]/65 p-4 backdrop-blur-[2px]">
        <div className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-outline-variant bg-surface-container-lowest shadow-[0px_24px_80px_rgba(19,27,46,0.28)]">
          <div className="border-b border-outline-variant px-6 py-4">
            <h3 className="text-headline-md font-semibold text-on-surface">
              Ajustar foto de perfil
            </h3>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              Posicione a imagem como quiser. O upload final será quadrado e otimizado.
            </p>
          </div>

          <div className="space-y-5 p-6">
            <div className="relative h-80 overflow-hidden rounded-2xl bg-surface">
              <Cropper
                image={avatarDraftUrl}
                crop={avatarCrop}
                zoom={avatarZoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setAvatarCrop}
                onZoomChange={setAvatarZoom}
                onCropComplete={(_, croppedAreaPixels) =>
                  setAvatarCroppedAreaPixels(croppedAreaPixels)
                }
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-label-md font-semibold text-on-surface">
                  Zoom
                </span>
                <span className="text-body-sm text-on-surface-variant">
                  {Math.round(avatarZoom * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={avatarZoom}
                onChange={(event) => setAvatarZoom(Number(event.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-outline-variant px-6 py-4">
            <button
              type="button"
              onClick={resetAvatarEditor}
              disabled={isSavingAvatar}
              className="rounded-xl border border-outline-variant px-4 py-2 text-label-md font-semibold text-on-surface transition-all hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => void handleSaveAvatar()}
              disabled={isSavingAvatar || !avatarCroppedAreaPixels}
              className="rounded-xl bg-primary px-5 py-2 text-label-md font-semibold text-on-primary transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSavingAvatar ? 'Salvando foto...' : 'Salvar foto'}
            </button>
          </div>
        </div>
      </div>
    ) : null}
    </>
  )
}
