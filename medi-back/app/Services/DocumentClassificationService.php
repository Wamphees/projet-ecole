<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class DocumentClassificationService
{
    private OpenAIService $openAI;

    public function __construct(OpenAIService $openAI)
    {
        $this->openAI = $openAI;
    }

    /**
     * Classifier automatiquement un document et extraire des tags
     */
    public function classify(string $extractedText, string $fileName): array
    {
        try {
            $prompt = $this->buildClassificationPrompt($extractedText, $fileName);

            $response = $this->openAI->chat($prompt);

            if (!$response) {
                return $this->fallbackClassification($extractedText);
            }

            // Parser la réponse JSON
            $result = $this->parseClassificationResponse($response);

            return $result ?: $this->fallbackClassification($extractedText);

        } catch (\Exception $e) {
            Log::error('Document classification error', [
                'error' => $e->getMessage()
            ]);
            return $this->fallbackClassification($extractedText);
        }
    }

    /**
     * Construire le prompt pour OpenAI
     */
    private function buildClassificationPrompt(string $text, string $fileName): string
    {
        // Limiter le texte à 2000 caractères pour ne pas dépasser les tokens
        $truncatedText = substr($text, 0, 2000);

        return "Tu es un assistant médical expert. Analyse ce document médical et classifie-le.

NOM DU FICHIER: {$fileName}

CONTENU DU DOCUMENT:
{$truncatedText}

TYPES DE DOCUMENTS POSSIBLES:
- ordonnance: Ordonnance médicale avec médicaments prescrits
- analyse: Résultats d'analyses (sang, urine, etc.)
- imagerie: Radio, scanner, IRM, échographie
- compte_rendu: Compte-rendu de consultation médicale
- carte_vitale: Documents administratifs (carte d'identité, assurance)
- autre: Autre type de document

TAGS MÉDICAUX POSSIBLES:
- Spécialités: cardiologie, neurologie, pédiatrie, dermatologie, etc.
- Pathologies: diabète, hypertension, asthme, infection, etc.
- Urgence: urgent, routine, suivi
- Examens: prise de sang, radio, scanner, etc.

Réponds UNIQUEMENT au format JSON suivant (sans markdown, sans ```json):
{
    \"document_type\": \"type détecté\",
    \"confidence\": 0.95,
    \"tags\": [\"tag1\", \"tag2\", \"tag3\"],
    \"summary\": \"résumé en 1 phrase\"
}";
    }

    /**
     * Parser la réponse JSON de OpenAI
     */
    private function parseClassificationResponse(string $response): ?array
    {
        try {
            // Nettoyer la réponse (enlever markdown si présent)
            $cleaned = preg_replace('/```json\s*|\s*```/', '', $response);
            $cleaned = trim($cleaned);

            $data = json_decode($cleaned, true);

            if (!$data || !isset($data['document_type'])) {
                return null;
            }

            return [
                'document_type' => $data['document_type'],
                'confidence' => $data['confidence'] ?? 0.5,
                'tags' => $data['tags'] ?? [],
                'summary' => $data['summary'] ?? null,
            ];

        } catch (\Exception $e) {
            Log::error('Failed to parse classification response', [
                'response' => $response,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Classification de secours (règles simples)
     */
    private function fallbackClassification(string $text): array
    {
        $text = strtolower($text);
        $tags = [];

        // Détection du type
        $type = 'autre';

        if (
            str_contains($text, 'ordonnance') ||
            str_contains($text, 'prescription') ||
            str_contains($text, 'posologie')
        ) {
            $type = 'ordonnance';
            $tags[] = 'médicaments';
        }

        if (
            str_contains($text, 'analyse') ||
            str_contains($text, 'laboratoire') ||
            str_contains($text, 'glycémie')
        ) {
            $type = 'analyse';
            $tags[] = 'biologie';
        }

        if (
            str_contains($text, 'radiographie') ||
            str_contains($text, 'scanner') ||
            str_contains($text, 'irm')
        ) {
            $type = 'imagerie';
            $tags[] = 'radiologie';
        }

        // Détection de pathologies courantes
        $conditions = [
            'diabète' => 'diabète',
            'hypertension' => 'hypertension',
            'asthme' => 'asthme',
            'infection' => 'infection',
            'fracture' => 'fracture',
            'allergie' => 'allergie',
        ];

        foreach ($conditions as $keyword => $tag) {
            if (str_contains($text, $keyword)) {
                $tags[] = $tag;
            }
        }

        return [
            'document_type' => $type,
            'confidence' => 0.6,
            'tags' => array_unique($tags),
            'summary' => null,
        ];
    }

    /**
     * Extraire des informations spécifiques selon le type de document
     */
    public function extractSpecificInfo(string $text, string $documentType): array
    {
        $prompt = "Tu es un assistant médical. Extrait les informations importantes de ce document de type '{$documentType}'.

CONTENU:
" . substr($text, 0, 2000) . "

Réponds au format JSON selon le type de document:

Si ORDONNANCE:
{
    \"medications\": [{\"name\": \"nom\", \"dosage\": \"posologie\"}],
    \"doctor\": \"nom du médecin\",
    \"date\": \"date\"
}

Si ANALYSE:
{
    \"test_type\": \"type d'analyse\",
    \"results\": [{\"parameter\": \"nom\", \"value\": \"valeur\", \"unit\": \"unité\"}],
    \"date\": \"date\"
}

Si IMAGERIE:
{
    \"exam_type\": \"type d'examen\",
    \"body_part\": \"partie du corps\",
    \"findings\": \"observations principales\",
    \"date\": \"date\"
}

Réponds UNIQUEMENT en JSON (sans markdown):";

        try {
            $response = $this->openAI->chat($prompt);

            if (!$response) {
                return [];
            }

            $cleaned = preg_replace('/```json\s*|\s*```/', '', $response);
            return json_decode(trim($cleaned), true) ?: [];

        } catch (\Exception $e) {
            Log::error('Failed to extract specific info', [
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Générer un résumé intelligent du document
     */
    public function generateSummary(string $text, int $maxWords = 50): ?string
    {
        $prompt = "Résume ce document médical en maximum {$maxWords} mots. Sois précis et factuel.

DOCUMENT:
" . substr($text, 0, 2000) . "

Réponds directement avec le résumé (pas de JSON):";

        try {
            return $this->openAI->chat($prompt);
        } catch (\Exception $e) {
            Log::error('Failed to generate summary', [
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }
}
