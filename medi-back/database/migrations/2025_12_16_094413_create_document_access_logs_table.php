<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Table pour logger tous les accès aux documents
     * (important pour la traçabilité et la conformité RGPD)
     */
    public function up(): void
    {
        Schema::create('document_access_logs', function (Blueprint $table) {
            $table->id();

            // Type de document accédé
            $table->enum('document_type', ['patient_document', 'prescription']);

            // ID du document (polymorphic)
            $table->unsignedBigInteger('document_id');

            // Qui a accédé
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

            // Action effectuée
            $table->enum('action', [
                'view',         // Consultation
                'download',     // Téléchargement
                'delete',       // Suppression
                'create',       // Création
                'update'        // Modification
            ]);

            // Informations techniques
            $table->ipAddress('ip_address');
            $table->text('user_agent')->nullable();

            // Timestamp
            $table->timestamp('accessed_at')->useCurrent();

            // Index pour recherches rapides
            $table->index(['user_id', 'accessed_at']);
            $table->index(['document_type', 'document_id']);
        });
    }

    /**
     * Supprimer la table
     */
    public function down(): void
    {
        Schema::dropIfExists('document_access_logs');
    }
};
