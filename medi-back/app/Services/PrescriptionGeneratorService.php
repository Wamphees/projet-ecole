<?php

namespace App\Services;

use App\Models\Prescription;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;

class PrescriptionGeneratorService
{
    private OpenAIService $openAI;

    public function __construct(OpenAIService $openAI)
    {
        $this->openAI = $openAI;
    }

    /**
     * Générer une ordonnance avec l'IA
     *
     * @param string $prompt Description de ce qui doit être prescrit
     * @param array $context Contexte médical (âge, pathologies, etc.)
     * @return array|null Ordonnance générée
     */
    public function generate(string $prompt, array $context = []): ?array
    {
        try {
            $aiPrompt = $this->buildPrescriptionPrompt($prompt, $context);

            $response = $this->openAI->chat($aiPrompt);

            if (!$response) {
                Log::error('OpenAI did not return a response');
                return null;
            }

            // Parser la réponse
            $prescription = $this->parsePrescriptionResponse($response);

            return $prescription;

        } catch (\Exception $e) {
            Log::error('Prescription generation error', [
                'error' => $e->getMessage(),
                'prompt' => $prompt
            ]);
            return null;
        }
    }

    /**
     * Construire le prompt pour OpenAI
     */
    private function buildPrescriptionPrompt(string $userPrompt, array $context): string
    {
        $contextStr = '';

        if (!empty($context)) {
            $contextStr = "CONTEXTE PATIENT:\n";
            if (isset($context['age'])) {
                $contextStr .= "- Âge: {$context['age']} ans\n";
            }
            if (isset($context['weight'])) {
                $contextStr .= "- Poids: {$context['weight']} kg\n";
            }
            if (isset($context['allergies'])) {
                $contextStr .= "- Allergies: " . implode(', ', $context['allergies']) . "\n";
            }
            if (isset($context['current_medications'])) {
                $contextStr .= "- Traitements en cours: " . implode(', ', $context['current_medications']) . "\n";
            }
            if (isset($context['conditions'])) {
                $contextStr .= "- Conditions médicales: " . implode(', ', $context['conditions']) . "\n";
            }
        }

        return "Tu es un médecin expert. Génère une ordonnance médicale professionnelle.

{$contextStr}

DEMANDE DU MÉDECIN:
{$userPrompt}

IMPORTANT:
- Respecte les contre-indications
- Indique clairement la posologie
- Ajoute des instructions précises
- Fais attention aux interactions médicamenteuses
- Si le contexte montre des allergies, évite les médicaments concernés

Réponds UNIQUEMENT au format JSON suivant (sans markdown, sans ```json):
{
    \"medications\": [
        {
            \"medication\": \"Nom du médicament + dosage\",
            \"dosage\": \"ex: 1 comprimé\",
            \"frequency\": \"ex: 3 fois par jour\",
            \"duration\": \"ex: 7 jours\",
            \"instructions\": \"ex: À prendre pendant les repas\"
        }
    ],
    \"general_instructions\": \"Instructions générales pour le patient\",
    \"notes_for_doctor\": \"Notes importantes pour le médecin (interactions, précautions)\",
    \"warnings\": \"Avertissements si nécessaire\"
}

EXEMPLES DE BONNES RÉPONSES:

Prompt: \"Traitement pour hypertension, patient 65 ans\"
Réponse:
{
    \"medications\": [
        {
            \"medication\": \"Amlodipine 5mg\",
            \"dosage\": \"1 comprimé\",
            \"frequency\": \"1 fois par jour\",
            \"duration\": \"30 jours\",
            \"instructions\": \"À prendre le matin, avec un verre d'eau\"
        },
        {
            \"medication\": \"Ramipril 10mg\",
            \"dosage\": \"1 comprimé\",
            \"frequency\": \"1 fois par jour\",
            \"duration\": \"30 jours\",
            \"instructions\": \"À prendre le soir\"
        }
    ],
    \"general_instructions\": \"Surveillez votre tension artérielle quotidiennement. Consultez immédiatement en cas de vertiges intenses ou de maux de tête sévères.\",
    \"notes_for_doctor\": \"Contrôle de la tension dans 2 semaines. Surveillance de la fonction rénale recommandée.\",
    \"warnings\": \"Éviter la consommation excessive de sel.\"
}";
    }

    /**
     * Parser la réponse JSON de OpenAI
     */
    private function parsePrescriptionResponse(string $response): ?array
    {
        try {
            // Nettoyer la réponse
            $cleaned = preg_replace('/```json\s*|\s*```/', '', $response);
            $cleaned = trim($cleaned);

            $data = json_decode($cleaned, true);

            if (!$data || empty($data['medications'])) {
                Log::error('Invalid prescription format', ['response' => $response]);
                return null;
            }

            // Valider la structure
            foreach ($data['medications'] as $med) {
                if (!isset($med['medication']) || !isset($med['dosage'])) {
                    Log::error('Incomplete medication data', ['medication' => $med]);
                    return null;
                }
            }

            return [
                'medications' => $data['medications'],
                'instructions' => $data['general_instructions'] ?? '',
                'notes' => $data['notes_for_doctor'] ?? '',
                'warnings' => $data['warnings'] ?? '',
            ];

        } catch (\Exception $e) {
            Log::error('Failed to parse prescription response', [
                'response' => $response,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Créer une ordonnance en base de données et générer le PDF
     */
    public function create(
        int $patientId,
        int $doctorId,
        array $medications,
        ?string $instructions = null,
        ?int $appointmentId = null,
        bool $generatedByAi = false,
        ?string $aiPrompt = null
    ): Prescription {
        // Créer l'ordonnance en base
        $prescription = Prescription::create([
            'patient_id' => $patientId,
            'doctor_id' => $doctorId,
            'appointment_id' => $appointmentId,
            'status' => Prescription::STATUS_DRAFT,
            'medications' => $medications,
            'instructions' => $instructions,
            'generated_by_ai' => $generatedByAi,
            'ai_prompt' => $aiPrompt,
        ]);

        return $prescription;
    }

    /**
     * Générer le PDF d'une ordonnance
     */
    public function generatePDF(Prescription $prescription): string
    {
        $prescription->load(['patient', 'doctor']);

        // Données pour la vue
        $data = [
            'prescription' => $prescription,
            'patient' => $prescription->patient,
            'doctor' => $prescription->doctor,
            'medications' => $prescription->getFormattedMedications(),
            'reference' => $prescription->reference,
            'date' => now()->format('d/m/Y'),
        ];

        // Générer le PDF
        $pdf = Pdf::loadView('pdf.prescription', $data);

        // Nom du fichier
        $fileName = 'prescriptions/prescription_' . $prescription->id . '_' . time() . '.pdf';

        // Sauvegarder
        $path = storage_path('app/public/' . $fileName);
        $pdf->save($path);

        // Mettre à jour le chemin dans la base
        $prescription->update(['file_path' => 'public/' . $fileName]);

        return $fileName;
    }

    /**
     * Valider une ordonnance et la rendre visible au patient
     */
    public function validatePrescription(Prescription $prescription): bool
    {
        if ($prescription->is_validated) {
            return false;
        }

        // Générer le PDF si pas encore fait
        if (!$prescription->file_path) {
            $this->generatePDF($prescription);
        }

        // Valider
        return $prescription->validate();
    }

    /**
     * Suggérer des modifications à une ordonnance
     */
    public function suggestImprovements(Prescription $prescription): ?array
    {
        $medications = json_encode($prescription->medications, JSON_UNESCAPED_UNICODE);

        $prompt = "Tu es un pharmacien expert. Analyse cette ordonnance et suggère des améliorations.

ORDONNANCE ACTUELLE:
{$medications}

INSTRUCTIONS ACTUELLES:
{$prescription->instructions}

Vérifie:
- Interactions médicamenteuses
- Posologies appropriées
- Clarté des instructions
- Oublis potentiels

Réponds au format JSON:
{
    \"has_issues\": true/false,
    \"interactions\": [\"interaction détectée 1\", \"interaction 2\"],
    \"dosage_warnings\": [\"avertissement 1\"],
    \"suggestions\": [\"suggestion 1\", \"suggestion 2\"],
    \"overall_safety\": \"safe|warning|danger\"
}";

        try {
            $response = $this->openAI->chat($prompt);

            if (!$response) {
                return null;
            }

            $cleaned = preg_replace('/```json\s*|\s*```/', '', $response);
            return json_decode(trim($cleaned), true);

        } catch (\Exception $e) {
            Log::error('Failed to get prescription suggestions', [
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Adapter une ordonnance pour un patient spécifique
     */
    public function adaptForPatient(array $medications, array $patientContext): ?array
    {
        $medsJson = json_encode($medications, JSON_UNESCAPED_UNICODE);
        $contextJson = json_encode($patientContext, JSON_UNESCAPED_UNICODE);

        $prompt = "Adapte cette ordonnance pour ce patient spécifique.

ORDONNANCE DE BASE:
{$medsJson}

PROFIL PATIENT:
{$contextJson}

Ajuste les dosages si nécessaire, remplace les médicaments contre-indiqués, ajoute des précautions.

Réponds au format JSON (même structure que l'ordonnance de base):";

        try {
            $response = $this->openAI->chat($prompt);

            if (!$response) {
                return null;
            }

            $cleaned = preg_replace('/```json\s*|\s*```/', '', $response);
            return json_decode(trim($cleaned), true);

        } catch (\Exception $e) {
            Log::error('Failed to adapt prescription', [
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }
}
