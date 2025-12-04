<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AppointmentController;
use Illuminate\Support\Facades\Route;

// Routes d'authentification
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
    });
});

// // Routes protégées pour les rendez-vous
// Route::middleware('auth:sanctum')->group(function () {
//     // Routes CRUD pour les rendez-vous
//     Route::apiResource('appointments', AppointmentController::class);

//     // Route personnalisée pour récupérer les médecins
//     Route::get('doctors', [AppointmentController::class, 'getDoctors']);
// });
