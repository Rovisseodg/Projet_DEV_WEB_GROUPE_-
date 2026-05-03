<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Créer un utilisateur admin
        DB::table('users')->insert([
            'name' => 'Admin MaMutuelle',
            'email' => 'admin@mamutuelle.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Créer quelques adhérents de test
        DB::table('adherents')->insert([
            [
                'numero_adherent' => 'ADH001',
                'nom' => 'Dupont',
                'prenom' => 'Jean',
                'date_naissance' => '1980-05-15',
                'sexe' => 'M',
                'adresse' => '123 Rue de la Paix, Paris',
                'telephone' => '0123456789',
                'email' => 'jean.dupont@email.com',
                'date_adhesion' => '2023-01-15',
                'statut' => 'actif',
                'solde_cotisation' => 150.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'numero_adherent' => 'ADH002',
                'nom' => 'Martin',
                'prenom' => 'Marie',
                'date_naissance' => '1985-08-22',
                'sexe' => 'F',
                'adresse' => '456 Avenue des Roses, Lyon',
                'telephone' => '0987654321',
                'email' => 'marie.martin@email.com',
                'date_adhesion' => '2023-02-10',
                'statut' => 'actif',
                'solde_cotisation' => 200.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
