import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../../../contexts/auth-context'
import { useNotifications } from '../../../hooks/useNotifications'
import {
  ASSISTANT_CONTEXT_EVENT,
  ASSISTANT_OPEN_EVENT,
} from '../../../lib/assistant'
import {
  buildProposalAssistantContext,
  buildProposalOperationalGuide,
} from '../lib/proposalOperationalGuide'
import { DeleteProposalModal } from '../components/detail/DeleteProposalModal'
import { PendingReasonModal } from '../components/detail/PendingReasonModal'
import { PendingDocumentsUploadModal } from '../components/detail/PendingDocumentsUploadModal'
import { ProposalBrokerCard } from '../components/detail/ProposalBrokerCard'
import { ProposalCommentsSection } from '../components/detail/ProposalCommentsSection'
import { ProposalClientCard } from '../components/detail/ProposalClientCard'
import { ProposalDetailHeader } from '../components/detail/ProposalDetailHeader'
import { ProposalDocumentsSection } from '../components/detail/ProposalDocumentsSection'
import { ProposalEditForm } from '../components/detail/ProposalEditForm'
import { ProposalDocumentPreviewModal } from '../components/detail/ProposalDocumentPreviewModal'
import { ProposalGuestsSection } from '../components/detail/ProposalGuestsSection'
import { ProposalIncomeValidationForm } from '../components/detail/ProposalIncomeValidationForm'
import { ProposalInfoField } from '../components/detail/ProposalInfoField'
import { ProposalOperationalGuideCard } from '../components/detail/ProposalOperationalGuideCard'
import { ProposalPropertyCard } from '../components/detail/ProposalPropertyCard'
import { RemoveProposalGuestModal } from '../components/detail/RemoveProposalGuestModal'
import { ProposalStatusControl } from '../components/detail/ProposalStatusControl'
import { ProposalTimelineSection } from '../components/detail/ProposalTimelineSection'
import { useProposalDetailPage } from '../hooks/useProposalDetailPage'
import { normalizeProposalStatus } from '../types/proposal-status'
import { Icon } from '../../../components/ui/Icon'

type DetailTab =
  | 'dados_proposta'
  | 'validacao_renda'
  | 'tratativa'
  | 'comentarios'
  | 'timeline'
  | 'convidados'

function readIncomeValidationFinalized(formData: Record<string, unknown> | undefined) {
  const rawValue = formData?.validacao_renda

  if (typeof rawValue !== 'object' || rawValue === null) {
    return false
  }

  return (rawValue as { finalized?: boolean }).finalized === true
}

