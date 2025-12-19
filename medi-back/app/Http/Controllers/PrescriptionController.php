<?php

namespace App\Http\Controllers;

use App\Models\Prescription;
use App\Models\DocumentAccessLog;
use App\Services\PrescriptionGeneratorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class PrescriptionController extends Controller
{
    private PrescriptionGeneratorService $prescriptionService;

    public function __construct(PrescriptionGeneratorService $prescriptionService)
    {
        $this->prescriptionService = $prescriptionService;
    }

    /**
     * Lister les ordonnances d'un patient
     * GET /api/patients/{patientId}/prescriptions
     */
    public function index(Request $request, int $patientId)
    {
        try {
            $user = $request->user();

            // Vérifier les permissions
            if (!$this->canAccessPatientPrescriptions($user, $patientId)) {
                return response()->json([
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            $query = Prescription::forPatient($patientId);

            // Patient ne voit que les ordonnances validées
            if ($user->id === $patientId && $user->role === 'patient') {
                $query->validated();
            }

            // Filtres
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('doctor_id')) {
                $query->byDoctor($request->doctor_id);
            }

            // Pagination
            $prescriptions = $query->with(['patient', 'doctor', 'appointment'])
                                  ->orderBy('created_at', 'desc')
                                  ->paginate($request->per_page ?? 20);

            return response()->json([
                'success' => true,
                'data' => $prescriptions
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching prescriptions', [
                'patient_id' => $patientId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des ordonnances'
            ], 500);
        }
    }

    /**
     * Voir une ordonnance
     * GET /api/prescriptions/{id}
     */
    public function show(Request $request, int $id)
    {
        try {
            $user = $request->user();
            $prescription = Prescription::with(['patient', 'doctor', 'appointment'])
                                       ->findOrFail($id);

            // Vérifier les permissions
            if (!$prescription->canBeViewedBy($user)) {
                return response()->json([
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            // Logger l'accès
            $prescription->logAccess($user, 'view');

            return response()->json([
                'success' => true,
                'data' => $prescription
            ]);

        } catch (\Exception $e) {
            Log::error('Error viewing prescription', [
                'prescription_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Ordonnance introuvable'
            ], 404);
        }
    }

    /**
     * Générer une ordonnance avec l'IA
     * POST /api/prescriptions/generate
     */
    public function generateWithAI(Request $request)
    {
        try {
            $user = $request->user();

            // Seul un médecin peut générer une ordonnance
            if ($user->role !== 'doctor') {
                return response()->json([
                    'message' => 'Seuls les médecins peuvent générer des ordonnances'
                ], 403);
            }

            // Validation
            $validator = Validator::make($request->all(), [
                'patient_id' => 'required|exists:users,id',
                'prompt' => 'required|string|min:10',
                'context' => 'nullable|array',
                'appointment_id' => 'nullable|exists:appointments,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            // Générer avec l'IA
            $generated = $this->prescriptionService->generate(
                $request->prompt,
                $request->context ?? []
            );

            if (!$generated) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur lors de la génération de l\'ordonnance'
                ], 500);
            }

            // Créer l'ordonnance en brouillon
            $prescription = $this->prescriptionService->create(
                patientId: $request->patient_id,
                doctorId: $user->id,
                medications: $generated['medications'],
                instructions: $generated['instructions'],
                appointmentId: $request->appointment_id,
                generatedByAi: true,
                aiPrompt: $request->prompt
            );

            return response()->json([
                'success' => true,
                'message' => 'Ordonnance générée avec succès',
                'data' => $prescription->load(['patient', 'doctor']),
                'ai_notes' => $generated['notes'] ?? null,
                'ai_warnings' => $generated['warnings'] ?? null,
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error generating prescription', [
                'error' => $e->getMessage(),
                'prompt' => $request->prompt ?? null
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la génération de l\'ordonnance'
            ], 500);
        }
    }

    /**
     * Créer une ordonnance manuellement
     * POST /api/prescriptions
     */
    public function store(Request $request)
    {
        try {
            $user = $request->user();

            // Seul un médecin peut créer une ordonnance
            if ($user->role !== 'doctor') {
                return response()->json([
                    'message' => 'Seuls les médecins peuvent créer des ordonnances'
                ], 403);
            }

            // Validation
            $validator = Validator::make($request->all(), [
                'patient_id' => 'required|exists:users,id',
                'medications' => 'required|array|min:1',
                'medications.*.medication' => 'required|string',
                'medications.*.dosage' => 'required|string',
                'medications.*.frequency' => 'required|string',
                'medications.*.duration' => 'required|string',
                'medications.*.instructions' => 'nullable|string',
                'instructions' => 'nullable|string',
                'appointment_id' => 'nullable|exists:appointments,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            // Créer l'ordonnance
            $prescription = $this->prescriptionService->create(
                patientId: $request->patient_id,
                doctorId: $user->id,
                medications: $request->medications,
                instructions: $request->instructions,
                appointmentId: $request->appointment_id,
                generatedByAi: false
            );

            return response()->json([
                'success' => true,
                'message' => 'Ordonnance créée avec succès',
                'data' => $prescription->load(['patient', 'doctor'])
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error creating prescription', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de l\'ordonnance'
            ], 500);
        }
    }

    /**
     * Mettre à jour une ordonnance (brouillon uniquement)
     * PUT /api/prescriptions/{id}
     */
    public function update(Request $request, int $id)
    {
        try {
            $user = $request->user();
            $prescription = Prescription::findOrFail($id);

            // Seul le médecin prescripteur peut modifier
            if ($user->id !== $prescription->doctor_id) {
                return response()->json([
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            // On ne peut modifier que les brouillons
            if (!$prescription->is_draft) {
                return response()->json([
                    'success' => false,
                    'message' => 'Seuls les brouillons peuvent être modifiés'
                ], 422);
            }

            // Validation
            $validator = Validator::make($request->all(), [
                'medications' => 'nullable|array',
                'instructions' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            // Mettre à jour
            $prescription->update($request->only(['medications', 'instructions']));

            // Logger
            $prescription->logAccess($user, 'update');

            return response()->json([
                'success' => true,
                'message' => 'Ordonnance mise à jour avec succès',
                'data' => $prescription->load(['patient', 'doctor'])
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating prescription', [
                'prescription_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour'
            ], 500);
        }
    }

    /**
     * Valider une ordonnance
     * POST /api/prescriptions/{id}/validate
     */
    public function validate(Request $request, int $id)
    {
        try {
            $user = $request->user();
            $prescription = Prescription::findOrFail($id);

            // Seul le médecin prescripteur peut valider
            if ($user->id !== $prescription->doctor_id) {
                return response()->json([
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            // Valider et générer le PDF
            $success = $this->prescriptionService->validatePrescription($prescription);

            if (!$success) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cette ordonnance est déjà validée'
                ], 422);
            }

            return response()->json([
                'success' => true,
                'message' => 'Ordonnance validée avec succès',
                'data' => $prescription->fresh()->load(['patient', 'doctor'])
            ]);

        } catch (\Exception $e) {
            Log::error('Error validating prescription', [
                'prescription_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la validation'
            ], 500);
        }
    }

    /**
     * Télécharger le PDF d'une ordonnance
     * GET /api/prescriptions/{id}/download
     */
    public function download(Request $request, int $id)
    {
        try {
            $user = $request->user();
            $prescription = Prescription::findOrFail($id);

            // Vérifier les permissions
            if (!$prescription->canBeViewedBy($user)) {
                return response()->json([
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            // Logger
            $prescription->logAccess($user, 'download');

            // Vérifier que le PDF existe
            if (!$prescription->file_path || !Storage::exists($prescription->file_path)) {
                return response()->json([
                    'success' => false,
                    'message' => 'PDF non disponible'
                ], 404);
            }

            $fileName = 'ordonnance_' . $prescription->reference . '.pdf';
            return Storage::download($prescription->file_path, $fileName);

        } catch (\Exception $e) {
            Log::error('Error downloading prescription', [
                'prescription_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du téléchargement'
            ], 500);
        }
    }

    /**
     * Annuler une ordonnance
     * POST /api/prescriptions/{id}/cancel
     */
    public function cancel(Request $request, int $id)
    {
        try {
            $user = $request->user();
            $prescription = Prescription::findOrFail($id);

            // Seul le médecin prescripteur ou un admin peut annuler
            if ($user->id !== $prescription->doctor_id && $user->role !== 'admin') {
                return response()->json([
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            $prescription->cancel();

            return response()->json([
                'success' => true,
                'message' => 'Ordonnance annulée avec succès'
            ]);

        } catch (\Exception $e) {
            Log::error('Error cancelling prescription', [
                'prescription_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'annulation'
            ], 500);
        }
    }

    /**
     * Supprimer une ordonnance
     * DELETE /api/prescriptions/{id}
     */
    public function destroy(Request $request, int $id)
    {
        try {
            $user = $request->user();
            $prescription = Prescription::findOrFail($id);

            // Seul le médecin prescripteur ou un admin peut supprimer
            // Et seulement si c'est un brouillon
            if (
                ($user->id !== $prescription->doctor_id && $user->role !== 'admin') ||
                !$prescription->is_draft
            ) {
                return response()->json([
                    'message' => 'Accès non autorisé ou ordonnance déjà validée'
                ], 403);
            }

            // Logger
            $prescription->logAccess($user, 'delete');

            // Supprimer
            $prescription->deleteWithFile();

            return response()->json([
                'success' => true,
                'message' => 'Ordonnance supprimée avec succès'
            ]);

        } catch (\Exception $e) {
            Log::error('Error deleting prescription', [
                'prescription_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression'
            ], 500);
        }
    }

    // ==================== MÉTHODES PRIVÉES ====================

    /**
     * Vérifier si l'utilisateur peut accéder aux ordonnances d'un patient
     */
    private function canAccessPatientPrescriptions($user, int $patientId): bool
    {
        // Admin peut tout voir
        if ($user->role === 'admin') {
            return true;
        }

        // Patient peut voir ses propres ordonnances
        if ($user->id === $patientId && $user->role === 'patient') {
            return true;
        }

        // Médecin peut voir les ordonnances de ses patients
        if ($user->role === 'doctor') {
            // TODO: Vérifier si le médecin suit ce patient
            return true;
        }

        return false;
    }
}
