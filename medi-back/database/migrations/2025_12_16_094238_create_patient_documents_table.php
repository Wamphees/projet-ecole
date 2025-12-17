<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Table pour stocker les documents téléversés par les patients
     * (ordonnances, résultats d'analyses, radios, etc.)
     */
    public function up(): void
    {
        Schema::create('patient_documents', function (Blueprint $table) {
            $table->id();

            // Lien vers le patient
            $table->foreignId('patient_id')->constrained('users')->onDelete('cascade');

            // Type de document
            $table->enum('document_type', [
                'ordonnance',       // Ordonnance médicale
                'analyse',          // Résultats d'analyses (sang, urine, etc.)
                'imagerie',         // Radio, scanner, IRM, échographie
                'compte_rendu',     // Compte-rendu de consultation
                'carte_vitale',     // Carte d'identité, carte vitale, assurance
                'autre'             // Autres documents
            ]);

            // Informations sur le fichier
            $table->string('file_path');        // Chemin du fichier sur le disque
            $table->string('file_name');        // Nom original du fichier
            $table->integer('file_size');       // Taille en bytes
            $table->string('mime_type');        // Type MIME (image/jpeg, application/pdf, etc.)

            // Contenu extrait par OCR pour la recherche
            $table->text('extracted_text')->nullable();

            // Tags générés par l'IA (JSON array)
            $table->json('ai_tags')->nullable(); // Ex: ["diabète", "cardiologie", "urgent"]

            // Qui a uploadé
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');

            // Visibilité (le médecin peut uploader des docs que le patient ne doit pas voir immédiatement)
            $table->boolean('is_visible_to_patient')->default(true);

            // Date d'upload
            $table->timestamp('uploaded_at')->useCurrent();

            $table->timestamps();

            // Index pour améliorer les performances de recherche
            $table->index(['patient_id', 'document_type']);
            $table->fullText('extracted_text'); // Index full-text pour recherche rapide
        });
    }

    /**
     * Supprimer la table
     */
    public function down(): void
    {
        Schema::dropIfExists('patient_documents');
    }
};
