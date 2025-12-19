<?php

namespace App\Http\Controllers;

use App\Models\PatientDocument;
use App\Models\DocumentAccessLog;
use App\Services\OCRService;
use App\Services\DocumentClassificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use App\Jobs\ProcessDocumentJob;

class DocumentController extends Controller
{
    private OCRService $ocrService;
    private DocumentClassificationService $classificationService;

    public function __construct(
        OCRService $ocrService,
        DocumentClassificationService $classificationService
    ) {
        $this->ocrService = $ocrService;
        $this->classificationService = $classificationService;
    }

    /**
     * Lister les documents d'un patient
     * GET /api/patients/{patientId}/documents
     */
    public function index(Request $request, int $patientId)
    {
        try {
            $user = $request->user();

            // Vérifier les permissions
            if (!$this->canAccessPatientDocuments($user, $patientId)) {
                return response()->json([
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            // Récupérer les documents
            $query = PatientDocument::forPatient($patientId);

            // Si c'est le patient lui-même, montrer seulement les docs visibles
            if ($user->id === $patientId && $user->role === 'patient') {
                $query->visibleToPatient();
            }

            // Filtres optionnels
            if ($request->has('type')) {
                $query->ofType($request->type);
            }

            if ($request->has('date_from')) {
                $query->where('uploaded_at', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->where('uploaded_at', '<=', $request->date_to);
            }

            // Pagination
            $documents = $query->with(['patient', 'uploader'])
                ->orderBy('uploaded_at', 'desc')
                ->paginate($request->per_page ?? 20);

            return response()->json([
                'success' => true,
                'data' => $documents
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching documents', [
                'patient_id' => $patientId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des documents'
            ], 500);
        }
    }

    /**
     * Upload un document
     * POST /api/patients/{patientId}/documents
     */
    public function upload(Request $request, int $patientId)
    {
        set_time_limit(300);
        try {
            $user = $request->user();

            // Vérifier les permissions
            if (!$this->canUploadForPatient($user, $patientId)) {
                return response()->json([
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            // Validation
            $validator = Validator::make($request->all(), [
                'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240', // 10 MB
                'document_type' => 'nullable|in:ordonnance,analyse,imagerie,compte_rendu,carte_vitale,autre',
                'is_visible_to_patient' => 'nullable|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $file = $request->file('file');
            dd($file);

            // Stocker le fichier
            $filePath = $file->store('documents', 'public');
            $fileName = $file->getClientOriginalName();
            $fileSize = $file->getSize();
            $mimeType = $file->getMimeType();

            // Créer l'enregistrement
            $document = PatientDocument::create([
                'patient_id' => $patientId,
                'document_type' => $request->document_type ?? 'autre',
                'file_path' => $filePath,
                'file_name' => $fileName,
                'file_size' => $fileSize,
                'mime_type' => $mimeType,
                'uploaded_by' => $user->id,
                'is_visible_to_patient' => $request->is_visible_to_patient ?? true,
            ]);

            // Logger l'upload
            DocumentAccessLog::logPatientDocument($document, $user, 'create');

            // Traiter le document en arrière-plan (OCR + Classification)
            // $this->processDocument($document);
            ProcessDocumentJob::dispatch($document);

            return response()->json([
                'success' => true,
                'message' => 'Document uploadé avec succès',
                'data' => $document->load(['patient', 'uploader'])
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error uploading document', [
                'patient_id' => $patientId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'upload du document'
            ], 500);
        }
    }

    /**
     * Voir un document
     * GET /api/documents/{id}
     */
    public function show(Request $request, int $id)
    {
        try {
            $user = $request->user();
            $document = PatientDocument::with(['patient', 'uploader'])->findOrFail($id);

            // Vérifier les permissions
            if (!$document->canBeViewedBy($user)) {
                return response()->json([
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            // Logger l'accès
            $document->logAccess($user, 'view');

            return response()->json([
                'success' => true,
                'data' => $document
            ]);

        } catch (\Exception $e) {
            Log::error('Error viewing document', [
                'document_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Document introuvable'
            ], 404);
        }
    }

    /**
     * Télécharger un document
     * GET /api/documents/{id}/download
     */
    public function download(Request $request, int $id)
    {
        try {
            $user = $request->user();
            $document = PatientDocument::findOrFail($id);

            // Vérifier les permissions
            if (!$document->canBeViewedBy($user)) {
                return response()->json([
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            // Logger le téléchargement
            $document->logAccess($user, 'download');

            // Retourner le fichier
            if (!Storage::exists($document->file_path)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Fichier introuvable'
                ], 404);
            }

            return Storage::download($document->file_path, $document->file_name);

        } catch (\Exception $e) {
            Log::error('Error downloading document', [
                'document_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du téléchargement'
            ], 500);
        }
    }

    /**
     * Supprimer un document
     * DELETE /api/documents/{id}
     */
    public function destroy(Request $request, int $id)
    {
        try {
            $user = $request->user();
            $document = PatientDocument::findOrFail($id);

            // Seul le propriétaire, le médecin qui l'a uploadé, ou un admin peut supprimer
            if (
                $user->id !== $document->patient_id &&
                $user->id !== $document->uploaded_by &&
                $user->role !== 'admin'
            ) {
                return response()->json([
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            // Logger la suppression
            $document->logAccess($user, 'delete');

            // Supprimer le document et le fichier
            $document->deleteWithFile();

            return response()->json([
                'success' => true,
                'message' => 'Document supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            Log::error('Error deleting document', [
                'document_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression'
            ], 500);
        }
    }

    /**
     * Obtenir les statistiques d'un document
     * GET /api/documents/{id}/stats
     */
    public function stats(Request $request, int $id)
    {
        try {
            $user = $request->user();
            $document = PatientDocument::findOrFail($id);

            // Seul le propriétaire ou un admin peut voir les stats
            if ($user->id !== $document->patient_id && $user->role !== 'admin') {
                return response()->json([
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            $stats = DocumentAccessLog::getDocumentStats('patient_document', $id);

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des statistiques'
            ], 500);
        }
    }

    // ==================== MÉTHODES PRIVÉES ====================

    /**
     * Traiter le document (OCR + Classification)
     */
    private function processDocument(PatientDocument $document): void
    {
        // try {
        //     $filePath = storage_path('app/public/' . $document->file_path);

        //     // 1. Extraire le texte avec OCR
        //     $extractedText = $this->ocrService->extractText($filePath, $document->mime_type);

        //     if (!$extractedText) {
        //         Log::warning('No text extracted from document', ['document_id' => $document->id]);
        //         return;
        //     }

        //     // 2. Classifier le document avec l'IA
        //     $classification = $this->classificationService->classify(
        //         $extractedText,
        //         $document->file_name
        //     );

        //     // 3. Mettre à jour le document
        //     $document->update([
        //         'extracted_text' => $extractedText,
        //         'document_type' => $classification['document_type'] ?? $document->document_type,
        //         'ai_tags' => $classification['tags'] ?? [],
        //     ]);

        //     Log::info('Document processed successfully', [
        //         'document_id' => $document->id,
        //         'type' => $classification['document_type'] ?? 'unknown',
        //         'tags' => $classification['tags'] ?? []
        //     ]);

        // } catch (\Exception $e) {
        //     Log::error('Error processing document', [
        //         'document_id' => $document->id,
        //         'error' => $e->getMessage()
        //     ]);
        // }
    }

    /**
     * Vérifier si l'utilisateur peut accéder aux documents d'un patient
     */
    private function canAccessPatientDocuments($user, int $patientId): bool
    {
        // Admin peut tout voir
        if ($user->role === 'admin') {
            return true;
        }

        // Patient peut voir ses propres documents
        if ($user->id === $patientId && $user->role === 'patient') {
            return true;
        }

        // Médecin peut voir les documents de ses patients
        if ($user->role === 'doctor') {
            // TODO: Vérifier si le médecin suit ce patient
            return true;
        }

        return false;
    }

    /**
     * Vérifier si l'utilisateur peut uploader pour un patient
     */
    // private function canUploadForPatient($user, int $patientId): bool
    // {
    //     // Admin peut uploader pour tout le monde
    //     // if ($user->role === 'patient') {
    //     //     return true;
    //     // }
    //     if (!in_array($user->role, ['patient', 'doctor'])) {
    //         return response()->json([
    //             'message' => 'Accès non autorisé'
    //         ], 403);
    //     }

    //     // Patient peut uploader pour lui-même
    //     if ($user->id === $patientId && $user->role === 'patient') {
    //         return true;
    //     }

    //     // Médecin peut uploader pour ses patients
    //     if ($user->role === 'doctor') {
    //         // TODO: Vérifier si le médecin suit ce patient
    //         return true;
    //     }

    //     return false;
    // }
    private function canUploadForPatient($user, int $patientId): bool
{
    // Admin peut uploader pour tout le monde
    if ($user->role === 'admin') {
        return true;
    }

    // Patient peut uploader pour lui-même
    if ($user->id === $patientId && $user->role === 'patient') {
        return true;
    }

    if (!$this->canUploadForPatient($user, $patientId)) {
    return response()->json([
        'message' => 'Accès non autorisé'
    ], 403);
}


    // Médecin peut uploader pour ses patients
    if ($user->role === 'doctor') {
        // TODO: Vérifier si le médecin suit ce patient
        return true;
    }



    return false; // Sinon, accès refusé
}

}
