// types/document.types.ts

export type DocumentType = 
  | 'ordonnance'
  | 'analyse'
  | 'imagerie'
  | 'compte_rendu'
  | 'carte_vitale'
  | 'autre';

export interface PatientDocument {
  id: number;
  patient_id: number;
  document_type: DocumentType;
  file_path: string;
  file_name: string;
  file_size: number;
  file_size_human: string;
  mime_type: string;
  extracted_text?: string;
  ai_tags?: string[];
  uploaded_by: number;
  is_visible_to_patient: boolean;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
  file_url: string;
  document_type_label: string;
  is_pdf: boolean;
  is_image: boolean;
  patient?: User;
  uploader?: User;
  relevance_score?: number;
}

export interface Medication {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export type PrescriptionStatus = 'draft' | 'validated' | 'cancelled';

export interface Prescription {
  id: number;
  patient_id: number;
  doctor_id: number;
  appointment_id?: number;
  status: PrescriptionStatus;
  status_label: string;
  medications: Medication[];
  medications_count: number;
  instructions?: string;
  file_path?: string;
  file_url?: string;
  generated_by_ai: boolean;
  ai_prompt?: string;
  version: number;
  parent_id?: number;
  validated_at?: string;
  created_at: string;
  updated_at: string;
  reference: string;
  is_validated: boolean;
  is_draft: boolean;
  is_cancelled: boolean;
  patient?: User;
  doctor?: User;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  specialty?: string;
  phone?: string;
  date_of_birth?: string;
}

export interface DocumentSearchResult {
  success: boolean;
  query: string;
  results_count: number;
  data: PatientDocument[];
}

export interface SearchSuggestions {
  suggested_searches: string[];
  available_tags: string[];
  available_types: string[];
  total_documents: number;
}

export interface PrescriptionGenerateRequest {
  patient_id: number;
  prompt: string;
  context?: {
    age?: number;
    weight?: number;
    allergies?: string[];
    current_medications?: string[];
    conditions?: string[];
  };
  appointment_id?: number;
}

export interface PrescriptionGenerateResponse {
  success: boolean;
  message: string;
  data: Prescription;
  ai_notes?: string;
  ai_warnings?: string;
}

export interface DocumentUploadRequest {
  file: File;
  document_type?: DocumentType;
  is_visible_to_patient?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}