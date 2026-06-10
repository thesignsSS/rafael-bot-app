import { ProposalClientCard } from '../components/detail/ProposalClientCard'
import { ProposalDetailHeader } from '../components/detail/ProposalDetailHeader'
import { ProposalDocumentsSection } from '../components/detail/ProposalDocumentsSection'
import { ProposalPropertyCard } from '../components/detail/ProposalPropertyCard'
import { useProposalDetailPage } from '../hooks/useProposalDetailPage'

export default function ProposalDetailPage() {
  const {
    status,
    proposal,
    documents,
    goBack,
    downloadAll,
    renameDocument,
    deleteDocument,
    viewDocument,
    addDocuments,
  } = useProposalDetailPage()

  if (status === 'loading' || !proposal) {
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
      <ProposalDetailHeader
        proposalId={proposal.id}
        ownerName={proposal.ownerName}
        onBack={goBack}
        onDownloadAll={downloadAll}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <ProposalClientCard
            name={proposal.client.name}
            cpf={proposal.client.cpf}
            phone={proposal.client.phone}
          />

          <ProposalPropertyCard
            propertyType={proposal.property.type}
            location={proposal.property.location}
          />
        </div>

        <div className="lg:col-span-2">
          <ProposalDocumentsSection
            documents={documents}
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
