<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\DoctorProfile;
use App\Models\DoctorAvailability;
use Illuminate\Support\Facades\Hash;

class DoctorSeeder extends Seeder
{

        /**
     * Créer des médecins de test avec leurs profils et disponibilités
     */
    public function run(): void
    {
        // Médecin 1 : Dr. Marie Dubois - Cardiologue
        $doctor1 = User::create([
            'name' => 'Dr. Marie Dubois',
            'email' => 'marie.dubois@hopital.cm',
            'password' => Hash::make('password123'),
            'role' => 'medecin',
            'telephone' => '+237 670 123 456',
        ]);

        DoctorProfile::create([
            'user_id' => $doctor1->id,
            'etablissement' => 'Hôpital Central de Douala',
            'specialite' => 'Cardiologie',
            'diplome' => 'Doctorat en Médecine - Université de Yaoundé',
        ]);

        // Disponibilités du Dr. Dubois (Lundi au Vendredi, 9h-17h)
        $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        foreach ($days as $day) {
            DoctorAvailability::create([
                'doctor_id' => $doctor1->id,
                'day_of_week' => $day,
                'start_time' => '09:00',
                'end_time' => '17:00',
                'consultation_duration' => 60, // 1 heure
                'is_active' => true,
            ]);
        }

        // Médecin 2 : Dr. Paul Nguema - Pédiatre
        $doctor2 = User::create([
            'name' => 'Dr. Paul Nguema',
            'email' => 'paul.nguema@clinique.cm',
            'password' => Hash::make('password123'),
            'role' => 'medecin',
            'telephone' => '+237 670 234 567',
        ]);

        DoctorProfile::create([
            'user_id' => $doctor2->id,
            'etablissement' => 'Clinique des Anges',
            'specialite' => 'Pédiatrie',
            'diplome' => 'Doctorat en Médecine - Université de Douala',
        ]);

        // Disponibilités du Dr. Nguema (Lundi, Mercredi, Vendredi, 8h-16h)
        $doctor2Days = ['monday', 'wednesday', 'friday'];
        foreach ($doctor2Days as $day) {
            DoctorAvailability::create([
                'doctor_id' => $doctor2->id,
                'day_of_week' => $day,
                'start_time' => '08:00',
                'end_time' => '16:00',
                'consultation_duration' => 60,
                'is_active' => true,
            ]);
        }

        // Médecin 3 : Dr. Sophie Kameni - Généraliste
        $doctor3 = User::create([
            'name' => 'Dr. Sophie Kameni',
            'email' => 'sophie.kameni@sante.cm',
            'password' => Hash::make('password123'),
            'role' => 'medecin',
            'telephone' => '+237 670 345 678',
        ]);

        DoctorProfile::create([
            'user_id' => $doctor3->id,
            'etablissement' => 'Centre Médical Santé Plus',
            'specialite' => 'Médecine Générale',
            'diplome' => 'Doctorat en Médecine - Université de Buea',
        ]);

        // Disponibilités du Dr. Kameni (Tous les jours sauf dimanche, 10h-18h)
        $doctor3Days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        foreach ($doctor3Days as $day) {
            DoctorAvailability::create([
                'doctor_id' => $doctor3->id,
                'day_of_week' => $day,
                'start_time' => '10:00',
                'end_time' => '18:00',
                'consultation_duration' => 60,
                'is_active' => true,
            ]);
        }

        // Créer aussi un patient de test
        User::create([
            'name' => 'Jean Patient',
            'email' => 'jean@patient.cm',
            'password' => Hash::make('password123'),
            'role' => 'patient',
            'telephone' => '+237 670 456 789',
        ]);

        // Créer un admin de test
        User::create([
            'name' => 'Admin Principal',
            'email' => 'admin@hopital.cm',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'telephone' => '+237 670 567 890',
        ]);

        $this->command->info('✅ Médecins de test créés avec succès !');
        $this->command->info('📧 Emails de connexion :');
        $this->command->info('   - marie.dubois@hopital.cm (Médecin)');
        $this->command->info('   - paul.nguema@clinique.cm (Médecin)');
        $this->command->info('   - sophie.kameni@sante.cm (Médecin)');
        $this->command->info('   - jean@patient.cm (Patient)');
        $this->command->info('   - admin@hopital.cm (Admin)');
        $this->command->info('🔑 Mot de passe pour tous : password123');
    }
    }

