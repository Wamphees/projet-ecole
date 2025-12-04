<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConsultationType extends Model
{
    /**
     * Table associée
     */
    protected $table = 'consultation_types';

    /**
     * Champs qui peuvent être remplis en masse
     */
    protected $fillable = [
        'name',
        'description',
    ];

    /**
     * RELATIONS ELOQUENT
     */

    /**
     * Un type de consultation peut avoir PLUSIEURS rendez-vous (relation 1-N)
     * Retourne tous les rendez-vous qui utilisent ce type de consultation
     */
    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'consultation_type_id');
    }
}
