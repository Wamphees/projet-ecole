<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\OpenAIService;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DoctorRecommendationController extends Controller
{
    public OpenAIService $openAIService;

    public function __construct(OpenAIService $openAIService)
    {
        $this->openAIService = $openAIService;
    }

    /**
     * Recommander un médecin selon les symptômes
     * Route : POST /api/doctors/recommend
     */
    public function recommend(Request $request)
    {
        try {
            // Validation
            $validator = Validator::make($request->all(), [
                'symptoms' => 'required|string|max:500',
                'preference' => 'nullable|in:proximite,disponibilite,specialite',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation échouée',
                    'errors' => $validator->errors()
                ], 422);
            }

            $symptoms = $request->input('symptoms');
            $preference = $request->input('preference', 'specialite');

            // Demander à L'IA quelle spécialité recommander
            $aiRecommendation = $this->openAIService->recommendSpecialty($symptoms);

            if (!$aiRecommendation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur lors de la recommandation, veillez verifier votre connexion internet'
                ], 500);
            }

            $recommendedSpecialty = $aiRecommendation['specialty'] ?? null;
            $urgency = $aiRecommendation['urgency'] ?? 'normal';
            $reason = $aiRecommendation['reason'] ?? 'Consultation recommandée';

            // Trouver les médecins correspondants
            $doctors = $this->findDoctorsBySpecialty($recommendedSpecialty, $preference);

            return response()->json([
                'success' => true,
                'data' => [
                    'ai_recommendation' => [
                        'specialty' => $recommendedSpecialty,
                        'urgency' => $urgency,
                        'reason' => $reason,
                    ],
                    'doctors' => $doctors,
                    'total_found' => count($doctors),
                ],
                'disclaimer' => 'Cette recommandation est basée sur une analyse automatique. Consultez toujours un professionnel de santé.',
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Doctor recommendation error', [
                'error' => $e->getMessage(),
                'symptoms' => $request->input('symptoms')
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Trouver des médecins par spécialité
     */
    private function findDoctorsBySpecialty(?string $specialty, string $preference = 'specialite'): array
    {
        if (!$specialty) {
            return [];
        }

        // Récupérer les médecins avec leur profil
        $query = User::where('role', 'medecin')
            ->with('doctorProfile')
            ->whereHas('doctorProfile', function($q) use ($specialty) {
                // Recherche flexible sur la spécialité
                $q->where('specialite', 'LIKE', "%{$specialty}%");
            });

        // Trier selon la préférence
        switch ($preference) {
            case 'disponibilite':
                // Médecins avec le plus de disponibilités
                $query->withCount('availabilities');
                $query->orderBy('availabilities_count', 'desc');
                break;

            case 'proximite':
                // TODO : implémenter tri par proximité géographique
                // Pour l'instant, tri par défaut
                break;

            default:
                // Tri par défaut
                break;
        }

        $doctors = $query->limit(5)->get();

        // Formater les résultats
        return $doctors->map(function($doctor) {
            return [
                'id' => $doctor->id,
                'name' => $doctor->name,
                'email' => $doctor->email,
                'telephone' => $doctor->telephone,
                'specialite' => $doctor->doctorProfile->specialite ?? null,
                'etablissement' => $doctor->doctorProfile->etablissement ?? null,
                'diplome' => $doctor->doctorProfile->diplome ?? null,
                'has_availabilities' => $doctor->availabilities()->exists(),
            ];
        })->toArray();
    }

    /**
     * Obtenir toutes les spécialités disponibles
     * Route : GET /api/doctors/specialties
     */
    public function getSpecialties()
    {
        try {
            $specialties = User::where('role', 'medecin')
                ->with('doctorProfile')
                ->get()
                ->pluck('doctorProfile.specialite')
                ->filter()
                ->unique()
                ->values();

            return response()->json([
                'success' => true,
                'data' => $specialties
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des spécialités',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Recherche intelligente de médecin
     * Route : POST /api/doctors/smart-search
     */
    public function smartSearch(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'query' => 'required|string|max:200',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $query = $request->input('query');

            // Utiliser Gemini pour comprendre l'intention de recherche
            $prompt = "L'utilisateur recherche un médecin avec cette requête : \"{$query}\"

Analyse la requête et extrais :
- La spécialité médicale recherchée (si mentionnée)
- Le type de consultation souhaité
- Le niveau d'urgence

Réponds UNIQUEMENT au format JSON (sans markdown, sans ```json) :
{
    \"specialty\": \"spécialité ou null\",
    \"consultation_type\": \"type ou null\",
    \"urgency\": \"routine|normal|urgent|null\"
}";

            $response = $this->gemini->chat($prompt);

            if (!$response) {
                // Fallback : recherche simple
                return $this->simpleSearch($query);
            }

            $cleaned = preg_replace('/```json\s*|\s*```/', '', $response);
            $cleaned = trim($cleaned);
            $intent = json_decode($cleaned, true);

            if (!$intent || !isset($intent['specialty'])) {
                return $this->simpleSearch($query);
            }

            // Rechercher les médecins selon l'intention détectée
            $doctors = $this->findDoctorsBySpecialty($intent['specialty']);

            return response()->json([
                'success' => true,
                'data' => [
                    'intent' => $intent,
                    'doctors' => $doctors,
                ],
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Smart search error', ['error' => $e->getMessage()]);
            return $this->simpleSearch($request->input('query'));
        }
    }

    /**
     * Recherche simple (fallback)
     */
    private function simpleSearch(string $query)
    {
        $doctors = User::where('role', 'medecin')
            ->with('doctorProfile')
            ->where(function($q) use ($query) {
                $q->where('name', 'LIKE', "%{$query}%")
                  ->orWhereHas('doctorProfile', function($sq) use ($query) {
                      $sq->where('specialite', 'LIKE', "%{$query}%")
                        ->orWhere('etablissement', 'LIKE', "%{$query}%");
                  });
            })
            ->limit(10)
            ->get()
            ->map(function($doctor) {
                return [
                    'id' => $doctor->id,
                    'name' => $doctor->name,
                    'specialite' => $doctor->doctorProfile->specialite ?? null,
                    'etablissement' => $doctor->doctorProfile->etablissement ?? null,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => ['doctors' => $doctors],
        ], 200);
    }
}
