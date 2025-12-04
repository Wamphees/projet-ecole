<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;


class Appointment extends Model
{
    /**
     * Table associée
     */
    protected $table = 'appointments';

    /**
     * Champs qui peuvent être remplis en masse
     */
    protected $fillable = [
        'patient_id',
        'doctor_id',
        'appointment_date',
        'appointment_time',
        'consultation_type_id',
        'status',
        'notes',
    ];

    /**
     * Conversion automatique des types
     */
    protected $casts = [
        'appointment_date' => 'date',
    ];

    /**
     * RELATIONS ELOQUENT
     */

    /**
     * Un rendez-vous appartient à UN patient (relation inverse N-1)
     */
    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    /**
     * Un rendez-vous appartient à UN médecin (relation inverse N-1)
     */
    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    /**
     * Un rendez-vous a UN type de consultation (relation inverse N-1)
     */
    public function consultationType()
    {
        return $this->belongsTo(ConsultationType::class, 'consultation_type_id');
    }

    /**
     * MÉTHODES UTILES
     */

    /**
     * Vérifier si le rendez-vous est dans le passé
     */
    public function isPast(): bool
    {
        $appointmentDateTime = Carbon::parse(Carbon::parse($this->appointment_date)->format('Y-m-d') . ' ' . $this->appointment_time);
        return $appointmentDateTime->isPast();
    }

    /**
     * Vérifier si le rendez-vous est aujourd'hui
     */
    public function isToday(): bool
    {
        return Carbon::parse($this->appointment_date)->isToday();
    }

    /**
     * Vérifier si le rendez-vous est confirmé
     */
    public function isConfirmed(): bool
    {
        return $this->status === 'confirmed';
    }

    /**
     * Vérifier si le rendez-vous est annulé
     */
    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    /**
     * Formater la date et l'heure pour l'affichage
     */
    public function getFormattedDateTime(): string
    {
        return Carbon::parse($this->appointment_date)->format('d/m/Y') . ' à ' .
               Carbon::parse($this->appointment_time)->format('H:i');
    }

    /**
     * SCOPES (requêtes réutilisables)
     */

    /**
     * Filtrer les rendez-vous par statut
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Filtrer les rendez-vous futurs
     */
    public function scopeUpcoming($query)
    {
        return $query->where('appointment_date', '>=', now()->toDateString())
                    ->orderBy('appointment_date')
                    ->orderBy('appointment_time');
    }

    /**
     * Filtrer les rendez-vous passés
     */
    public function scopePast($query)
    {
        return $query->where('appointment_date', '<', now()->toDateString())
                    ->orderBy('appointment_date', 'desc')
                    ->orderBy('appointment_time', 'desc');
    }
}
