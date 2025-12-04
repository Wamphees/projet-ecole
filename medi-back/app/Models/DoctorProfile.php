<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DoctorProfile extends Model
{
    /**
     * Nom de la table associée au modèle
     */
    protected $table = 'doctor_profiles';

    /**
     * Champs qui peuvent être remplis en masse
     */
    protected $fillable = [
        'user_id',
        'etablissement',
        'specialite',
        'diplome',
    ];

    /**
     * RELATIONS ELOQUENT
     */

    /**
     * Un profil de médecin appartient à UN utilisateur (relation inverse 1-1)
     * Retourne l'utilisateur (User) associé à ce profil
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
