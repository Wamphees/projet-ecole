<?php

namespace App\Http\Controllers;

use App\Services\DocumentSearchService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class DocumentSearchController extends Controller
{
    private DocumentSearchService $searchService;

    public function __construct(DocumentSearchService $searchService)
    {
        $this->searchService = $searchService;
    }

    /**
     * Recherche intelligente dans les documents d'un patient
     * POST /api/patients/{patientId}/documents/search
     */
    public function search(Request $request, int $patientId)
    {
        try {
            $user = $request->user();

            // Vérifier les permissions
            if (!$this->canSearchPatientDocuments($user, $patientId)) {
                return response()->json([
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            // Validation
            $validator = Validator::make($request->all(), [
                'query' => 'required|string|min:3',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            // Rechercher
            $results = $this->searchService->search($patientId, $request->query);

            return response()->json([
                'success' => true,
                'query' => $request->query,
                'results_count' => $results->count(),
                'data' => $results->values()
            ]);

        } catch (\Exception $e) {
            Log::error('Search error', [
                'patient_id' => $patientId,
                'query' => $request->query ?? null,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la recherche'
            ], 500);
        }
    }

    /**
     * Obtenir des suggestions de recherche
     * GET /api/patients/{patientId}/documents/suggestions
     */
    public function suggestions(Request $request, int $patientId)
    {
        try {
            $user = $request->user();

            // Vérifier les permissions
            if (!$this->canSearchPatientDocuments($user, $patientId)) {
                return response()->json([
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            $suggestions = $this->searchService->getSuggestions($patientId);

            return response()->json([
                'success' => true,
                'data' => $suggestions
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting suggestions', [
                'patient_id' => $patientId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des suggestions'
            ], 500);
        }
    }

    // ==================== MÉTHODES PRIVÉES ====================

    /**
     * Vérifier si l'utilisateur peut rechercher dans les documents d'un patient
     */
    private function canSearchPatientDocuments($user, int $patientId): bool
    {
        // Admin peut tout rechercher
        if ($user->role === 'admin') {
            return true;
        }

        // Patient peut rechercher dans ses propres documents
        if ($user->id === $patientId && $user->role === 'patient') {
            return true;
        }

        // Médecin peut rechercher dans les documents de ses patients
        if ($user->role === 'doctor') {
            // TODO: Vérifier si le médecin suit ce patient
            return true;
        }

        return false;
    }
}
