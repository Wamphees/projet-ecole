<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

// class GeminiService
// {
//     private string $apiKey;
//     private string $baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

//     public function __construct()
//     {
//         $this->apiKey = config('services.gemini.api_key');
//     }

//     /**
//      * Envoyer un message à Gemini et obtenir une réponse
//      */
//     public function chat(string $message, array $context = []): ?string
//     {
//         try {
//             $prompt = $this->buildPrompt($message, $context);

//             $response = Http::timeout(30)
//                 ->post("{$this->baseUrl}/models/gemini-2.0-flash:generateContent?key={$this->apiKey}", [
//                     'contents' => [
//                         [
//                             'parts' => [
//                                 ['text' => $prompt]
//                             ]
//                         ]
//                     ],
//                     'generationConfig' => [
//                         'temperature' => 0.7,
//                         'maxOutputTokens' => 1000,
//                     ]
//                 ]);

//             if ($response->successful()) {
//                 $data = $response->json();
//                 return $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
//             }

//             Log::error('Gemini API Error', ['response' => $response->body()]);
//             return null;

//         } catch (\Exception $e) {
//             Log::error('Gemini Service Exception', ['error' => $e->getMessage()]);
//             return null;
//         }
//     }

//     /**
//      * Construire le prompt avec contexte
//      */
//     private function buildPrompt(string $message, array $context = []): string
//     {
//         $prompt = '';

//         if (!empty($context)) {
//             $prompt .= "Contexte : " . json_encode($context, JSON_UNESCAPED_UNICODE) . "\n\n";
//         }

//         $prompt .= $message;

//         return $prompt;
//     }

//     /**
//      * Analyser les symptômes et recommander une spécialité
//      */
//     public function recommendSpecialty(string $symptoms): ?array
//     {
//         $prompt = "Tu es un assistant médical. Analyse ces symptômes et recommande une spécialité médicale appropriée.

// Symptômes : {$symptoms}

// Réponds UNIQUEMENT au format JSON suivant (sans markdown, sans ```json) :
// {
//     \"specialty\": \"nom de la spécialité\",
//     \"urgency\": \"routine|normal|urgent\",
//     \"reason\": \"explication courte\"
// }";

//         $response = $this->chat($prompt);

//         if (!$response) return null;

//         try {
//             // Nettoyer la réponse si elle contient des balises markdown
//             $cleaned = preg_replace('/```json\s*|\s*```/', '', $response);
//             $cleaned = trim($cleaned);

//             return json_decode($cleaned, true);
//         } catch (\Exception $e) {
//             Log::error('Failed to parse Gemini response', ['response' => $response]);
//             return null;
//         }
//     }

//     /**
//      * Pré-diagnostic basé sur les symptômes
//      */
//     public function preDiagnosis(array $symptoms): ?array
//     {
//         $symptomsList = implode(', ', $symptoms);

//         $prompt = "Tu es un assistant médical. Analyse ces symptômes et fournis un pré-diagnostic.

// IMPORTANT : Ceci n'est PAS un diagnostic médical officiel.

// Symptômes : {$symptomsList}

// Réponds UNIQUEMENT au format JSON suivant (sans markdown, sans ```json) :
// {
//     \"urgency\": \"routine|normal|urgent|emergency\",
//     \"possibleConditions\": [\"condition 1\", \"condition 2\"],
//     \"recommendations\": \"que faire\",
//     \"notes\": \"notes pour le médecin\"
// }";

//         $response = $this->chat($prompt);

//         if (!$response) return null;

//         try {
//             $cleaned = preg_replace('/```json\s*|\s*```/', '', $response);
//             $cleaned = trim($cleaned);

//             return json_decode($cleaned, true);
//         } catch (\Exception $e) {
//             Log::error('Failed to parse Gemini response', ['response' => $response]);
//             return null;
//         }
//     }
// }



class OpenAIService
{
    private string $apiKey;
    // private string $baseUrli = 'https://api.openai.com/v1/chat/completions';
    private string $baseUrl = 'https://chatgpt-api-proxy.weloobe.com/v1/chat/completions?model=gpt-4o-mini';


    public function __construct()
    {
        $this->apiKey = config('services.openai.api_key'); // clé API OpenAI dans .env
    }

    /**
     * Envoyer un message à OpenAI et obtenir une réponse
     */
    public function chat(string $message, array $context = []): ?string
    {
        try {
            $messages = [];

            // Ajouter le contexte si présent
            if (!empty($context)) {
                foreach ($context as $c) {
                    $messages[] = [
                        'role' => 'system',
                        'content' => $c
                    ];
                }
            }

            // Ajouter le message utilisateur
            $messages[] = [
                'role' => 'user',
                'content' => $message
            ];

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type' => 'application/json',
            ])->timeout(30)->post($this->baseUrl, [
                'model' => 'gpt-4o-mini',
                'messages' => $messages,
                'temperature' => 0.7,
                'max_tokens' => 1000,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['choices'][0]['message']['content'] ?? null;
            }

            Log::error('OpenAI API Error', ['response' => $response->body()]);
            return null;

        } catch (\Exception $e) {
            Log::error('OpenAI Service Exception', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Analyser les symptômes et recommander une spécialité
     */
    public function recommendSpecialty(string $symptoms): ?array
    {
        $prompt = "Tu es un assistant médical. Analyse ces symptômes et recommande une spécialité médicale appropriée parmi ceux-ci : Cardiologie/Pédiatrie/Médecine Générale/Cardiologie.

Symptômes : {$symptoms}

Réponds UNIQUEMENT au format JSON :
{
    \"specialty\": \"nom de la spécialité\",
    \"urgency\": \"routine|normal|urgent\",
    \"reason\": \"explication courte\"
}";

        $response = $this->chat($prompt);

        if (!$response) return null;

        try {
            return json_decode(trim($response), true);
        } catch (\Exception $e) {
            Log::error('Failed to parse OpenAI response', ['response' => $response]);
            return null;
        }
    }

    /**
     * Pré-diagnostic basé sur les symptômes
     */
    public function preDiagnosis(array $symptoms): ?array
    {
        $symptomsList = implode(', ', $symptoms);

        $prompt = "Tu es un assistant médical. Analyse ces symptômes et fournis un pré-diagnostic.

IMPORTANT : Ceci n'est PAS un diagnostic médical officiel.

Symptômes : {$symptomsList}

Réponds UNIQUEMENT au format JSON :
{
    \"urgency\": \"routine|normal|urgent|emergency\",
    \"possibleConditions\": [\"condition 1\", \"condition 2\"],
    \"recommendations\": \"que faire\",
    \"notes\": \"notes pour le médecin\"
}";

        $response = $this->chat($prompt);

        if (!$response) return null;

        try {
            return json_decode(trim($response), true);
        } catch (\Exception $e) {
            Log::error('Failed to parse OpenAI response', ['response' => $response]);
            return null;
        }
    }
}
