<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Table pour stocker les ordonnances générées par les médecins
     */
    public function up(): void
    {
        Schema::create('prescriptions', function (Blueprint $table) {
            $table->id();

            // Patient concerné
            $table->foreignId('patient_id')->constrained('users')->onDelete('cascade');

            // Médecin prescripteur
            $table->foreignId('doctor_id')->constrained('users')->onDelete('cascade');

            // Lien avec un rendez-vous (optionnel)
            $table->foreignId('appointment_id')->nullable()->constrained('appointments')->onDelete('set null');

            // Statut de l'ordonnance
            $table->enum('status', [
                'draft',        // Brouillon (en cours de rédaction)
                'validated',    // Validée et envoyée au patient
                'cancelled'     // Annulée
            ])->default('draft');

            // Contenu de l'ordonnance (JSON)
            // Format: [
            //   {
            //     "medication": "Paracétamol 1g",
            //     "dosage": "1 comprimé",
            //     "frequency": "3 fois par jour",
            //     "duration": "7 jours",
            //     "instructions": "À prendre pendant les repas"
            //   }
            // ]
            $table->json('medications');

            // Instructions générales pour le patient
            $table->text('instructions')->nullable();

            // Chemin vers le PDF généré
            $table->string('file_path')->nullable();

            // Informations IA
            $table->boolean('generated_by_ai')->default(false);
            $table->text('ai_prompt')->nullable(); // Le prompt utilisé si généré par IA

            // Versioning (pour corrections)
            $table->integer('version')->default(1);
            $table->foreignId('parent_id')->nullable()->constrained('prescriptions')->onDelete('cascade'); // Si c'est une correction

            // Dates importantes
            $table->timestamp('validated_at')->nullable(); // Date de validation

            $table->timestamps();

            // Index
            $table->index(['patient_id', 'doctor_id', 'status']);
        });
    }

    /**
     * Supprimer la table
     */
    public function down(): void
    {
        Schema::dropIfExists('prescriptions');
    }
};
