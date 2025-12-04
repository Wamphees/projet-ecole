<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AppointmentController_n extends Controller
{
    /**
     * Récupérer tous les rendez-vous (avec pagination)
     */
    public function index(Request $request)
    {
        try {
            $query = Appointment::with(['user', 'doctor']);

            // Filtrer par statut si fourni
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Filtrer par utilisateur connecté si patient
            if ($request->user()->role === 'patient') {
                $query->where('user_id', $request->user()->id);
            }

            // Filtrer par médecin si médecin connecté
            if ($request->user()->role === 'medecin') {
                $query->where('doctor_id', $request->user()->id);
            }

            $appointments = $query->orderBy('appointment_date', 'desc')
                                  ->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $appointments
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des rendez-vous',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer un nouveau rendez-vous
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'doctor_id' => 'required|exists:users,id',
                'appointment_date' => 'required|date|after_or_equal:today',
                'appointment_time' => 'required|date_format:H:i',
                'reason' => 'required|string|max:255',
                'notes' => 'nullable|string',
            ]);

            $appointment = Appointment::create([
                'user_id' => $request->user()->id,
                'doctor_id' => $validated['doctor_id'],
                'appointment_date' => $validated['appointment_date'],
                'appointment_time' => $validated['appointment_time'],
                'reason' => $validated['reason'],
                'notes' => $validated['notes'] ?? null,
                'status' => 'pending',
            ]);

            // Charger les relations
            $appointment->load(['user', 'doctor']);

            return response()->json([
                'success' => true,
                'message' => 'Rendez-vous créé avec succès',
                'data' => $appointment
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du rendez-vous',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer un rendez-vous spécifique
     */
    public function show(Request $request, $id)
    {
        try {
            $appointment = Appointment::with(['user', 'doctor'])->findOrFail($id);

            // Vérifier les permissions
            if ($request->user()->role === 'patient' && $appointment->user_id !== $request->user()->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            if ($request->user()->role === 'medecin' && $appointment->doctor_id !== $request->user()->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            return response()->json([
                'success' => true,
                'data' => $appointment
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Rendez-vous non trouvé',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Mettre à jour un rendez-vous
     */
    public function update(Request $request, $id)
    {
        try {
            $appointment = Appointment::findOrFail($id);

            // Vérifier les permissions
            if ($request->user()->role === 'patient' && $appointment->user_id !== $request->user()->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            $validated = $request->validate([
                'appointment_date' => 'sometimes|date|after_or_equal:today',
                'appointment_time' => 'sometimes|date_format:H:i',
                'reason' => 'sometimes|string|max:255',
                'status' => 'sometimes|in:pending,confirmed,cancelled,completed',
                'notes' => 'nullable|string',
            ]);

            $appointment->update($validated);
            $appointment->load(['user', 'doctor']);

            return response()->json([
                'success' => true,
                'message' => 'Rendez-vous mis à jour avec succès',
                'data' => $appointment
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer un rendez-vous
     */
    public function destroy(Request $request, $id)
    {
        try {
            $appointment = Appointment::findOrFail($id);

            // Vérifier les permissions
            if ($request->user()->role === 'patient' && $appointment->user_id !== $request->user()->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            $appointment->delete();

            return response()->json([
                'success' => true,
                'message' => 'Rendez-vous supprimé avec succès'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer les médecins disponibles
     */
    public function getDoctors()
    {
        try {
            $doctors = \App\Models\User::where('role', 'medecin')->get();

            return response()->json([
                'success' => true,
                'data' => $doctors
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des médecins',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
