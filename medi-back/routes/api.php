<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AppointmentController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Controllers\Api\AvailabilityController;
use App\Http\Controllers\Api\ConsultationTypeController;
use App\Http\Controllers\Api\ChatbotController;
use App\Http\Controllers\Api\DiagnosisController;
use App\Http\Controllers\Api\DoctorRecommendationController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\DocumentSearchController;

// Routes d'authentification
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
// Route::group(function () {


    /**
     * Routes pour les PATIENTS
     * Un patient peut créer des rendez-vous et voir ses propres rendez-vous
     */

    // Créer un nouveau rendez-vous
    Route::post('/appointments', [AppointmentController::class, 'store']);

    // Récupérer tous les rendez-vous du patient connecté
    Route::get('/patients/appointments', [AppointmentController::class, 'getPatientAppointments']);

    Route::put('/appointments/{id}/status', [AppointmentController::class, 'updateStatus']);

    // Annuler un rendez-vous
    Route::put('/appointments/{id}/cancel', [AppointmentController::class, 'cancel']);

    /**
     * Routes pour les MÉDECINS
     * Un médecin peut voir son planning (ses rendez-vous)
     */
    Route::get('/doctors/appointments', [AppointmentController::class, 'getDoctorAppointments']);

    // Récupérer le planning du médecin connecté
    // Ex: /api/doctors/appointments?week=2025-01-13 (optionnel)
});
/**
 * ============================================
 * ROUTES PUBLIQUES (SANS AUTHENTIFICATION)
 * ============================================
 * Ces routes permettent aux visiteurs de voir les médecins
 * et les créneaux disponibles avant de s'inscrire
 */

// Liste de tous les médecins
Route::get('/doctors', [DoctorController::class, 'index']);

// Détails d'un médecin spécifique
Route::get('/doctors/{id}', [DoctorController::class, 'show']);

// Créneaux disponibles d'un médecin pour une date
// Ex: /api/doctors/1/available-slots?date=2025-01-15
Route::get('/doctors/{doctorId}/available-slots', [AvailabilityController::class, 'getAvailableSlots']);

// Disponibilités hebdomadaires générales d'un médecin
Route::get('/doctors/{doctorId}/availabilities', [AvailabilityController::class, 'getDoctorAvailabilities']);

// Liste des types de consultation
Route::get('/consultation-types', [ConsultationTypeController::class, 'index']);

/**
 * ============================================
 * ROUTES PROTÉGÉES (AUTHENTIFICATION REQUISE)
 * ============================================
 * Ces routes nécessitent que l'utilisateur soit connecté
 */


// Chatbot
Route::get('/chatbot/faq', [ChatbotController::class, 'getFaq']); // Public
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/chatbot/message', [ChatbotController::class, 'sendMessage']);
});

// Pré-diagnostic
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/diagnosis/analyze', [DiagnosisController::class, 'analyze']);
    Route::post('/diagnosis/urgency', [DiagnosisController::class, 'evaluateUrgency']);
});

// Recommandation de médecin
Route::post('/doctors/recommend', [DoctorRecommendationController::class, 'recommend']); // Public
Route::get('/doctors/specialties', [DoctorRecommendationController::class, 'getSpecialties']); // Public
Route::post('/doctors/smart-search', [DoctorRecommendationController::class, 'smartSearch']); // Public




