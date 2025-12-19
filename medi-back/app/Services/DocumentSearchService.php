<?php

namespace App\Services;

use App\Models\PatientDocument;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class DocumentSearchService
{
    private OpenAIService $openAI;

    public function __construct(OpenAIService $openAI)
    {
        $this->openAI = $openAI;
    }

    /**
     * Recherche intelligente dans les documents d'un patient
     *
     * @param int $patientId ID du patient
     * @param string $query Requête en langage naturel
     * @return Collection Documents trouvés
     */
    public function search(int $patientId, string $query): Collection
    {
        try {
            // 1. Convertir la requête en critères de recherche avec l'IA
            $searchCriteria = $this->parseQuery($query);

            // 2. Construire la requête de base
            $documents = PatientDocument::forPatient($patientId);

            // 3. Appliquer les filtres si l'IA a détecté des critères
            if (!empty($searchCriteria['document_types'])) {
                $documents->whereIn('document_type', $searchCriteria['document_types']);
            }

            if (!empty($searchCriteria['date_range'])) {
                $this->applyDateFilter($documents, $searchCriteria['date_range']);
            }

            if (!empty($searchCriteria['tags'])) {
                foreach ($searchCriteria['tags'] as $tag) {
                    $documents->whereJsonContains('ai_tags', $tag);
                }
            }

            // 4. Recherche full-text dans le texte extrait
            if (!empty($searchCriteria['keywords'])) {
                $keywords = implode(' ', $searchCriteria['keywords']);
                $documents->searchText($keywords);
            }

            // 5. Récupérer les résultats
            $results = $documents->with(['patient', 'uploader'])
                                ->orderBy('uploaded_at', 'desc')
                                ->get();

            // 6. Scorer et trier les résultats par pertinence
            $results = $this->scoreAndRankResults($results, $query, $searchCriteria);

            return $results;

        } catch (\Exception $e) {
            Log::error('Document search error', [
                'patient_id' => $patientId,
                'query' => $query,
                'error' => $e->getMessage()
            ]);

            // En cas d'erreur, faire une recherche simple
            return $this->fallbackSearch($patientId, $query);
        }
    }

    /**
     * Parser la requête en langage naturel avec OpenAI
     */
    private function parseQuery(string $query): array
    {
        $prompt = "Tu es un assistant de recherche médicale. Analyse cette requête et extrais les critères de recherche.

REQUÊTE: \"{$query}\"

TYPES DE DOCUMENTS POSSIBLES:
- ordonnance, analyse, imagerie, compte_rendu, carte_vitale, autre

PÉRIODES POSSIBLES:
- last_week, last_month, last_3_months, last_6_months, last_year, specific_date

Réponds UNIQUEMENT au format JSON (sans markdown):
{
    \"document_types\": [\"type1\", \"type2\"],
    \"date_range\": \"période ou null\",
    \"tags\": [\"tag1\", \"tag2\"],
    \"keywords\": [\"mot-clé1\", \"mot-clé2\"],
    \"interpretation\": \"ce que l'utilisateur recherche en 1 phrase\"
}

EXEMPLES:
Requête: \"Trouve mes analyses de sang de mars\"
Réponse: {\"document_types\": [\"analyse\"], \"date_range\": \"march\", \"tags\": [\"sang\"], \"keywords\": [\"sang\", \"glycémie\", \"cholestérol\"]}

Requête: \"Mes dernières ordonnances\"
Réponse: {\"document_types\": [\"ordonnance\"], \"date_range\": \"last_month\", \"tags\": [], \"keywords\": []}";

        try {
            $response = $this->openAI->chat($prompt);

            if (!$response) {
                return $this->extractSimpleKeywords($query);
            }

            $cleaned = preg_replace('/```json\s*|\s*```/', '', $response);
            $criteria = json_decode(trim($cleaned), true);

            return $criteria ?: $this->extractSimpleKeywords($query);

        } catch (\Exception $e) {
            Log::error('Query parsing error', ['error' => $e->getMessage()]);
            return $this->extractSimpleKeywords($query);
        }
    }

    /**
     * Extraction simple de mots-clés (fallback)
     */
    private function extractSimpleKeywords(string $query): array
    {
        // Mots-clés pour détecter les types
        $typeMapping = [
            'ordonnance' => ['ordonnance', 'prescription', 'médicament'],
            'analyse' => ['analyse', 'prise de sang', 'laboratoire', 'bilan'],
            'imagerie' => ['radio', 'scanner', 'irm', 'échographie', 'imagerie'],
            'compte_rendu' => ['consultation', 'compte-rendu', 'visite'],
        ];

        $detectedTypes = [];
        $query_lower = strtolower($query);

        foreach ($typeMapping as $type => $keywords) {
            foreach ($keywords as $keyword) {
                if (str_contains($query_lower, $keyword)) {
                    $detectedTypes[] = $type;
                    break;
                }
            }
        }

        // Détecter les périodes
        $dateRange = null;
        $dateKeywords = [
            'aujourd\'hui' => 'today',
            'hier' => 'yesterday',
            'semaine' => 'last_week',
            'mois' => 'last_month',
            'dernier' => 'last_month',
            'récent' => 'last_month',
        ];

        foreach ($dateKeywords as $keyword => $range) {
            if (str_contains($query_lower, $keyword)) {
                $dateRange = $range;
                break;
            }
        }

        return [
            'document_types' => array_unique($detectedTypes),
            'date_range' => $dateRange,
            'tags' => [],
            'keywords' => explode(' ', $query),
        ];
    }

    /**
     * Appliquer un filtre de date
     */
    private function applyDateFilter($query, string $dateRange): void
    {
        switch ($dateRange) {
            case 'today':
                $query->whereDate('uploaded_at', today());
                break;
            case 'yesterday':
                $query->whereDate('uploaded_at', today()->subDay());
                break;
            case 'last_week':
                $query->where('uploaded_at', '>=', now()->subWeek());
                break;
            case 'last_month':
                $query->where('uploaded_at', '>=', now()->subMonth());
                break;
            case 'last_3_months':
                $query->where('uploaded_at', '>=', now()->subMonths(3));
                break;
            case 'last_6_months':
                $query->where('uploaded_at', '>=', now()->subMonths(6));
                break;
            case 'last_year':
                $query->where('uploaded_at', '>=', now()->subYear());
                break;
        }
    }

    /**
     * Scorer et classer les résultats par pertinence
     */
    private function scoreAndRankResults(Collection $results, string $query, array $criteria): Collection
    {
        return $results->map(function ($doc) use ($query, $criteria) {
            $score = 0;

            // Score basé sur le type de document
            if (in_array($doc->document_type, $criteria['document_types'] ?? [])) {
                $score += 10;
            }

            // Score basé sur les tags
            foreach ($criteria['tags'] ?? [] as $tag) {
                if (in_array($tag, $doc->ai_tags ?? [])) {
                    $score += 5;
                }
            }

            // Score basé sur la présence de mots-clés dans le texte
            $text = strtolower($doc->extracted_text ?? '');
            foreach ($criteria['keywords'] ?? [] as $keyword) {
                if (str_contains($text, strtolower($keyword))) {
                    $score += 3;
                }
            }

            // Score de récence (plus récent = meilleur)
            $daysAgo = now()->diffInDays($doc->uploaded_at);
            if ($daysAgo < 7) {
                $score += 2;
            } elseif ($daysAgo < 30) {
                $score += 1;
            }

            $doc->relevance_score = $score;
            return $doc;
        })->sortByDesc('relevance_score');
    }

    /**
     * Recherche simple (fallback)
     */
    private function fallbackSearch(int $patientId, string $query): Collection
    {
        return PatientDocument::forPatient($patientId)
            ->where(function ($q) use ($query) {
                $q->where('file_name', 'like', "%{$query}%")
                  ->orWhere('extracted_text', 'like', "%{$query}%");
            })
            ->with(['patient', 'uploader'])
            ->orderBy('uploaded_at', 'desc')
            ->get();
    }

    /**
     * Suggérer des recherches similaires
     */
    public function getSuggestions(int $patientId): array
    {
        $documents = PatientDocument::forPatient($patientId)->get();

        // Extraire tous les tags uniques
        $allTags = $documents->pluck('ai_tags')
                             ->flatten()
                             ->unique()
                             ->values()
                             ->toArray();

        // Types de documents disponibles
        $availableTypes = $documents->pluck('document_type')
                                   ->unique()
                                   ->map(fn($type) => PatientDocument::DOCUMENT_TYPES[$type] ?? $type)
                                   ->values()
                                   ->toArray();

        return [
            'suggested_searches' => [
                'Mes dernières analyses',
                'Ordonnances récentes',
                'Documents de ce mois',
                'Résultats de sang',
            ],
            'available_tags' => $allTags,
            'available_types' => $availableTypes,
            'total_documents' => $documents->count(),
        ];
    }
}
