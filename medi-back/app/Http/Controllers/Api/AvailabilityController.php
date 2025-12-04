<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use App\Models\DoctorAvailability;
use App\Models\Appointment;

class AvailabilityController extends Controller
{
    /**
     * Récupérer les créneaux disponibles d'un médecin pour une date donnée
     * Route : GET /api/doctors/{doctorId}/available-slots?date=YYYY-MM-DD
     * Accessible à tous (pour que les patients puissent voir les créneaux)
     */
    public function getAvailableSlots(Request $request, $doctorId)
    {
        try {
            // Récupérer la date depuis la requête (par défaut aujourd'hui)
            $date = $request->input('date', Carbon::today()->format('Y-m-d'));
            $carbonDate = Carbon::parse($date);

            // Convertir la date en jour de la semaine (en anglais : monday, tuesday...)
            $dayOfWeek = strtolower($carbonDate->format('l'));

            // Étape 1 : Récupérer les disponibilités GÉNÉRALES du médecin pour ce jour
            $availability = DoctorAvailability::where('doctor_id', $doctorId)
                ->where('day_of_week', $dayOfWeek)
                ->where('is_active', true)
                ->first();

            // Si le médecin ne travaille pas ce jour-là
            if (!$availability) {
                return response()->json([
                    'success' => true,
                    'message' => 'Le médecin ne travaille pas ce jour',
                    'date' => $date,
                    'slots' => []
                ], 200);
            }

            // Étape 2 : Générer tous les créneaux possibles de la journée
            // Ex: Si le médecin travaille de 9h à 17h avec des consultations d'1h
            // On génère : 9h-10h, 10h-11h, 11h-12h, 12h-13h, 13h-14h, 14h-15h, 15h-16h, 16h-17h
            $allSlots = $this->generateTimeSlots(
                $availability->start_time,
                $availability->end_time,
                $availability->consultation_duration
            );

            // Étape 3 : Récupérer les créneaux DÉJÀ RÉSERVÉS pour cette date
            $bookedSlots = Appointment::where('doctor_id', $doctorId)
                ->where('appointment_date', $date)
                ->whereNotIn('status', ['cancelled']) // Ignorer les rendez-vous annulés
                ->pluck('appointment_time')
                ->map(fn($time) => Carbon::parse($time)->format('H:i'))
                ->toArray();

            // Étape 4 : Filtrer pour ne garder que les créneaux DISPONIBLES
            $availableSlots = array_filter($allSlots, function($slot) use ($bookedSlots, $date) {
                // Vérifier si le créneau est dans le passé
                $slotDateTime = Carbon::parse($date . ' ' . $slot);
                if ($slotDateTime->isPast()) {
                    return false; // Ne pas afficher les créneaux passés
                }

                // Vérifier si le créneau est déjà réservé
                if (in_array($slot, $bookedSlots)) {
                    return false; // Ce créneau est occupé
                }

                return true; // Ce créneau est libre !
            });

            // Transformer les créneaux au format "10h-11h" pour l'affichage
            $formattedSlots = array_map(function($slot) use ($availability) {
                $start = Carbon::parse($slot);
                $end = $start->copy()->addMinutes($availability->consultation_duration);
                return [
                    'value' => $slot, // Valeur à envoyer au backend (ex: "10:00")
                    'label' => $start->format('H\hi') . '-' . $end->format('H\hi') // Affichage (ex: "10h-11h")
                ];
            }, array_values($availableSlots));

            return response()->json([
                'success' => true,
                'date' => $date,
                'doctor_id' => $doctorId,
                'slots' => $formattedSlots
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des créneaux',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Générer tous les créneaux horaires possibles
     * Méthode privée utilisée par getAvailableSlots
     */
    private function generateTimeSlots($startTime, $endTime, $duration)
    {
        $slots = [];
        $current = Carbon::parse($startTime);
        $end = Carbon::parse($endTime);

        // Boucle pour créer tous les créneaux
        // Ex: De 9h à 17h avec 60min → 9h, 10h, 11h, 12h, 13h, 14h, 15h, 16h
        while ($current->lt($end)) {
            $slots[] = $current->format('H:i');
            $current->addMinutes($duration); // Ajouter la durée de consultation
        }

        return $slots;
    }

    /**
     * Récupérer les disponibilités hebdomadaires d'un médecin
     * Route : GET /api/doctors/{doctorId}/availabilities
     * Utile pour afficher l'emploi du temps général du médecin
     */
    public function getDoctorAvailabilities($doctorId)
    {
        try {
            $availabilities = DoctorAvailability::where('doctor_id', $doctorId)
                ->where('is_active', true)
                ->get()
                ->map(function($availability) {
                    return [
                        'day_of_week' => $availability->getDayNameInFrench(),
                        'start_time' => Carbon::parse($availability->start_time)->format('H:i'),
                        'end_time' => Carbon::parse($availability->end_time)->format('H:i'),
                        'consultation_duration' => $availability->consultation_duration,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $availabilities
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des disponibilités',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
