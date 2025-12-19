// services/documentApi.ts
import axios from 'axios';
import api from './api';

import type {
  PatientDocument,
  Prescription,
  DocumentSearchResult,
  SearchSuggestions,
  PrescriptionGenerateRequest,
  PrescriptionGenerateResponse,
  ApiResponse,
  PaginatedResponse,
  Medication,
} from './document.types';

const API_BASE = 'http://127.0.0.1:8000/api';

// ==================== DOCUMENTS ====================

export const documentApi = {
  /**
   * Lister les documents d'un patient
   */
  async getDocuments(
    patientId: number,
    params?: {
      type?: string;
      date_from?: string;
      date_to?: string;
      per_page?: number;
      page?: number;
    }
  ): Promise<PaginatedResponse<PatientDocument>> {
    const { data } = await axios.get(
      `${API_BASE}/patients/${patientId}/documents`,
      { params }
    );
    return data;
  },

  /**
   * Upload un document
   */
async uploadDocument(
  patientId: number | undefined,
  file: File,
  documentType?: string,
  isVisibleToPatient: boolean = true
): Promise<ApiResponse<PatientDocument>> {

  if (!patientId) {
    throw new Error('Patient non identifié');
  }

  const formData = new FormData();
  formData.append('file', file);
  if (documentType) {
    formData.append('document_type', documentType);
  }
  formData.append(
    'is_visible_to_patient',
    isVisibleToPatient ? '1' : '0'
  );

  const { data } = await api.post(
    `/patients/${patientId}/documents`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );

  return data;
}
  ,
  /**
   * Voir un document
   */
  async getDocument(documentId: number): Promise<ApiResponse<PatientDocument>> {
    const { data } = await axios.get(`${API_BASE}/documents/${documentId}`);
    return data;
  },

  /**
   * Télécharger un document
   */
  async downloadDocument(documentId: number): Promise<Blob> {
    const { data } = await axios.get(
      `${API_BASE}/documents/${documentId}/download`,
      { responseType: 'blob' }
    );
    return data;
  },

  /**
   * Supprimer un document
   */
  async deleteDocument(documentId: number): Promise<ApiResponse<void>> {
    const { data } = await axios.delete(`${API_BASE}/documents/${documentId}`);
    return data;
  },

  /**
   * Statistiques d'un document
   */
  async getDocumentStats(documentId: number): Promise<ApiResponse<any>> {
    const { data } = await axios.get(`${API_BASE}/documents/${documentId}/stats`);
    return data;
  },
};

// ==================== RECHERCHE ====================

export const searchApi = {
  /**
   * Recherche intelligente
   */
  async search(
    patientId: number,
    query: string
  ): Promise<DocumentSearchResult> {
    const { data } = await axios.post(
      `${API_BASE}/patients/${patientId}/documents/search`,
      { query }
    );
    return data;
  },

  /**
   * Suggestions de recherche
   */
  async getSuggestions(patientId: number): Promise<ApiResponse<SearchSuggestions>> {
    const { data } = await axios.get(
      `${API_BASE}/patients/${patientId}/documents/suggestions`
    );
    return data;
  },
};

// ==================== ORDONNANCES ====================

export const prescriptionApi = {
  /**
   * Lister les ordonnances d'un patient
   */
  async getPrescriptions(
    patientId: number,
    params?: {
      status?: string;
      doctor_id?: number;
      per_page?: number;
      page?: number;
    }
  ): Promise<PaginatedResponse<Prescription>> {
    const { data } = await axios.get(
      `${API_BASE}/patients/${patientId}/prescriptions`,
      { params }
    );
    return data;
  },

  /**
   * Voir une ordonnance
   */
  async getPrescription(prescriptionId: number): Promise<ApiResponse<Prescription>> {
    const { data } = await axios.get(`${API_BASE}/prescriptions/${prescriptionId}`);
    return data;
  },

  /**
   * Créer une ordonnance manuellement
   */
  async createPrescription(prescription: {
    patient_id: number;
    medications: Medication[];
    instructions?: string;
    appointment_id?: number;
  }): Promise<ApiResponse<Prescription>> {
    const { data } = await axios.post(`${API_BASE}/prescriptions`, prescription);
    return data;
  },

  /**
   * Générer une ordonnance avec l'IA
   */
  async generateWithAI(
    request: PrescriptionGenerateRequest
  ): Promise<PrescriptionGenerateResponse> {
    const { data } = await axios.post(
      `${API_BASE}/prescriptions/generate`,
      request
    );
    return data;
  },

  /**
   * Mettre à jour une ordonnance (brouillon uniquement)
   */
  async updatePrescription(
    prescriptionId: number,
    updates: {
      medications?: Medication[];
      instructions?: string;
    }
  ): Promise<ApiResponse<Prescription>> {
    const { data } = await axios.put(
      `${API_BASE}/prescriptions/${prescriptionId}`,
      updates
    );
    return data;
  },

  /**
   * Valider une ordonnance
   */
  async validatePrescription(
    prescriptionId: number
  ): Promise<ApiResponse<Prescription>> {
    const { data } = await axios.post(
      `${API_BASE}/prescriptions/${prescriptionId}/validate`
    );
    return data;
  },

  /**
   * Télécharger le PDF
   */
  async downloadPrescription(prescriptionId: number): Promise<Blob> {
    const { data } = await axios.get(
      `${API_BASE}/prescriptions/${prescriptionId}/download`,
      { responseType: 'blob' }
    );
    return data;
  },

  /**
   * Annuler une ordonnance
   */
  async cancelPrescription(prescriptionId: number): Promise<ApiResponse<void>> {
    const { data } = await axios.post(
      `${API_BASE}/prescriptions/${prescriptionId}/cancel`
    );
    return data;
  },

  /**
   * Supprimer une ordonnance
   */
  async deletePrescription(prescriptionId: number): Promise<ApiResponse<void>> {
    const { data } = await axios.delete(
      `${API_BASE}/prescriptions/${prescriptionId}`
    );
    return data;
  },
};

// ==================== UTILITAIRES ====================

/**
 * Télécharger un fichier avec un nom personnalisé
 */
export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};