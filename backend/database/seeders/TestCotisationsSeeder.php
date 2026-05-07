<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TestCotisationsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Test d'insertion de cotisations
        DB::table('cotisations')->insert([
            [
                'adherent_id' => 1,
                'montant' => 5000,
                'date_echeance' => '2024-01-31',
                'date_paiement' => '2024-01-28',
                'statut' => 'payée',
                'reference_paiement' => 'TEST-001',
                'mode_paiement' => 'virement',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
