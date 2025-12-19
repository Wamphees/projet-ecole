// components/documents/DocumentList.tsx
import React, { useState, useEffect } from 'react';
import type { PatientDocument } from '../../lib/document.types';
import { documentApi, downloadFile } from '../../lib/documentApi';
import { 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  FileImage, 
  Activity,
  Stethoscope,
  CreditCard,
  File
} from 'lucide-react';

interface Props {
  patientId: number;
  onDocumentClick?: (document: PatientDocument) => void;
}

const DOCUMENT_TYPE_CONFIG = {
  ordonnance: { label: 'Ordonnance', icon: FileText, color: 'text-blue-600 bg-blue-50' },
  analyse: { label: 'Analyse', icon: Activity, color: 'text-green-600 bg-green-50' },
  imagerie: { label: 'Imagerie', icon: FileImage, color: 'text-purple-600 bg-purple-50' },
  compte_rendu: { label: 'Compte-rendu', icon: Stethoscope, color: 'text-orange-600 bg-orange-50' },
  carte_vitale: { label: 'Administratif', icon: CreditCard, color: 'text-gray-600 bg-gray-50' },
  autre: { label: 'Autre', icon: File, color: 'text-gray-600 bg-gray-50' },
};

export const DocumentList: React.FC<Props> = ({ patientId, onDocumentClick }) => {
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadDocuments();
  }, [patientId, selectedType, currentPage]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await documentApi.getDocuments(patientId, {
        type: selectedType !== 'all' ? selectedType : undefined,
        page: currentPage,
        per_page: 12,
      });

      setDocuments(response.data.data);
      setTotalPages(response.data.last_page);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (doc: PatientDocument) => {
    try {
      const blob = await documentApi.downloadDocument(doc.id);
      downloadFile(blob, doc.file_name);
    } catch (err: any) {
      alert('Erreur lors du téléchargement');
    }
  };

  const handleDelete = async (doc: PatientDocument) => {
    if (!confirm(`Supprimer "${doc.file_name}" ?`)) return;

    try {
      await documentApi.deleteDocument(doc.id);
      loadDocuments();
    } catch (err: any) {
      alert('Erreur lors de la suppression');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedType('all')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            selectedType === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Tous
        </button>
        {Object.entries(DOCUMENT_TYPE_CONFIG).map(([type, config]) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedType === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {config.label}
          </button>
        ))}
      </div>

      {/* Liste des documents */}
      {documents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <File className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">Aucun document trouvé</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => {
              const config = DOCUMENT_TYPE_CONFIG[doc.document_type];
              const Icon = config.icon;

              return (
                <div
                  key={doc.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(doc.uploaded_at)}
                    </span>
                  </div>

                  {/* Nom du fichier */}
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {doc.file_name}
                  </h3>

                  {/* Type et taille */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      {config.label}
                    </span>
                    <span>{doc.file_size_human}</span>
                  </div>

                  {/* Tags IA */}
                  {doc.ai_tags && doc.ai_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {doc.ai_tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => onDocumentClick?.(doc)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="text-sm font-medium">Voir</span>
                    </button>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Télécharger"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
              >
                Précédent
              </button>
              <span className="text-gray-600">
                Page {currentPage} sur {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};