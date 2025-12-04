<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;
use App\Models\Appointment;


class AppointmentController extends Controller
{
    /**
     * Créer un nouveau rendez-vous
     * Route : POST /api/appointments
     * Accessible uniquement aux utilisateurs authentifiés
     */
    public function store(Request $request)
    {
        try {
            // Validation des données envoyées
            $validated = $request->validate([
                'doctor_id' => 'required|exists:users,id', // Le médecin doit exister
                'appointment_date' => 'required|date|after_or_equal:today', // Date future uniquement
                'appointment_time' => 'required|date_format:H:i', // Format heure : 10:00
                'consultation_type_id' => 'required|exists:consultation_types,id', // Type doit exister
                'notes' => 'nullable|string|max:500', // Notes optionnelles
            ]);

            // Vérifier que le créneau n'est pas déjà réservé
            $existingAppointment = Appointment::where('doctor_id', $validated['doctor_id'])
                ->where('appointment_date', $validated['appointment_date'])
                ->where('appointment_time', $validated['appointment_time'])
                ->whereNotIn('status', ['cancelled']) // Ignorer les rendez-vous annulés
                ->first();

            if ($existingAppointment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ce créneau est déjà réservé. Veuillez en choisir un autre.'
                ], 422);
            }

            // Créer le rendez-vous
            $appointment = Appointment::create([
                'patient_id' => $request->user()->id, // L'utilisateur connecté est le patient
                'doctor_id' => $validated['doctor_id'],
                'appointment_date' => $validated['appointment_date'],
                'appointment_time' => $validated['appointment_time'],
                'consultation_type_id' => $validated['consultation_type_id'],
                'status' => 'pending', // Statut par défaut : en attente
                'notes' => $validated['notes'] ?? null,
            ]);

            // Charger les relations pour la réponse
            $appointment->load(['patient', 'doctor', 'consultationType']);

            return response()->json([
                'success' => true,
                'message' => 'Rendez-vous créé avec succès',
                'data' => [
                    'id' => $appointment->id,
                    'patient' => [
                        'id' => $appointment->patient->id,
                        'name' => $appointment->patient->name,
                    ],
                    'doctor' => [
                        'id' => $appointment->doctor->id,
                        'name' => $appointment->doctor->name,
                    ],
                    'appointment_date' => $appointment->appointment_date->format('d/m/Y'),
                    'appointment_time' => Carbon::parse($appointment->appointment_time)->format('H:i'),
                    'consultation_type' => $appointment->consultationType->name,
                    'status' => $appointment->status,
                    'notes' => $appointment->notes,
                ]
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
     * Récupérer les rendez-vous du patient connecté
     * Route : GET /api/patients/appointments
     * Le patient voit uniquement SES rendez-vous
     */
    public function getPatientAppointments(Request $request)
    {
        try {
            $appointments = Appointment::where('patient_id', $request->user()->id)
                ->with(['doctor.doctorProfile', 'consultationType']) // Charger les relations
                ->orderBy('appointment_date', 'desc')
                ->orderBy('appointment_time', 'desc')
                ->get()
                ->map(function($appointment) {
                    return [
                        'id' => $appointment->id,
                        'doctor' => [
                            'id' => $appointment->doctor->id,
                            'name' => $appointment->doctor->name,
                            'specialite' => $appointment->doctor->doctorProfile->specialite ?? null,
                        ],
                        'appointment_date' => $appointment->appointment_date->format('d/m/Y'),
                        'appointment_time' => Carbon::parse($appointment->appointment_time)->format('H:i'),
                        'consultation_type' => $appointment->consultationType->name,
                        'status' => $appointment->status,
                        'notes' => $appointment->notes,
                    ];
                });

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
     * Récupérer le planning du médecin (ses rendez-vous)
     * Route : GET /api/doctors/appointments?week=YYYY-MM-DD
     * Le médecin voit uniquement SON planning
     */
    public function getDoctorAppointments(Request $request)
    {
        try {
            // Vérifier que l'utilisateur est un médecin
            if (!$request->user()->isDoctor()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès réservé aux médecins'
                ], 403);
            }

            // Si une semaine est spécifiée, filtrer par semaine
            $week = $request->input('week');
            $query = Appointment::where('doctor_id', $request->user()->id)
                ->with(['patient', 'consultationType']);

            if ($week) {
                $startOfWeek = Carbon::parse($week)->startOfWeek();
                $endOfWeek = Carbon::parse($week)->endOfWeek();

                $query->whereBetween('appointment_date', [
                    $startOfWeek->format('Y-m-d'),
                    $endOfWeek->format('Y-m-d')
                ]);
            }

            $appointments = $query->orderBy('appointment_date')
                ->orderBy('appointment_time')
                ->get()
                ->map(function($appointment) {
                    return [
                        'id' => $appointment->id,
                        'patient' => [
                            'id' => $appointment->patient->id,
                            'name' => $appointment->patient->name,
                            'telephone' => $appointment->patient->telephone,
                        ],
                        'appointment_date' => $appointment->appointment_date->format('d/m/Y'),
                        'appointment_time' => Carbon::parse($appointment->appointment_time)->format('H:i'),
                        'consultation_type' => $appointment->consultationType->name,
                        'status' => $appointment->status,
                        'notes' => $appointment->notes,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $appointments
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du planning',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Annuler un rendez-vous
     * Route : PUT /api/appointments/{id}/cancel
     * Le patient ou le médecin peut annuler
     */
    public function cancel(Request $request, $id)
    {
        try {
            $appointment = Appointment::findOrFail($id);

            // Vérifier les permissions : seul le patient ou le médecin concerné peut annuler
            if ($appointment->patient_id !== $request->user()->id &&
                $appointment->doctor_id !== $request->user()->id &&
                !$request->user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non autorisé'
                ], 403);
            }

            // Vérifier que le rendez-vous n'est pas déjà annulé
            if ($appointment->status === 'cancelled') {
                return response()->json([
                    'success' => false,
                    'message' => 'Ce rendez-vous est déjà annulé'
                ], 422);
            }

            // Annuler le rendez-vous
            $appointment->update(['status' => 'cancelled']);

            return response()->json([
                'success' => true,
                'message' => 'Rendez-vous annulé avec succès'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'annulation',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
