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
        Schema::create('consultation_types', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Ex: Consultation générale, Urgence, Suivi...
            $table->text('description')->nullable(); // Description optionnelle
            $table->timestamps();
        });

        // Pré-remplir avec des types de consultation par défaut
        DB::table('consultation_types')->insert([
            [
                'name' => 'Consultation générale',
                'description' => 'Consultation médicale standard',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Consultation de suivi',
                'description' => 'Suivi médical après traitement',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Urgence',
                'description' => 'Consultation urgente',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Consultation spécialisée',
                'description' => 'Consultation avec un spécialiste',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Bilan de santé',
                'description' => 'Examen médical complet',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consultation_types');
    }
};
