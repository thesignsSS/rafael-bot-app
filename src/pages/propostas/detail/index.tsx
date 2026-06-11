import { ProposalBrokerCard } from '../components/detail/ProposalBrokerCard'
import { ProposalClientCard } from '../components/detail/ProposalClientCard'
import { ProposalDetailHeader } from '../components/detail/ProposalDetailHeader'
import { ProposalDocumentsSection } from '../components/detail/ProposalDocumentsSection'
import { ProposalEditForm } from '../components/detail/ProposalEditForm'
import { ProposalDocumentPreviewModal } from '../components/detail/ProposalDocumentPreviewModal'
import { ProposalPropertyCard } from '../components/detail/ProposalPropertyCard'
import { ProposalStatusControl } from '../components/detail/ProposalStatusControl'
import { useProposalDetailPage } from '../hooks/useProposalDetailPage'
import { normalizeProposalStatus } from '../types/proposal-status'

export default function ProposalDetailPage() {
  const {
    status,
    proposal,
    documents,
    error,
    refetch,
    isEditing,
    isAdmin,
    editDraft,
    documentPreview,
    isSavingProposal,
    isSavingStatus,
    statusOptions,
    isUpdatingDocuments,
    goBack,
    startEditing,
    cancelEditing,
    updateEditDraft,
    saveProposal,
    changeProposalStatus,
    downloadAll,
    renameDocument,
    deleteDocument,
    viewDocument,
    closeDocumentPreview,
    addDocuments,
  } = useProposalDetailPage()

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
            onDelete={deleteDocument}
            onView={viewDocument}
            onFilesSelected={addDocuments}
          />
        </div>
      </div>
    </div>
  )
}
