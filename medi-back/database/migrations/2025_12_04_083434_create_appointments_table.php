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
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();

            // Qui réserve (le patient)
            $table->foreignId('patient_id')->constrained('users')->onDelete('cascade');

            // Chez qui (le médecin)
            $table->foreignId('doctor_id')->constrained('users')->onDelete('cascade');

            // Quand (date et heure précises)
            $table->date('appointment_date'); // Ex: 2025-01-15
            $table->time('appointment_time'); // Ex: 10:00

            // Type de consultation
            $table->foreignId('consultation_type_id')->constrained('consultation_types')->onDelete('cascade');

            // Statut du rendez-vous
            $table->enum('status', [
                'pending',    // En attente de confirmation
                'confirmed',  // Confirmé
                'cancelled',  // Annulé
                'completed'   // Terminé
            ])->default('pending');

            // Notes optionnelles (symptômes, motif détaillé...)
            $table->text('notes')->nullable();

            $table->timestamps();

            // Index pour améliorer les performances des recherches
            $table->index(['doctor_id', 'appointment_date']); // Recherche rapide des rendez-vous d'un médecin
            $table->index(['patient_id', 'appointment_date']); // Recherche rapide des rendez-vous d'un patient

            // Contrainte : un médecin ne peut pas avoir 2 rendez-vous au même moment
            $table->unique(['doctor_id', 'appointment_date', 'appointment_time']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
