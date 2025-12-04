<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DoctorAvailability extends Model
{
    /**
     * Table associée
     */
    protected $table = 'doctor_availabilities';

    /**
     * Champs qui peuvent être remplis en masse
     */
    protected $fillable = [
        'doctor_id',
        'day_of_week',
        'start_time',
        'end_time',
        'consultation_duration',
        'is_active',
    ];

    /**
     * Conversion automatique des types
     * Les horaires sont automatiquement convertis en objets Carbon
     */
    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * RELATIONS ELOQUENT
     */

    /**
     * Une disponibilité appartient à UN médecin (relation inverse N-1)
     * Retourne le médecin (User) associé à cette disponibilité
     */
    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    /**
     * MÉTHODES UTILES
     */

    /**
     * Récupérer le nom du jour en français
     */
    public function getDayNameInFrench(): string
    {
        $days = [
            'monday' => 'Lundi',
            'tuesday' => 'Mardi',
            'wednesday' => 'Mercredi',
            'thursday' => 'Jeudi',
            'friday' => 'Vendredi',
            'saturday' => 'Samedi',
            'sunday' => 'Dimanche',
        ];

        return $days[$this->day_of_week] ?? $this->day_of_week;
    }
}
