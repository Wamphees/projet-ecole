<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('doctor_profiles', function (Blueprint $table) {
            $table->id();

            // Lien vers la table users (un médecin = un user avec role 'medecin')
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

            // Informations spécifiques au médecin
            $table->string('etablissement'); // Nom de l'hôpital ou clinique
            $table->string('specialite'); // Ex: Cardiologue, Généraliste, Pédiatre...
            $table->string('diplome'); // Ex: Doctorat en médecine, Université de...

            $table->timestamps();

            // Un utilisateur ne peut avoir qu'un seul profil médecin
            $table->unique('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doctor_profiles');
    }
};