/*
|--------------------------------------------------------------------------
| Routes pour les Documents et Ordonnances
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // ==================== DOCUMENTS PATIENTS ====================

    /**
     * Lister les documents d'un patient
     * GET /api/patients/{patientId}/documents
     * Params: ?type=ordonnance&date_from=2024-01-01&per_page=20
     */
    Route::get('/patients/{patientId}/documents', [DocumentController::class, 'index']);

    /**
     * Upload un document pour un patient
     * POST /api/patients/{patientId}/documents
     * Body: file (required), document_type (optional), is_visible_to_patient (optional)
     */
    Route::post('/patients/{patientId}/documents', [DocumentController::class, 'upload']);

    /**
     * Voir un document spécifique
     * GET /api/documents/{id}
     */
    Route::get('/documents/{id}', [DocumentController::class, 'show']);

    /**
     * Télécharger un document
     * GET /api/documents/{id}/download
     */
    Route::get('/documents/{id}/download', [DocumentController::class, 'download']);

    /**
     * Supprimer un document
     * DELETE /api/documents/{id}
     */
    Route::delete('/documents/{id}', [DocumentController::class, 'destroy']);

    /**
     * Statistiques d'accès à un document
     * GET /api/documents/{id}/stats
     */
    Route::get('/documents/{id}/stats', [DocumentController::class, 'stats']);

    // ==================== RECHERCHE INTELLIGENTE ====================

    /**
     * Recherche sémantique dans les documents d'un patient
     * POST /api/patients/{patientId}/documents/search
     * Body: query (required, min 3 chars)
     *
     * Exemples de requêtes:
     * - "Mes dernières analyses de sang"
     * - "Ordonnances de mars dernier"
     * - "Documents sur le diabète"
     */
    Route::post('/patients/{patientId}/documents/search', [DocumentSearchController::class, 'search']);

    /**
     * Suggestions de recherche
     * GET /api/patients/{patientId}/documents/suggestions
     */
    Route::get('/patients/{patientId}/documents/suggestions', [DocumentSearchController::class, 'suggestions']);

    // ==================== ORDONNANCES ====================

    /**
     * Lister les ordonnances d'un patient
     * GET /api/patients/{patientId}/prescriptions
     * Params: ?status=validated&doctor_id=1&per_page=20
     */
    Route::get('/patients/{patientId}/prescriptions', [PrescriptionController::class, 'index']);

    /**
     * Voir une ordonnance spécifique
     * GET /api/prescriptions/{id}
     */
    Route::get('/prescriptions/{id}', [PrescriptionController::class, 'show']);

    /**
     * Créer une ordonnance manuellement
     * POST /api/prescriptions
     * Body: {
     *   patient_id: 1,
     *   medications: [
     *     {
     *       medication: "Paracétamol 1g",
     *       dosage: "1 comprimé",
     *       frequency: "3 fois par jour",
     *       duration: "7 jours",
     *       instructions: "À prendre pendant les repas"
     *     }
     *   ],
     *   instructions: "Instructions générales",
     *   appointment_id: 1 (optional)
     * }
     */
    Route::post('/prescriptions', [PrescriptionController::class, 'store']);

    /**
     * Générer une ordonnance avec l'IA
     * POST /api/prescriptions/generate
     * Body: {
     *   patient_id: 1,
     *   prompt: "Ordonnance pour hypertension, patient 70 ans",
     *   context: {
     *     age: 70,
     *     weight: 75,
     *     allergies: ["pénicilline"],
     *     conditions: ["diabète", "hypertension"]
     *   },
     *   appointment_id: 1 (optional)
     * }
     */
    Route::post('/prescriptions/generate', [PrescriptionController::class, 'generateWithAI']);

    /**
     * Mettre à jour une ordonnance (brouillon uniquement)
     * PUT /api/prescriptions/{id}
     * Body: medications (array), instructions (string)
     */
    Route::put('/prescriptions/{id}', [PrescriptionController::class, 'update']);

    /**
     * Valider une ordonnance (génère le PDF et la rend visible au patient)
     * POST /api/prescriptions/{id}/validate
     */
    Route::post('/prescriptions/{id}/validate', [PrescriptionController::class, 'validate']);

    /**
     * Télécharger le PDF d'une ordonnance
     * GET /api/prescriptions/{id}/download
     */
    Route::get('/prescriptions/{id}/download', [PrescriptionController::class, 'download']);

    /**
     * Annuler une ordonnance
     * POST /api/prescriptions/{id}/cancel
     */
    Route::post('/prescriptions/{id}/cancel', [PrescriptionController::class, 'cancel']);

    /**
     * Supprimer une ordonnance (brouillon uniquement)
     * DELETE /api/prescriptions/{id}
     */
    Route::delete('/prescriptions/{id}', [PrescriptionController::class, 'destroy']);

});

/*
|--------------------------------------------------------------------------
| Exemples d'utilisation avec Axios (Frontend React)
|--------------------------------------------------------------------------

// Upload un document
const formData = new FormData();
formData.append('file', selectedFile);
formData.append('document_type', 'analyse');

await axios.post(`/api/patients/${patientId}/documents`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// Recherche intelligente
const { data } = await axios.post(`/api/patients/${patientId}/documents/search`, {
  query: "Mes analyses de sang de mars"
});

// Générer une ordonnance avec IA
const { data } = await axios.post('/api/prescriptions/generate', {
  patient_id: patientId,
  prompt: "Traitement pour hypertension légère, patient 65 ans",
  context: {
    age: 65,
    weight: 80,
    conditions: ["hypertension"]
  }
});

// Valider l'ordonnance
await axios.post(`/api/prescriptions/${prescriptionId}/validate`);

*/
