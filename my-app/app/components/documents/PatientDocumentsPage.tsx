// pages/PatientDocumentsPage.tsx
import React, { useState } from 'react';
import { DocumentList } from './DocumentList';
import { DocumentUpload } from './DocumentUpload';
import { IntelligentSearch } from './IntelligentSearch';
import { PrescriptionGenerator } from '../prescriptions/PrescriptionGenerator';
import type { PatientDocument } from '../../lib/document.types';
import { 
  FileText, 
  Upload, 
  Search, 
  FilePlus,
  X,
  Download,
  Eye
} from 'lucide-react';

interface Props {
  patientId: number;
  userRole: 'patient' | 'doctor' | 'admin';
  patientContext?: {
    age?: number;
    weight?: number;
    allergies?: string[];
    conditions?: string[];
  };
}

type Tab = 'documents' | 'upload' | 'search' | 'prescriptions';

export const PatientDocumentsPage: React.FC<Props> = ({ 
  patientId, 
  userRole,
  patientContext 
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('documents');
  const [selectedDocument, setSelectedDocument] = useState<PatientDocument | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = () => {
    setActiveTab('documents');
    setRefreshKey(prev => prev + 1); // Force refresh de la liste
  };

  const handleDocumentClick = (doc: PatientDocument) => {
    setSelectedDocument(doc);
  };

  const handleCloseModal = () => {
    setSelectedDocument(null);
  };

  const tabs: { id: Tab; label: string; icon: any; roles: string[] }[] = [
    { id: 'documents', label: 'Mes Documents', icon: FileText, roles: ['patient', 'doctor', 'admin'] },
    { id: 'upload', label: 'Ajouter', icon: Upload, roles: ['patient', 'doctor', 'admin'] },
    { id: 'search', label: 'Rechercher', icon: Search, roles: ['doctor', 'admin'] },
    { id: 'prescriptions', label: 'Ordonnances', icon: FilePlus, roles: ['doctor', 'admin'] },
  ];

  const visibleTabs = tabs.filter(tab => tab.roles.includes(userRole));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Gestion des Documents Médicaux
            </h1>
            <p className="mt-2 text-gray-600">
              {userRole === 'patient' 
                ? 'Consultez et gérez vos documents médicaux'
                : 'Accédez au dossier médical du patient'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'documents' && (
          <DocumentList 
            key={refreshKey}
            patientId={patientId} 
            onDocumentClick={handleDocumentClick}
          />
        )}

        {activeTab === 'upload' && (
          <DocumentUpload 
            patientId={patientId}
            onUploadSuccess={handleUploadSuccess}
          />
        )}

        {activeTab === 'search' && (
          <IntelligentSearch 
            patientId={patientId}
            onDocumentClick={handleDocumentClick}
          />
        )}

        {activeTab === 'prescriptions' && (
          <PrescriptionGenerator 
            patientId={patientId}
            patientContext={patientContext}
            onSuccess={() => {
              alert('Ordonnance créée avec succès !');
            }}
          />
        )}
      </div>

      {/* Modal de visualisation de document */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex-1 min-w-0 mr-4">
                <h2 className="text-xl font-semibold text-gray-900 truncate">
                  {selectedDocument.file_name}
                </h2>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                    {selectedDocument.document_type_label}
                  </span>
                  <span>{selectedDocument.file_size_human}</span>
                  <span>
                    {new Date(selectedDocument.uploaded_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
              {selectedDocument.is_pdf ? (
                <iframe
                  src={selectedDocument.file_url}
                  className="w-full h-full min-h-[600px] border border-gray-200 rounded-lg"
                  title={selectedDocument.file_name}
                />
              ) : selectedDocument.is_image ? (
                <img
                  src={selectedDocument.file_url}
                  alt={selectedDocument.file_name}
                  className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                />
              ) : (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-600">
                    Aperçu non disponible pour ce type de fichier
                  </p>
                </div>
              )}

              {/* Tags */}
              {selectedDocument.ai_tags && selectedDocument.ai_tags.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Tags automatiques :
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDocument.ai_tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Texte extrait */}
              {selectedDocument.extracted_text && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Texte extrait (OCR) :
                  </h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {selectedDocument.extracted_text.substring(0, 500)}
                    {selectedDocument.extracted_text.length > 500 && '...'}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <a
                href={selectedDocument.file_url}
                download={selectedDocument.file_name}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-5 w-5" />
                <span>Télécharger</span>
              </a>
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};