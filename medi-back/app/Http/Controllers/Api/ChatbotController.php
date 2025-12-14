<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\OpenAIService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ChatbotController extends Controller
{
    public OpenAIService $openAIService;

    public function __construct(OpenAIService $openAIService)
    {
        $this->openAIService = $openAIService;
    }

    /**
     * Envoyer un message au chatbot
     * Route : POST /api/chatbot/message
     */
    public function sendMessage(Request $request)
    {
        try {
            // Validation
            $validator = Validator::make($request->all(), [
                'message' => 'required|string|max:1000',
                'context' => 'nullable|array',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation échouée',
                    'errors' => $validator->errors()
                ], 422);
            }

            $message = $request->input('message');
            $context = $request->input('context', []);

            // Construire le prompt pour un assistant médical
            $systemPrompt = "Tu es un assistant virtuel pour une plateforme de prise de rendez-vous médicaux au Cameroun.

Tu peux aider avec :
- Expliquer comment prendre un rendez-vous avec les etapes : 'sinscrire', 'cliquez ur le bouton rendez-vous', 'choisir un medicin en fonction de votre position, ensuite il pourra choisi une specialite', 'choisir une date et un créneau horaire disponible', 'confirmer le rendez-vous'
- Expliquer les différents types de consultation (teleconsultation, consultation en personne, urgence, cardiologie, dermatologie, pediatrie)
- Répondre aux questions sur les spécialités médicales
- Donner des conseils généraux de santé
- et surtout n'oublie pas d'acceder au faq pour informations complementaires.

IMPORTANT :
- Sois courtois et professionnel
- Ne donne JAMAIS de diagnostic médical
- Encourage toujours à consulter un médecin
- Réponds en français
- Sois concis (maximum 3-4 phrases)

Question du patient : {$message}";

            // Appeler gpt
            $response = $this->openAIService->chat($systemPrompt, $context);

            if (!$response) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur lors de la communication avec l\'assistant IA'
                ], 500);
            }

            return response()->json([
                'success' => true,
                'response' => $response,
                'timestamp' => now()->toIso8601String()
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Chatbot error', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Questions fréquentes (FAQ)
     * Route : GET /api/chatbot/faq
     */
    public function getFaq()
    {
        $faqs = [
            [
                'question' => 'Comment prendre un rendez-vous ?',
                'answer' => 'Pour prendre rendez-vous, choisissez un médecin dans la liste, sélectionnez une date et un créneau horaire disponible, puis validez votre réservation.'
            ],
            [
                'question' => 'Quels types de consultation proposez-vous ?',
                'answer' => 'Nous proposons : consultations générales, consultations de suivi, urgences, consultations spécialisées et bilans de santé.'
            ],
            [
                'question' => 'Puis-je annuler mon rendez-vous ?',
                'answer' => 'Oui, vous pouvez annuler votre rendez-vous depuis votre espace patient. Nous vous recommandons de le faire au moins 24h à l\'avance.'
            ],
            [
                'question' => 'Comment choisir le bon médecin ?',
                'answer' => 'Vous pouvez filtrer par spécialité, consulter les disponibilités et lire les informations sur chaque médecin. Notre assistant IA peut aussi vous recommander un médecin selon vos symptômes.'
            ],
            [
                'question' => 'Les consultations en urgence sont-elles disponibles ?',
                'answer' => 'Oui, certains médecins proposent des consultations d\'urgence. Contactez directement l\'établissement pour les urgences graves.'
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $faqs
        ], 200);
    }
}
