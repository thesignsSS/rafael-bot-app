import { DeleteEngenhariaRequestModal } from '../components/DeleteEngenhariaRequestModal'
import { EngenhariaCommentsSection } from './components/EngenhariaCommentsSection'
import { EngenhariaRequestDetailHeader } from './components/EngenhariaRequestDetailHeader'
import { EngenhariaRequestEditForm } from './components/EngenhariaRequestEditForm'
import { EngenhariaRequestSummary } from './components/EngenhariaRequestSummary'
import { useEngenhariaRequestDetailPage } from './hooks/useEngenhariaRequestDetailPage'

export default function EngenhariaRequestDetailPage() {
  const page = useEngenhariaRequestDetailPage()

  if (page.isLoading) {
    return (
      <div className="mx-auto max-w-6xl py-16 text-center text-body-md text-on-surface-variant">
        Carregando solicitação...
      </div>
    )
  }

  if (page.error || !page.request) {
    return (
      <div className="mx-auto max-w-6xl py-16 text-center text-body-md text-error">
        {page.error ?? 'Solicitação de engenharia não encontrada.'}
      </div>
    )
  }

  const { request } = page

  return (
    <div className="mx-auto max-w-6xl">
      <EngenhariaRequestDetailHeader
        request={request}
        onBack={page.goBack}
        onEdit={page.startEditing}
        onDelete={page.openDeleteModal}
      />

      <div className="mb-6 border-b border-outline-variant">
        <div role="tablist" aria-label="Navegação da solicitação" className="flex gap-6">
          <button
            type="button"
            role="tab"
            aria-selected={page.activeTab === 'dados'}
            onClick={() => page.setActiveTab('dados')}
            className={`border-b-2 px-1 pb-3 text-label-lg font-semibold transition-all ${
              page.activeTab === 'dados'
                ? 'border-primary text-on-surface'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Dados
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={page.activeTab === 'comentarios'}
            onClick={() => page.setActiveTab('comentarios')}
            className={`border-b-2 px-1 pb-3 text-label-lg font-semibold transition-all ${
              page.activeTab === 'comentarios'
                ? 'border-primary text-on-surface'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Comentários {request.comments.length > 0 ? `(${request.comments.length})` : ''}
          </button>
        </div>
      </div>

      {page.activeTab === 'dados' ? (
        page.isEditing && page.editDraft ? (
          <EngenhariaRequestEditForm
            draft={page.editDraft}
            isAdmin={page.isAdmin}
            isSaving={page.isSaving}
            onChange={page.updateEditDraft}
            onPropertyValueChange={page.handleEditPropertyValueChange}
            onContactPhoneChange={page.handleEditContactPhoneChange}
            onCancel={page.cancelEditing}
            onSave={page.saveEdits}
          />
        ) : (
          <EngenhariaRequestSummary
            request={request}
            isUpdatingDocuments={page.isUpdatingDocuments}
            onUploadDocuments={(files) => void page.uploadDocuments('anexos-gerais', files)}
            onViewDocument={(documentId) => void page.viewDocument(documentId)}
            onDownloadDocument={(documentId) => void page.downloadDocument(documentId)}
            onRenameDocument={(documentId) => void page.renameDocument(documentId)}
            onDeleteDocument={(documentId) => void page.deleteDocument(documentId)}
            commentDraft={page.commentDraft}
            comments={request.comments}
            isSavingComment={page.isSavingComment}
            onCommentDraftChange={page.setCommentDraft}
            onAddComment={() => void page.addComment()}
          />
        )
      ) : (
        <EngenhariaCommentsSection
          comments={request.comments}
          commentDraft={page.commentDraft}
          isSavingComment={page.isSavingComment}
          onCommentDraftChange={page.setCommentDraft}
          onAddComment={page.addComment}
        />
      )}

      <DeleteEngenhariaRequestModal
        isOpen={page.isDeleteModalOpen}
        isDeleting={page.isDeleting}
        requestCode={request.requestCode}
        onClose={page.closeDeleteModal}
        onConfirm={page.confirmDelete}
      />
    </div>
  )
}
