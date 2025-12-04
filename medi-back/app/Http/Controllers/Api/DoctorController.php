<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;

class DoctorController extends Controller
{
    /**
     * Récupérer la liste de tous les médecins
     * Route : GET /api/doctors
     * Accessible à tous (authentifié ou non)
     */
    public function index()
    {
        try {
            // Récupérer tous les utilisateurs avec le rôle 'medecin'
            // et charger leur profil de médecin (eager loading)
            $doctors = User::where('role', 'medecin')
                ->with('doctorProfile') // Charger la relation doctorProfile
                ->get()
                ->map(function ($doctor) {
                    // Transformer les données pour l'affichage
                    return [
                        'id' => $doctor->id,
                        'name' => $doctor->name,
                        'email' => $doctor->email,
                        'telephone' => $doctor->telephone,
                        'etablissement' => $doctor->doctorProfile->etablissement ?? null,
                        'specialite' => $doctor->doctorProfile->specialite ?? null,
                        'diplome' => $doctor->doctorProfile->diplome ?? null,
                    ];
                });

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

    /**
     * Récupérer les détails d'un médecin spécifique
     * Route : GET /api/doctors/{id}
     * Accessible à tous
     */
    public function show($id)
    {
        try {
            // Trouver le médecin par son ID
            $doctor = User::where('id', $id)
                ->where('role', 'medecin')
                ->with('doctorProfile') // Charger son profil
                ->first();

            // Si le médecin n'existe pas
            if (!$doctor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Médecin non trouvé'
                ], 404);
            }

            // Retourner les détails du médecin
            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $doctor->id,
                    'name' => $doctor->name,
                    'email' => $doctor->email,
                    'telephone' => $doctor->telephone,
                    'etablissement' => $doctor->doctorProfile->etablissement ?? null,
                    'specialite' => $doctor->doctorProfile->specialite ?? null,
                    'diplome' => $doctor->doctorProfile->diplome ?? null,
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du médecin',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
