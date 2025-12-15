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

    // Annuler un rendez-vous
    Route::put('/appointments/{id}/cancel', [AppointmentController::class, 'cancel']);

    /**
     * Routes pour les MÉDECINS
     * Un médecin peut voir son planning (ses rendez-vous)
     */

    // Récupérer le planning du médecin connecté
    // Ex: /api/doctors/appointments?week=2025-01-13 (optionnel)
    Route::get('/doctors/appointments', [AppointmentController::class, 'getDoctorAppointments']);
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
