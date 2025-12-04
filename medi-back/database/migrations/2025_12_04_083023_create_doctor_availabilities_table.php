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
        Schema::create('doctor_availabilities', function (Blueprint $table) {
            $table->id();

            // Lien vers le médecin (table users)
            $table->foreignId('doctor_id')->constrained('users')->onDelete('cascade');

            // Jour de la semaine
            $table->enum('day_of_week', [
                'monday',    // Lundi
                'tuesday',   // Mardi
                'wednesday', // Mercredi
                'thursday',  // Jeudi
                'friday',    // Vendredi
                'saturday',  // Samedi
                'sunday'     // Dimanche
            ]);

            // Horaires de travail
            $table->time('start_time'); // Ex: 09:00
            $table->time('end_time');   // Ex: 17:00

            // Durée des consultations en minutes (par défaut 60 min = 1h)
            $table->integer('consultation_duration')->default(60);

            // Permet d'activer/désactiver une disponibilité sans la supprimer
            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doctor_availabilities');
    }
};
