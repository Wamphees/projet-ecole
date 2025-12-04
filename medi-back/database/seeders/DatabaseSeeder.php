<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    // /**
    //  * Seed the application's database.
    //  */
    // public function run(): void
    // {
    //     // User::factory(10)->create();

    //     User::factory()->create([
    //         'name' => 'Test User',
    //         'email' => 'test@example.com',
    //     ]);
    // }
    /**
     * Remplir la base de données avec des données de test
     */
    public function run(): void
    {
        // Appeler le seeder des médecins
        $this->call([
            DoctorSeeder::class,
        ]);
    }
}