export default function ProposalDetailPage() {
  const { currentUserProfile } = useAuth()
  const { items: notifications, markAsRead } = useNotifications(
    currentUserProfile?.id,
  )
  const {
    status,
    proposal,
    documents,
    error,
    refetch,
    isEditing,
    isAdmin,
    isBrokerReadOnly,
    canBrokerHandlePending,
    canViewGuests,
    canManageGuests,
    canDeleteProposal,
    editDraft,
    shareLink,
    inviteQuery,
    inviteCandidates,
    selectedInviteeId,
    inviteHelperMessage,
    documentPreview,
    isSavingProposal,
    isSavingStatus,
    isSavingComment,
    statusOptions,
    isUpdatingDocuments,
    isManagingGuests,
    guestPendingRemoval,
    isGeneratingShareLink,
    isSearchingInviteCandidates,
    isPendingReasonModalOpen,
    isPendingDocumentsModalOpen,
    isDeleteProposalModalOpen,
    isDeletingProposal,
    pendingReasonDraft,
    pendingDocumentsDraft,
    commentDraft,
    hasPendingUpdates,
    proposalBank,
    updateProposalState,
    goBack,
    startEditing,
    cancelEditing,
    updateEditDraft,
    saveProposal,
    changeProposalStatus,
    closePendingReasonModal,
    confirmPendingReason,
    setPendingReasonDraft,
    downloadAll,
    renameDocument,
    downloadDocument,
    deleteDocument,
    viewDocument,
    openAllDocumentsPreview,
    closeDocumentPreview,
    addDocuments,
    generateShareLink,
    updateInviteQuery,
    selectInvitee,
    sendInvitation,
    openRemoveGuestModal,
    closeRemoveGuestModal,
    confirmRemoveGuest,
    openPendingDocumentsModal,
    closePendingDocumentsModal,
    openDeleteProposalModal,
    closeDeleteProposalModal,
    confirmDeleteProposal,
    stagePendingDocuments,
    removePendingDocument,
    addComment,
    setCommentDraft,
    resendForAnalysis,
  } = useProposalDetailPage()
  const [activeTab, setActiveTab] = useState<DetailTab>('dados_proposta')
  const [isIncomeValidationFinalized, setIsIncomeValidationFinalized] =
    useState(false)
  const [isIncomeValidationTransitionModalOpen, setIsIncomeValidationTransitionModalOpen] =
    useState(false)
  const normalizedStatus = normalizeProposalStatus(proposal?.status)
  const hasIncomeValidationStep = normalizedStatus === 'validacao_renda'
  const canAdvanceToIncomeValidation = normalizedStatus === 'aprovado'
  const shouldShowStandardTabs =
    !hasIncomeValidationStep && normalizedStatus !== 'aprovado'
  const shouldHighlightComments = canBrokerHandlePending
  const canResendForAnalysis =
    canBrokerHandlePending &&
    (hasPendingUpdates || pendingDocumentsDraft.length > 0)
  const isBrokerFullyLocked =
    isBrokerReadOnly || (!isAdmin && isIncomeValidationFinalized)
  const canEditProposal = !isBrokerFullyLocked
  const latestComment = proposal?.comments[proposal.comments.length - 1] ?? null
  const shouldShowPendingIndicator = normalizedStatus === 'pendente'
  const shouldShowCommentsIndicator =
    normalizedStatus === 'pendente' && latestComment?.authorRole === 'admin'
  const shouldEmphasizeLatestAdminComment =
    canBrokerHandlePending &&
    normalizedStatus === 'pendente' &&
    latestComment?.authorRole === 'admin'
  const latestAdminCommentId = shouldEmphasizeLatestAdminComment
    ? latestComment?.id ?? null
    : null
  const operationalGuide = useMemo(
    () =>
      proposal
        ? buildProposalOperationalGuide({
            proposal,
            normalizedStatus,
            hasPendingUpdates,
            pendingDocumentsCount: pendingDocumentsDraft.length,
            hasDraftComment: commentDraft.trim().length > 0,
            isEditing,
          })
        : null,
    [
      commentDraft,
      hasPendingUpdates,
      isEditing,
      normalizedStatus,
      pendingDocumentsDraft.length,
      proposal,
    ],
  )
  const assistantProposalContext = useMemo(
    () =>
      proposal && operationalGuide
        ? buildProposalAssistantContext({
            proposal,
            normalizedStatus,
            guide: operationalGuide,
          })
        : null,
    [normalizedStatus, operationalGuide, proposal],
  )
  const unreadGuestNotifications = useMemo(
    () =>
      proposal && canManageGuests
        ? notifications.filter(
            (item) =>
              item.type === 'proposal_collaborator_added' &&
              item.proposalId === proposal.id &&
              item.readAt === null,
          )
        : [],
    [canManageGuests, notifications, proposal],
  )
  const unreadGuestsCount = unreadGuestNotifications.length
  const shouldShowGuestsIndicator = unreadGuestsCount > 0

  useEffect(() => {
    setIsIncomeValidationFinalized(readIncomeValidationFinalized(proposal?.formData))
  }, [proposal?.formData])

  useEffect(() => {
    if (canBrokerHandlePending && normalizedStatus === 'pendente') {
      setActiveTab('tratativa')
    }
  }, [canBrokerHandlePending, normalizedStatus])

  useEffect(() => {
    if (hasIncomeValidationStep && activeTab !== 'dados_proposta' && activeTab !== 'validacao_renda') {
      setActiveTab('dados_proposta')
    }
    if (!hasIncomeValidationStep && activeTab === 'validacao_renda') {
      setActiveTab('dados_proposta')
    }
  }, [activeTab, hasIncomeValidationStep])

  useEffect(() => {
    if (activeTab !== 'convidados' || unreadGuestNotifications.length === 0) {
      return
    }

    unreadGuestNotifications.forEach((notification) => {
      void markAsRead(notification.id)
    })
  }, [activeTab, markAsRead, unreadGuestNotifications])

  useEffect(() => {
    if (!assistantProposalContext) {
      window.dispatchEvent(new CustomEvent(ASSISTANT_CONTEXT_EVENT, { detail: null }))
      return
    }

    window.dispatchEvent(
      new CustomEvent(ASSISTANT_CONTEXT_EVENT, {
        detail: assistantProposalContext,
      }),
    )

    return () => {
      window.dispatchEvent(new CustomEvent(ASSISTANT_CONTEXT_EVENT, { detail: null }))
    }
  }, [assistantProposalContext])

  if (status === 'loading' || !proposal) {
    if (status === 'error') {
      return (
        <div className="mx-auto max-w-[1200px] rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
          <h2 className="text-headline-lg font-semibold text-on-surface">
            Não foi possível carregar a proposta
          </h2>
          <p className="mt-2 text-body-md text-on-surface-variant">
            {error ?? 'Tente novamente em instantes.'}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={goBack}
              className="rounded-lg border border-outline px-4 py-2 text-label-md font-semibold text-primary transition-all hover:bg-surface-container-low"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={refetch}
              className="rounded-lg bg-primary px-4 py-2 text-label-md font-semibold text-on-primary transition-all hover:bg-primary-container"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="mx-auto max-w-[1200px] animate-pulse space-y-6">
        <div className="h-24 rounded-xl bg-surface-container" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6">
            <div className="h-56 rounded-xl bg-surface-container" />
            <div className="h-40 rounded-xl bg-surface-container" />
          </div>
          <div className="h-[520px] rounded-xl bg-surface-container lg:col-span-2" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1200px] animate-fade-up">
      <PendingReasonModal
        isOpen={isPendingReasonModalOpen}
        isSaving={isSavingStatus}
        value={pendingReasonDraft}
        onChange={setPendingReasonDraft}
        onClose={closePendingReasonModal}
        onConfirm={confirmPendingReason}
      />

      <PendingDocumentsUploadModal
        isOpen={isPendingDocumentsModalOpen}
        isSaving={false}
        onClose={closePendingDocumentsModal}
        onSave={stagePendingDocuments}
      />

      <DeleteProposalModal
        isOpen={isDeleteProposalModalOpen}
        isDeleting={isDeletingProposal}
        proposalCode={proposal.proposalCode}
        onClose={closeDeleteProposalModal}
        onConfirm={confirmDeleteProposal}
      />

      <RemoveProposalGuestModal
        isOpen={guestPendingRemoval !== null}
        guestName={guestPendingRemoval?.name ?? ''}
        isRemoving={isManagingGuests}
        onClose={closeRemoveGuestModal}
        onConfirm={() => void confirmRemoveGuest()}
      />

      {documentPreview ? (
        <ProposalDocumentPreviewModal
          fileName={documentPreview.fileName}
          kind={documentPreview.kind}
          url={documentPreview.url}
          onClose={closeDocumentPreview}
        />
      ) : null}

      <ProposalDetailHeader
        proposalCode={proposal.proposalCode}
        brokerName={proposal.brokerName}
        ownerName={proposal.ownerName}
        isOwnedByCurrentUser={proposal.isOwnedByCurrentUser}
        isSharedWithCurrentUser={proposal.isSharedWithCurrentUser}
        canEditProposal={canEditProposal}
        canDeleteProposal={canDeleteProposal && !isBrokerFullyLocked}
        canShareProposal={canManageGuests && !isBrokerFullyLocked}
        onBack={goBack}
        onEdit={startEditing}
        onDownloadAll={downloadAll}
        onShare={() => void generateShareLink()}
        onDelete={openDeleteProposalModal}
        isSharing={isGeneratingShareLink}
        isDeleting={isDeletingProposal}
      />

      <div className="mb-6">
        <ProposalStatusControl
          status={normalizeProposalStatus(proposal.status)}
          statusOptions={statusOptions}
          canChangeStatus={isAdmin}
          isSaving={isSavingStatus}
          onChangeStatus={changeProposalStatus}
        />
      </div>

      <div className="mb-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-2 shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('dados_proposta')}
            className={`rounded-lg px-4 py-2 text-label-md font-semibold transition-all ${
              activeTab === 'dados_proposta'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
            }`}
          >
            Dados da Proposta
          </button>
          {hasIncomeValidationStep ? (
            <button
              type="button"
              onClick={() => setActiveTab('validacao_renda')}
              className={`rounded-lg px-4 py-2 text-label-md font-semibold transition-all ${
                activeTab === 'validacao_renda'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              Validação de Renda
            </button>
          ) : shouldShowStandardTabs ? (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('tratativa')}
                className={`rounded-lg px-4 py-2 text-label-md font-semibold transition-all ${
                  activeTab === 'tratativa'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>Tratativa</span>
                  {shouldShowPendingIndicator ? (
                    <span
                      className="inline-flex h-2.5 w-2.5 rounded-full bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.12)] animate-gentle-pulse"
                      aria-label="Há tratativa pendente"
                      title="Há tratativa pendente"
                    />
                  ) : null}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('comentarios')}
                className={`rounded-lg px-4 py-2 text-label-md font-semibold transition-all ${
                  activeTab === 'comentarios'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>Comentários</span>
                  {shouldShowCommentsIndicator ? (
                    <span
                      className="inline-flex h-2.5 w-2.5 rounded-full bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.12)] animate-gentle-pulse"
                      aria-label="Há comentário pendente do administrador"
                      title="Há comentário pendente do administrador"
                    />
                  ) : null}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('timeline')}
                className={`rounded-lg px-4 py-2 text-label-md font-semibold transition-all ${
                  activeTab === 'timeline'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                Linha do tempo
              </button>
              {canViewGuests ? (
                <button
                  type="button"
                  onClick={() => setActiveTab('convidados')}
                  className={`rounded-lg px-4 py-2 text-label-md font-semibold transition-all ${
                    activeTab === 'convidados'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>Convidados</span>
                    {canManageGuests && shouldShowGuestsIndicator ? (
                      <span
                        className="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[11px] font-semibold text-white shadow-[0_0_0_3px_rgba(245,158,11,0.12)] animate-gentle-pulse"
                        aria-label={`${unreadGuestsCount} novo${unreadGuestsCount === 1 ? '' : 's'} convidado${unreadGuestsCount === 1 ? '' : 's'} não visualizado${unreadGuestsCount === 1 ? '' : 's'}`}
                        title={`${unreadGuestsCount} novo${unreadGuestsCount === 1 ? '' : 's'} convidado${unreadGuestsCount === 1 ? '' : 's'} não visualizado${unreadGuestsCount === 1 ? '' : 's'}`}
                      >
                        {unreadGuestsCount > 9 ? '9+' : unreadGuestsCount}
                      </span>
                    ) : null}
                  </span>
                </button>
              ) : null}
            </>
          ) : null}
          </div>
          {canAdvanceToIncomeValidation ? (
            <button
              type="button"
              onClick={() => setIsIncomeValidationTransitionModalOpen(true)}
              disabled={isSavingStatus}
              className="rounded-lg bg-primary px-4 py-2 text-label-md font-semibold text-on-primary shadow-[0_0_0_1px_rgba(147,197,253,0.28),0_0_24px_rgba(96,165,250,0.22)] ring-1 ring-primary/30 transition-all hover:bg-primary-container hover:shadow-[0_0_0_1px_rgba(147,197,253,0.4),0_0_32px_rgba(96,165,250,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSavingStatus ? 'Alterando...' : 'Seguir para validação de renda'}
            </button>
          ) : null}
        </div>
      </div>

      {isBrokerFullyLocked && activeTab === 'dados_proposta' ? (
        <div className="mb-6 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-body-md text-on-surface">
          Essa proposta está aprovada, não é possível modificá-la.
        </div>
      ) : null}

      {activeTab === 'dados_proposta' ? (
        <>
          {isEditing && editDraft ? (
            <ProposalEditForm
              draft={editDraft}
              isSaving={isSavingProposal}
              onChange={updateEditDraft}
              onCancel={cancelEditing}
              onSave={saveProposal}
            />
          ) : null}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-1">
              <ProposalBrokerCard
                name={proposal.brokerName}
                phone={proposal.brokerPhone}
              />

              <ProposalClientCard
                name={proposal.client.name}
                cpf={proposal.client.cpf}
                phone={proposal.client.phone}
                email={proposal.client.email}
              />

              <ProposalPropertyCard
                propertyType={proposal.property.type}
                city={proposal.property.city}
                state={proposal.property.state}
              />

              <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
                <div className="mb-4 flex items-center gap-2 text-primary">
                  <Icon name="account_balance" size={22} />
                  <h3 className="text-headline-md font-semibold text-on-surface">
                    Banco da proposta
                  </h3>
                </div>
                <div className="mt-4">
                  <ProposalInfoField
                    label="Banco selecionado"
                    value={proposalBank || 'Não informado'}
                  />
                </div>
              </section>

              <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
                <div className="mb-4 flex items-center gap-2 text-primary">
                  <Icon name="info" size={22} />
                  <h3 className="text-headline-md font-semibold text-on-surface">
                    Informações adicionais
                  </h3>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-body-md text-on-surface-variant">
                  {proposal.additionalInfo || 'Nenhuma informação adicional registrada.'}
                </p>
              </section>
            </div>

            <div className="lg:col-span-2">
              <ProposalDocumentsSection
                documents={documents}
                isBusy={isUpdatingDocuments}
                canManageDocuments={!isBrokerFullyLocked}
                onRename={renameDocument}
                onDownload={downloadDocument}
                onDelete={deleteDocument}
                onView={viewDocument}
                onViewAll={openAllDocumentsPreview}
                onFilesSelected={addDocuments}
              />
            </div>
          </div>
        </>
      ) : activeTab === 'validacao_renda' ? (
        <ProposalIncomeValidationForm
          proposal={proposal}
          isAdmin={isAdmin}
          isFinalized={isIncomeValidationFinalized}
          onFinalize={() => setIsIncomeValidationFinalized(true)}
          onPersistedFormDataChange={(formData) =>
            updateProposalState((currentProposal) => ({
              ...currentProposal,
              formData,
            }))
          }
        />
      ) : activeTab === 'tratativa' ? (
        operationalGuide ? (
          <ProposalOperationalGuideCard
            guide={operationalGuide}
            pendingReason={proposal.pendingReason}
            pendingDocuments={pendingDocumentsDraft.map((file) => ({
              file,
              key: `${file.name}-${file.size}-${file.lastModified}`,
            }))}
            isBusy={isUpdatingDocuments || isSavingStatus}
            canUploadPendingDocuments={canBrokerHandlePending}
            canResend={canResendForAnalysis}
            onOpenComments={() => setActiveTab('comentarios')}
            onOpenPendingDocuments={openPendingDocumentsModal}
            onRemovePendingDocument={removePendingDocument}
            onResend={resendForAnalysis}
            onOpenAssistant={() => {
              window.dispatchEvent(
                new CustomEvent(ASSISTANT_OPEN_EVENT, {
                  detail: { prompt: operationalGuide.recommendedPrompt },
                }),
              )
            }}
          />
        ) : null
      ) : activeTab === 'comentarios' ? (
        <ProposalCommentsSection
          pendingReason={proposal.pendingReason}
          comments={proposal.comments}
          emphasized={shouldHighlightComments}
          highlightedCommentId={latestAdminCommentId}
          scrollToCommentId={null}
          commentDraft={commentDraft}
          isSavingComment={isSavingComment}
          canAddComment={isAdmin || canBrokerHandlePending}
          onCommentDraftChange={setCommentDraft}
          onAddComment={addComment}
        />
      ) : (
        activeTab === 'convidados' && canViewGuests ? (
          <ProposalGuestsSection
            guests={proposal.guests}
            pendingInvitations={proposal.pendingInvitations}
            ownerName={proposal.ownerName}
            canManageGuests={canManageGuests}
            shareLink={shareLink}
            isBusy={isManagingGuests || isGeneratingShareLink}
            inviteQuery={inviteQuery}
            inviteCandidates={inviteCandidates}
            selectedInviteeId={selectedInviteeId}
            isSearchingInviteCandidates={isSearchingInviteCandidates}
            inviteHelperMessage={inviteHelperMessage}
            onInviteQueryChange={updateInviteQuery}
            onSelectInvitee={selectInvitee}
            onSendInvite={() => void sendInvitation()}
            onCopyShareLink={() => void generateShareLink()}
            onRemoveGuest={openRemoveGuestModal}
          />
        ) : (
          <ProposalTimelineSection
            proposalCode={proposal.proposalCode}
            createdAt={proposal.createdAt}
            brokerName={proposal.brokerName}
            ownerAvatarPath={proposal.ownerAvatarPath}
            status={normalizedStatus}
            comments={proposal.comments}
          />
        )
      )}

      {isIncomeValidationTransitionModalOpen
        ? createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#131b2e]/55 p-4 backdrop-blur-[2px]">
              <div className="w-full max-w-xl rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0px_24px_60px_rgba(0,0,0,0.25)]">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-orange-500/16 p-2 text-orange-400">
                    <Icon name="warning" size={22} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-title-lg font-semibold text-on-surface">
                      Seguir para validação de renda
                    </h4>
                    <p className="mt-2 text-body-md text-on-surface-variant">
                      Siga para validação de renda apenas se o cliente realmente for
                      continuar com o financiamento.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsIncomeValidationTransitionModalOpen(false)}
                    disabled={isSavingStatus}
                    className="rounded-xl border border-outline px-4 py-2.5 text-label-md font-semibold text-on-surface transition-all hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const hasChangedStatus = await changeProposalStatus(
                        'validacao_renda',
                      )

                      if (!hasChangedStatus) {
                        return
                      }

                      setIsIncomeValidationTransitionModalOpen(false)
                      setActiveTab('validacao_renda')
                    }}
                    disabled={isSavingStatus}
                    className="rounded-xl bg-primary px-4 py-2.5 text-label-md font-semibold text-on-primary transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSavingStatus ? 'Alterando...' : 'Confirmar'}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
