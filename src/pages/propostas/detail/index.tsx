import { useEffect, useState } from 'react'
import { PendingReasonModal } from '../components/detail/PendingReasonModal'
import { PendingDocumentsUploadModal } from '../components/detail/PendingDocumentsUploadModal'
import { ProposalBrokerCard } from '../components/detail/ProposalBrokerCard'
import { ProposalCommentsSection } from '../components/detail/ProposalCommentsSection'
import { ProposalClientCard } from '../components/detail/ProposalClientCard'
import { ProposalDetailHeader } from '../components/detail/ProposalDetailHeader'
import { ProposalDocumentsSection } from '../components/detail/ProposalDocumentsSection'
import { ProposalEditForm } from '../components/detail/ProposalEditForm'
import { ProposalDocumentPreviewModal } from '../components/detail/ProposalDocumentPreviewModal'
import { ProposalPropertyCard } from '../components/detail/ProposalPropertyCard'
import { ProposalStatusControl } from '../components/detail/ProposalStatusControl'
import { ProposalTimelineSection } from '../components/detail/ProposalTimelineSection'
import { useProposalDetailPage } from '../hooks/useProposalDetailPage'
import { normalizeProposalStatus } from '../types/proposal-status'

type DetailTab = 'informacoes' | 'comentarios' | 'timeline'

export default function ProposalDetailPage() {
  const {
    status,
    proposal,
    documents,
    error,
    refetch,
    isEditing,
    isAdmin,
    canBrokerHandlePending,
    editDraft,
    documentPreview,
    isSavingProposal,
    isSavingStatus,
    isSavingComment,
    statusOptions,
    isUpdatingDocuments,
    isPendingReasonModalOpen,
    isPendingDocumentsModalOpen,
    pendingReasonDraft,
    pendingDocumentsDraft,
    commentDraft,
    hasPendingUpdates,
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
    openPendingDocumentsModal,
    closePendingDocumentsModal,
    stagePendingDocuments,
    removePendingDocument,
    addComment,
    setCommentDraft,
    resendForAnalysis,
  } = useProposalDetailPage()
  const [activeTab, setActiveTab] = useState<DetailTab>('informacoes')
  const normalizedStatus = normalizeProposalStatus(proposal?.status)
  const shouldHighlightComments = canBrokerHandlePending
  const canResendForAnalysis =
    canBrokerHandlePending &&
    (hasPendingUpdates || pendingDocumentsDraft.length > 0)
  const latestComment = proposal?.comments[proposal.comments.length - 1] ?? null
  const shouldEmphasizeLatestAdminComment =
    canBrokerHandlePending &&
    normalizedStatus === 'pendente' &&
    latestComment?.authorRole === 'admin'
  const latestAdminCommentId = shouldEmphasizeLatestAdminComment
    ? latestComment?.id ?? null
    : null

  useEffect(() => {
    if (canBrokerHandlePending && normalizedStatus === 'pendente') {
      setActiveTab('comentarios')
    }
  }, [canBrokerHandlePending, normalizedStatus])

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
        onBack={goBack}
        onEdit={startEditing}
        onDownloadAll={downloadAll}
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
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('informacoes')}
            className={`rounded-lg px-4 py-2 text-label-md font-semibold transition-all ${
              activeTab === 'informacoes'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
            }`}
          >
            Informações gerais
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
              {latestAdminCommentId ? (
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
        </div>
      </div>

      {activeTab === 'informacoes' ? (
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
                <h3 className="text-headline-md font-semibold text-on-surface">
                  Informações adicionais
                </h3>
                <p className="mt-3 whitespace-pre-wrap text-body-md text-on-surface-variant">
                  {proposal.additionalInfo || 'Nenhuma informação adicional registrada.'}
                </p>
              </section>
            </div>

            <div className="lg:col-span-2">
              <ProposalDocumentsSection
                documents={documents}
                isBusy={isUpdatingDocuments}
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
      ) : activeTab === 'comentarios' ? (
        <ProposalCommentsSection
          pendingReason={proposal.pendingReason}
          comments={proposal.comments}
          emphasized={shouldHighlightComments}
          highlightedCommentId={latestAdminCommentId}
          scrollToCommentId={activeTab === 'comentarios' ? latestAdminCommentId : null}
          pendingDocuments={pendingDocumentsDraft.map((file) => ({
            file,
            key: `${file.name}-${file.size}-${file.lastModified}`,
          }))}
          commentDraft={commentDraft}
          isSavingComment={isSavingComment}
          isUploadingPendingDocuments={isUpdatingDocuments}
          isResending={isSavingStatus}
          canAddComment={isAdmin || canBrokerHandlePending}
          canUploadPendingDocuments={canBrokerHandlePending}
          canResend={canResendForAnalysis}
          hasPendingUpdates={hasPendingUpdates}
          onCommentDraftChange={setCommentDraft}
          onAddComment={addComment}
          onUploadPendingDocuments={openPendingDocumentsModal}
          onRemovePendingDocument={removePendingDocument}
          onResend={resendForAnalysis}
        />
      ) : (
        <ProposalTimelineSection
          proposalCode={proposal.proposalCode}
          createdAt={proposal.createdAt}
          brokerName={proposal.brokerName}
          status={normalizedStatus}
          comments={proposal.comments}
        />
      )}
    </div>
  )
}
