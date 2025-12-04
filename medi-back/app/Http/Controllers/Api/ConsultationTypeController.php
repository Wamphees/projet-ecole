<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ConsultationType;


class ConsultationTypeController extends Controller
{
    /**
     * Récupérer la liste de tous les types de consultation
     * Route : GET /api/consultation-types
     * Accessible à tous (pour remplir la liste déroulante du formulaire)
     */
    public function index()
    {
        try {
            // Récupérer tous les types de consultation
            $consultationTypes = ConsultationType::all()->map(function($type) {
                return [
                    'id' => $type->id,
                    'name' => $type->name,
                    'description' => $type->description,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $consultationTypes
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des types de consultation',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
