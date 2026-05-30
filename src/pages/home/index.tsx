import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { useAuth } from '../../contexts/auth-context'

type PropertyType = 'Novo' | 'Usado'

type IbgeCity = {
  id: number
  nome: string
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ibgeCearaCitiesUrl =
  'https://servicodados.ibge.gov.br/api/v1/localidades/estados/23/municipios'
const additionalInfoMaxLength = 10000

const fileKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`

const formatFileSize = (sizeInBytes: number) => {
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} B`
  }

  const sizeInKb = sizeInBytes / 1024

  if (sizeInKb < 1024) {
    return `${sizeInKb.toFixed(1)} KB`
  }

  return `${(sizeInKb / 1024).toFixed(1)} MB`
}

const normalizeSearchText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

export default function HomePage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [clientName, setClientName] = useState('')
  const [clientCpf, setClientCpf] = useState('')
  const [clientCpfError, setClientCpfError] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientPhoneError, setClientPhoneError] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [propertyType, setPropertyType] = useState<PropertyType>('Novo')
  const [city, setCity] = useState('')
  const [citySearch, setCitySearch] = useState('')
  const [cities, setCities] = useState<IbgeCity[]>([])
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false)
  const [isLoadingCities, setIsLoadingCities] = useState(true)
  const [citiesError, setCitiesError] = useState('')
  const [cityError, setCityError] = useState('')
  const [extraFiles, setExtraFiles] = useState<File[]>([])
  const [additionalInfo, setAdditionalInfo] = useState('')
  const cityComboboxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.title = 'Nova Proposta | Rafael Bot'
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function loadCearaCities() {
      try {
        const response = await fetch(ibgeCearaCitiesUrl, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('IBGE request failed')
        }

        const ibgeCities = (await response.json()) as IbgeCity[]
        const sortedCities = [...ibgeCities].sort((firstCity, secondCity) =>
          firstCity.nome.localeCompare(secondCity.nome, 'pt-BR'),
        )

        setCities(sortedCities)
        setCitiesError('')
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        setCitiesError('Não foi possível carregar os municípios do IBGE.')
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingCities(false)
        }
      }
    }

    loadCearaCities()

    return () => controller.abort()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        cityComboboxRef.current &&
        !cityComboboxRef.current.contains(event.target as Node)
      ) {
        setIsCityDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const handleExtraFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? [])

    setExtraFiles((currentFiles) => {
      const currentFileKeys = new Set(currentFiles.map(fileKey))
      const newFiles = selectedFiles.filter(
        (file) => !currentFileKeys.has(fileKey(file)),
      )

      return [...currentFiles, ...newFiles]
    })

    event.target.value = ''
  }

  const removeExtraFile = (fileToRemove: File) => {
    setExtraFiles((currentFiles) =>
      currentFiles.filter((file) => fileKey(file) !== fileKey(fileToRemove)),
    )
  }

  const clientLabel = clientName.trim() || 'Ainda não informado'
  const emailLabel = clientEmail.trim() || 'Ainda não informado'
  const cityLabel = city || 'Selecione o município'
  const filteredCities = useMemo(() => {
    const normalizedSearch = normalizeSearchText(citySearch.trim())

    if (!normalizedSearch) {
      return cities
    }

    return cities.filter((cityOption) =>
      normalizeSearchText(cityOption.nome).includes(normalizedSearch),
    )
  }, [cities, citySearch])

  const selectCity = (cityName: string) => {
    setCity(cityName)
    setCitySearch(cityName)
    setCityError('')
    setIsCityDropdownOpen(false)
  }

  const validateCity = () => {
    if (!city) {
      setCityError('Selecione o município do imóvel.')
      return false
    }

    setCityError('')
    return true
  }

  const validateClientEmail = () => {
    const trimmedEmail = clientEmail.trim()

    if (!trimmedEmail) {
      setEmailError('Informe o e-mail do cliente.')
      return false
    }

    if (!emailPattern.test(trimmedEmail)) {
      setEmailError('Digite um e-mail válido.')
      return false
    }

    setEmailError('')
    return true
  }

  const validateClientCpf = () => {
    if (!clientCpf.trim()) {
      setClientCpfError('Informe o CPF do cliente.')
      return false
    }

    setClientCpfError('')
    return true
  }

  const validateClientPhone = () => {
    if (!clientPhone.trim()) {
      setClientPhoneError('Informe o telefone do cliente.')
      return false
    }

    setClientPhoneError('')
    return true
  }

  const handleSubmit = () => {
    if (!clientName.trim()) {
      toast.error('Informe o nome do cliente para enviar a documentação.')
      return
    }

    if (!validateClientCpf()) {
      toast.error('Informe o CPF do cliente antes de enviar.')
      return
    }

    if (!validateClientPhone()) {
      toast.error('Informe o telefone do cliente antes de enviar.')
      return
    }

    if (!validateClientEmail()) {
      toast.error('Revise o e-mail do cliente antes de enviar.')
      return
    }

    if (!validateCity()) {
      toast.error('Selecione o município do imóvel antes de enviar.')
      return
    }

    toast.success('Documentação pronta para análise.')
  }

  return (
    <div className="min-h-screen bg-[#f7f9fd] text-on-surface">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 border-r border-outline-variant/60 bg-white px-5 py-7 lg:block">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
            <Icon name="description" size={26} />
          </div>
          <div>
            <p className="text-headline-md font-bold">Rafael Bot</p>
            <p className="text-body-sm text-on-surface-variant">Documentos</p>
          </div>
        </div>

        <nav className="mt-16 space-y-2">
          <SidebarItem icon="note_add" label="Nova Proposta" active />
          <SidebarItem icon="inventory_2" label="Minhas Propostas" />
          <SidebarItem icon="history" label="Histórico" />
          <SidebarItem icon="help" label="Ajuda" />
        </nav>

        <div className="absolute bottom-6 left-5 right-5 rounded-lg border border-outline-variant/70 bg-surface-container-lowest p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Icon name="chat" size={18} />
            </div>
            <div>
              <p className="text-label-md font-semibold">Dúvidas?</p>
              <p className="text-body-sm text-on-surface-variant">
                Fale com o administrador
              </p>
              <a
                href="https://wa.me/5585999999999"
                target="_blank"
                rel="noreferrer"
                className="mt-1 block text-label-sm font-semibold text-primary"
              >
                (85) 99999-9999
              </a>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-10 border-b border-outline-variant/60 bg-white/95 px-4 py-4 backdrop-blur sm:px-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
                <Icon name="description" size={24} />
              </div>
              <div>
                <p className="text-label-md font-bold">Rafael Bot</p>
                <p className="text-body-sm text-on-surface-variant">Documentos</p>
              </div>
            </div>

            <div className="hidden lg:block" />

            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-label-md font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-low"
            >
              <Icon name="person" size={20} />
              <span className="hidden max-w-44 truncate sm:block">
                Olá, {user?.user_metadata.full_name ?? user?.email ?? 'Corretor'}
              </span>
              <Icon name="keyboard_arrow_down" size={20} />
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
          <section className="mb-8 flex items-start gap-4 border-b border-outline-variant/60 pb-7">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primary">
              <Icon name="note_add" size={32} />
            </div>
            <div>
              <h1 className="text-headline-xl font-bold text-on-surface">
                Nova Proposta
              </h1>
              <p className="mt-1 max-w-3xl text-body-md text-on-surface-variant">
                Preencha os dados do cliente e anexe os documentos para análise de
                crédito imobiliário.
              </p>
            </div>
          </section>

          <div className="space-y-6">
            <FormSection icon="person" title="Dados do Cliente">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.3fr_0.8fr_1fr_1fr]">
                <Field label="Nome do Cliente" required>
                  <input
                    value={clientName}
                    onChange={(event) => setClientName(event.target.value)}
                    placeholder="Digite o nome completo do cliente"
                    className="proposal-input"
                  />
                </Field>
                <Field label="CPF do Cliente" required error={clientCpfError}>
                  <input
                    value={clientCpf}
                    onBlur={validateClientCpf}
                    onChange={(event) => {
                      setClientCpf(event.target.value)
                      if (clientCpfError) {
                        setClientCpfError('')
                      }
                    }}
                    placeholder="000.000.000-00"
                    aria-invalid={clientCpfError ? true : undefined}
                    className={`proposal-input ${
                      clientCpfError ? 'proposal-input-error' : ''
                    }`}
                  />
                </Field>
                <Field
                  label="Telefone do Cliente"
                  required
                  error={clientPhoneError}
                >
                  <div className="relative">
                    <input
                      value={clientPhone}
                      onBlur={validateClientPhone}
                      onChange={(event) => {
                        setClientPhone(event.target.value)
                        if (clientPhoneError) {
                          setClientPhoneError('')
                        }
                      }}
                      placeholder="(85) 99999-9999"
                      aria-invalid={clientPhoneError ? true : undefined}
                      className={`proposal-input pr-12 ${
                        clientPhoneError ? 'proposal-input-error' : ''
                      }`}
                    />
                    <Icon
                      name="chat"
                      size={20}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500"
                    />
                  </div>
                </Field>
                <Field label="E-mail do Cliente" required error={emailError}>
                  <div className="relative">
                    <input
                      type="email"
                      value={clientEmail}
                      onBlur={validateClientEmail}
                      onChange={(event) => {
                        setClientEmail(event.target.value)
                        if (emailError) {
                          setEmailError('')
                        }
                      }}
                      placeholder="cliente@email.com"
                      aria-invalid={emailError ? true : undefined}
                      className={`proposal-input pr-12 ${
                        emailError ? 'proposal-input-error' : ''
                      }`}
                    />
                    <Icon
                      name="mail"
                      size={20}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-primary"
                    />
                  </div>
                </Field>
              </div>
            </FormSection>

            <FormSection icon="home" title="Dados do Imóvel">
              <div className="grid gap-5 md:grid-cols-[1fr_1.4fr]">
                <Field label="Tipo do Imóvel" required>
                  <div className="grid grid-cols-2 gap-3">
                    {(['Novo', 'Usado'] as PropertyType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setPropertyType(type)}
                        className={`flex h-12 items-center gap-3 rounded-lg border px-4 text-label-md font-semibold transition-all ${
                          propertyType === type
                            ? 'border-primary bg-blue-50 text-primary shadow-sm'
                            : 'border-outline-variant bg-white text-on-surface-variant hover:border-primary/60'
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                            propertyType === type
                              ? 'border-primary bg-primary text-white'
                              : 'border-outline-variant'
                          }`}
                        >
                          {propertyType === type ? (
                            <span className="h-2 w-2 rounded-full bg-white" />
                          ) : null}
                        </span>
                        {type}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Município do Imóvel" required error={cityError}>
                  <div ref={cityComboboxRef} className="relative">
                    <input
                      type="text"
                      value={citySearch}
                      onChange={(event) => {
                        setCitySearch(event.target.value)
                        setCity('')
                        if (cityError) {
                          setCityError('')
                        }
                        setIsCityDropdownOpen(true)
                      }}
                      onFocus={() => setIsCityDropdownOpen(true)}
                      placeholder={
                        isLoadingCities
                          ? 'Carregando municípios...'
                          : 'Busque o município'
                      }
                      role="combobox"
                      aria-expanded={isCityDropdownOpen}
                      aria-controls="city-options"
                      aria-autocomplete="list"
                      aria-invalid={cityError ? true : undefined}
                      className={`proposal-input pr-12 ${
                        cityError ? 'proposal-input-error' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setIsCityDropdownOpen((currentState) => !currentState)
                      }
                      className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-outline transition-colors hover:text-primary"
                      aria-label="Abrir lista de municípios"
                    >
                      <Icon
                        name={
                          isCityDropdownOpen
                            ? 'keyboard_arrow_up'
                            : 'keyboard_arrow_down'
                        }
                        size={22}
                      />
                    </button>

                    {isCityDropdownOpen ? (
                      <div
                        id="city-options"
                        className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-lg border border-outline-variant bg-white shadow-xl"
                      >
                        <div className="max-h-64 overflow-y-auto py-2">
                          {isLoadingCities ? (
                            <p className="px-4 py-3 text-body-md text-on-surface-variant">
                              Carregando municípios do Ceará...
                            </p>
                          ) : citiesError ? (
                            <p className="px-4 py-3 text-body-md text-error">
                              {citiesError}
                            </p>
                          ) : filteredCities.length > 0 ? (
                            filteredCities.map((cityOption) => (
                              <button
                                key={cityOption.id}
                                type="button"
                                onClick={() => selectCity(cityOption.nome)}
                                className={`flex w-full items-center justify-between px-4 py-3 text-left text-body-md transition-colors hover:bg-blue-50 ${
                                  city === cityOption.nome
                                    ? 'font-semibold text-primary'
                                    : 'text-on-surface'
                                }`}
                              >
                                <span>{cityOption.nome}</span>
                                {city === cityOption.nome ? (
                                  <Icon name="check" size={18} />
                                ) : null}
                              </button>
                            ))
                          ) : (
                            <p className="px-4 py-3 text-body-md text-on-surface-variant">
                              Nenhum município encontrado.
                            </p>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </Field>
              </div>
            </FormSection>

            <FormSection
              icon="drive_folder_upload"
              title="Documentos Adicionais"
              description="Anexe outros documentos que julgar necessário"
              optional
            >
              <label
                htmlFor="extra-documents"
                className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-primary/30 bg-[#fbfcff] px-6 py-8 text-center transition-colors hover:border-primary hover:bg-blue-50/50"
              >
                <Icon name="cloud_upload" size={42} className="text-primary" />
                <span className="mt-3 text-label-md font-bold">
                  Arraste e solte os arquivos aqui
                </span>
                <span className="mt-1 text-body-md text-on-surface-variant">
                  ou clique para selecionar
                </span>
                <span className="mt-3 text-body-sm text-outline">
                  PDF, JPG, PNG ou DOC/DOCX
                </span>
                {extraFiles.length > 0 ? (
                  <span className="mt-3 text-label-sm font-semibold text-primary">
                    {extraFiles.length} arquivo(s) selecionado(s)
                  </span>
                ) : null}
              </label>
              <input
                id="extra-documents"
                type="file"
                multiple
                className="sr-only"
                onChange={handleExtraFileChange}
              />
              {extraFiles.length > 0 ? (
                <div className="mt-5 space-y-3">
                  {extraFiles.map((file) => (
                    <div
                      key={fileKey(file)}
                      className="flex flex-col gap-3 rounded-lg border border-outline-variant/70 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-primary">
                          <Icon name="draft" size={22} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-label-md font-semibold text-on-surface">
                            {file.name}
                          </p>
                          <p className="text-body-sm text-on-surface-variant">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExtraFile(file)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-error/25 px-3 text-label-md font-semibold text-error transition-colors hover:bg-error-container"
                        aria-label={`Remover ${file.name}`}
                      >
                        <Icon name="delete" size={18} />
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </FormSection>

            <FormSection
              icon="edit_note"
              title="Informações Adicionais"
              description="Inclua observações, contexto ou instruções importantes para análise"
              optional
            >
              <textarea
                value={additionalInfo}
                onChange={(event) => setAdditionalInfo(event.target.value)}
                maxLength={additionalInfoMaxLength}
                rows={8}
                placeholder="Digite informações adicionais sobre a proposta, o cliente ou os documentos enviados."
                className="proposal-textarea"
              />
              <div className="mt-2 flex justify-end">
                <span className="text-body-sm text-outline">
                  {additionalInfo.length.toLocaleString('pt-BR')} /{' '}
                  {additionalInfoMaxLength.toLocaleString('pt-BR')} caracteres
                </span>
              </div>
            </FormSection>

            <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
              <div className="rounded-lg border border-outline-variant/60 bg-white p-6 shadow-sm">
                <h2 className="text-headline-md font-bold">Resumo da Proposta</h2>
                <dl className="mt-5 space-y-4 text-body-md">
                  <SummaryRow label="Cliente" value={clientLabel} muted={!clientName} />
                  <SummaryRow
                    label="E-mail"
                    value={emailLabel}
                    muted={!clientEmail || Boolean(emailError)}
                  />
                  <SummaryRow label="Tipo do imóvel" value={propertyType} />
                  <SummaryRow label="Município" value={cityLabel} muted={!city} />
                </dl>
              </div>

              <div className="space-y-5">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
                  <div className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-emerald-600">
                      <Icon name="verified_user" size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-emerald-950">
                        Seus arquivos estão seguros
                      </p>
                      <p className="mt-1 text-body-sm text-emerald-900/75">
                        Todos os documentos são enviados com segurança e
                        armazenados para análise.
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleSubmit}
                  icon="send"
                  className="h-14 text-base uppercase tracking-normal"
                >
                  Enviar documentação
                </Button>
              </div>
            </section>
          </div>
        </main>

        <footer className="px-4 py-6 text-center text-body-sm text-outline sm:px-8">
          © 2024 Rafael Bot. Todos os direitos reservados.
        </footer>
      </div>
    </div>
  )
}

type SidebarItemProps = {
  icon: string
  label: string
  active?: boolean
}

function SidebarItem({ icon, label, active = false }: SidebarItemProps) {
  return (
    <button
      type="button"
      className={`flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-label-md font-semibold transition-colors ${
        active
          ? 'bg-primary-fixed text-primary'
          : 'text-on-surface-variant hover:bg-surface-container-low'
      }`}
    >
      <Icon name={icon} size={20} />
      <span>{label}</span>
    </button>
  )
}

type FormSectionProps = {
  icon: string
  title: string
  description?: string
  optional?: boolean
  children: React.ReactNode
}

function FormSection({
  icon,
  title,
  description,
  optional = false,
  children,
}: FormSectionProps) {
  return (
    <section className="rounded-lg border border-outline-variant/60 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-primary">
          <Icon name={icon} size={22} />
        </div>
        <div>
          <h2 className="text-headline-md font-bold">
            {title}{' '}
            {optional ? (
              <span className="text-body-sm font-normal text-outline">
                (opcional)
              </span>
            ) : null}
          </h2>
          {description ? (
            <p className="mt-1 text-body-md text-on-surface-variant">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  )
}

type FieldProps = {
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: React.ReactNode
}

function Field({ label, required = false, hint, error, children }: FieldProps) {
  return (
    <label className="block space-y-2">
      <span className="block text-label-md font-semibold text-on-surface">
        {label}{' '}
        {required ? (
          <span className="text-error" aria-hidden>
            *
          </span>
        ) : null}
        {hint ? (
          <span className="font-normal text-outline">({hint})</span>
        ) : null}
      </span>
      {children}
      {error ? (
        <span className="block text-body-sm text-error" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  )
}

type SummaryRowProps = {
  label: string
  value: string
  muted?: boolean
  success?: boolean
}

function SummaryRow({
  label,
  value,
  muted = false,
  success = false,
}: SummaryRowProps) {
  return (
    <div className="flex flex-wrap gap-x-2 gap-y-1">
      <dt className="font-semibold text-on-surface-variant">{label}:</dt>
      <dd
        className={`font-bold ${
          success ? 'text-emerald-600' : muted ? 'text-outline' : 'text-primary'
        }`}
      >
        {value}
      </dd>
    </div>
  )
}
