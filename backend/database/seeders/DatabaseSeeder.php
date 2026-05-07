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
        // ── Nettoyage dans l'ordre des dépendances ──────────────────
        // Désactiver les contraintes de clés étrangères pour PostgreSQL
        DB::statement('SET session_replication_role = replica');

        // Tables à nettoyer (seulement celles qui existent)
        $tablesToTruncate = ['alertes', 'prestations', 'sinistres', 'remboursements_prets', 'prets', 'cotisations', 'ayants_droit', 'adherents', 'users'];

        foreach ($tablesToTruncate as $table) {
            try {
                DB::table($table)->truncate();
            } catch (\Exception $e) {
                // Table n'existe pas, on continue
                continue;
            }
        }

        // Réactiver les contraintes de clés étrangères pour PostgreSQL
        DB::statement('SET session_replication_role = DEFAULT');

        // ============================================================
        // 1. USERS
        // Mot de passe pour tous : "password123"
        // ============================================================
        $users = [
            // ── Admin & Agent ──
            [
                'name'       => 'Admin MaMutuelle',
                'email'      => 'admin@mamutuelle.bf',
                'password'   => Hash::make('password123'),
                'role'       => 'admin',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name'       => 'Agent Traoré',
                'email'      => 'agent@mamutuelle.bf',
                'password'   => Hash::make('password123'),
                'role'       => 'agent',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // ── Adhérents ──
            [
                'name'       => 'Koné Oumar',
                'email'      => 'kone.oumar@email.bf',
                'password'   => Hash::make('password123'),
                'role'       => 'adherent',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name'       => 'Zongo Aminata',
                'email'      => 'zongo.aminata@email.bf',
                'password'   => Hash::make('password123'),
                'role'       => 'adherent',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name'       => 'Bambara Brice',
                'email'      => 'bambara.brice@email.bf',
                'password'   => Hash::make('password123'),
                'role'       => 'adherent',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name'       => 'Sawadogo Mariam',
                'email'      => 'sawadogo.mariam@email.bf',
                'password'   => Hash::make('password123'),
                'role'       => 'adherent',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name'       => 'Ouédraogo Issouf',
                'email'      => 'ouedraogo.issouf@email.bf',
                'password'   => Hash::make('password123'),
                'role'       => 'adherent',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('users')->insert($users);

        // Récupérer les IDs générés
        $adminId   = DB::table('users')->where('email', 'admin@mamutuelle.bf')->value('id');
        $adherent1 = DB::table('users')->where('email', 'kone.oumar@email.bf')->value('id');
        $adherent2 = DB::table('users')->where('email', 'zongo.aminata@email.bf')->value('id');
        $adherent3 = DB::table('users')->where('email', 'bambara.brice@email.bf')->value('id');
        $adherent4 = DB::table('users')->where('email', 'sawadogo.mariam@email.bf')->value('id');
        $adherent5 = DB::table('users')->where('email', 'ouedraogo.issouf@email.bf')->value('id');

        // ============================================================
        // 2. ADHERENTS — liés aux users via user_id
        // ============================================================
        DB::table('adherents')->insert([
            [
                'user_id'          => $adherent1,   // ← LIAISON user ↔ adherent
                'numero_adherent'  => 'ADH001',
                'nom'              => 'Koné',
                'prenom'           => 'Oumar',
                'email'            => 'kone.oumar@email.bf',
                'telephone'        => '+226 70 11 22 33',
                'date_naissance'   => '1985-03-22',
                'genre'            => 'homme',
                'adresse'          => 'Secteur 12, Rue 10.45',
                'ville'            => 'Ouagadougou',
                'code_postal'      => '01 BP 000',
                'date_inscription' => '2023-01-15',
                'statut'           => 'actif',
                'created_at'       => now(),
                'updated_at'       => now(),
            ],
            [
                'user_id'          => $adherent2,
                'numero_adherent'  => 'ADH002',
                'nom'              => 'Zongo',
                'prenom'           => 'Aminata',
                'email'            => 'zongo.aminata@email.bf',
                'telephone'        => '+226 76 22 33 44',
                'date_naissance'   => '1990-07-14',
                'genre'            => 'femme',
                'adresse'          => 'Secteur 4, Avenue Yennenga',
                'ville'            => 'Ouagadougou',
                'code_postal'      => '01 BP 001',
                'date_inscription' => '2023-02-01',
                'statut'           => 'actif',
                'created_at'       => now(),
                'updated_at'       => now(),
            ],
            [
                'user_id'          => $adherent3,
                'numero_adherent'  => 'ADH003',
                'nom'              => 'Bambara',
                'prenom'           => 'Brice',
                'email'            => 'bambara.brice@email.bf',
                'telephone'        => '+226 65 33 44 55',
                'date_naissance'   => '1988-11-05',
                'genre'            => 'homme',
                'adresse'          => 'Rue du Commerce',
                'ville'            => 'Bobo-Dioulasso',
                'code_postal'      => '01 BP 002',
                'date_inscription' => '2023-03-10',
                'statut'           => 'actif',
                'created_at'       => now(),
                'updated_at'       => now(),
            ],
            [
                'user_id'          => $adherent4,
                'numero_adherent'  => 'ADH004',
                'nom'              => 'Sawadogo',
                'prenom'           => 'Mariam',
                'email'            => 'sawadogo.mariam@email.bf',
                'telephone'        => '+226 71 44 55 66',
                'date_naissance'   => '1992-05-30',
                'genre'            => 'femme',
                'adresse'          => 'Secteur 7, Rue 8.12',
                'ville'            => 'Ouagadougou',
                'code_postal'      => '01 BP 003',
                'date_inscription' => '2023-04-05',
                'statut'           => 'actif',
                'created_at'       => now(),
                'updated_at'       => now(),
            ],
            [
                'user_id'          => $adherent5,
                'numero_adherent'  => 'ADH005',
                'nom'              => 'Ouédraogo',
                'prenom'           => 'Issouf',
                'email'            => 'ouedraogo.issouf@email.bf',
                'telephone'        => '+226 78 55 66 77',
                'date_naissance'   => '1980-01-18',
                'genre'            => 'homme',
                'adresse'          => 'Avenue Kwame Nkrumah',
                'ville'            => 'Ouagadougou',
                'code_postal'      => '01 BP 004',
                'date_inscription' => '2023-05-20',
                'statut'           => 'actif',
                'created_at'       => now(),
                'updated_at'       => now(),
            ],
        ]);

        // Récupérer les IDs des adhérents
        $adhId1 = DB::table('adherents')->where('numero_adherent', 'ADH001')->value('id');
        $adhId2 = DB::table('adherents')->where('numero_adherent', 'ADH002')->value('id');
        $adhId3 = DB::table('adherents')->where('numero_adherent', 'ADH003')->value('id');
        $adhId4 = DB::table('adherents')->where('numero_adherent', 'ADH004')->value('id');
        $adhId5 = DB::table('adherents')->where('numero_adherent', 'ADH005')->value('id');

        // Debug: vérifier les IDs
        \Log::info('Adherent IDs:', ['adhId1' => $adhId1, 'adhId2' => $adhId2, 'adhId3' => $adhId3, 'adhId4' => $adhId4, 'adhId5' => $adhId5]);

        // ============================================================
        // 3. AYANTS DROIT
        // ============================================================
        \Log::info('Starting ayants_droit insertion');

        $ayantsDroit = [
            ['adherent_id' => $adhId1, 'nom' => 'Koné',      'prenom' => 'Aïcha',    'relation' => 'epoux', 'date_naissance' => '1987-06-10', 'created_at' => now(), 'updated_at' => now()],
            ['adherent_id' => $adhId1, 'nom' => 'Koné',      'prenom' => 'Ibrahim',  'relation' => 'enfant',   'date_naissance' => '2010-03-15', 'created_at' => now(), 'updated_at' => now()],
            ['adherent_id' => $adhId2, 'nom' => 'Zongo',     'prenom' => 'Moussa',   'relation' => 'epoux', 'date_naissance' => '1988-04-20', 'created_at' => now(), 'updated_at' => now()],
            ['adherent_id' => $adhId2, 'nom' => 'Zongo',     'prenom' => 'Salimata', 'relation' => 'enfant',   'date_naissance' => '2015-11-05', 'created_at' => now(), 'updated_at' => now()],
            ['adherent_id' => $adhId3, 'nom' => 'Bambara',   'prenom' => 'Marie',    'relation' => 'epoux', 'date_naissance' => '1990-02-28', 'created_at' => now(), 'updated_at' => now()],
            ['adherent_id' => $adhId4, 'nom' => 'Sawadogo',  'prenom' => 'Adama',    'relation' => 'epoux', 'date_naissance' => '1989-07-17', 'created_at' => now(), 'updated_at' => now()],
            ['adherent_id' => $adhId5, 'nom' => 'Ouédraogo', 'prenom' => 'Kadiatou', 'relation' => 'epoux', 'date_naissance' => '1982-09-12', 'created_at' => now(), 'updated_at' => now()],
        ];

        foreach ($ayantsDroit as $index => $ayantDroit) {
            try {
                DB::table('ayants_droit')->insert($ayantDroit);
                \Log::info("Ayant droit {$index} inserted successfully");
            } catch (\Exception $e) {
                \Log::error("Failed to insert ayant droit {$index}: " . $e->getMessage());
                throw $e; // Re-throw to stop the seeder
            }
        }

        \Log::info('All ayants droit inserted successfully');

        // ============================================================
        // 4. COTISATIONS
        // ============================================================
        \Log::info('Starting cotisations insertion');

        $cotisations = [
            // ADH001 — Koné Oumar
            ['adherent_id' => $adhId1, 'montant' => 5000, 'date_echeance' => '2024-01-31', 'date_paiement' => '2024-01-28', 'statut' => 'payée',      'reference_paiement' => 'REF-2024-001', 'mode_paiement' => 'virement', 'created_at' => now(), 'updated_at' => now()],
            ['adherent_id' => $adhId1, 'montant' => 5000, 'date_echeance' => '2024-02-29', 'date_paiement' => '2024-02-25', 'statut' => 'payée',      'reference_paiement' => 'REF-2024-002', 'mode_paiement' => 'virement', 'created_at' => now(), 'updated_at' => now()],
            ['adherent_id' => $adhId1, 'montant' => 5000, 'date_echeance' => '2024-03-31', 'date_paiement' => '2024-03-27', 'statut' => 'payée',      'reference_paiement' => 'REF-2024-003', 'mode_paiement' => 'virement', 'created_at' => now(), 'updated_at' => now()],
            ['adherent_id' => $adhId1, 'montant' => 5000, 'date_echeance' => '2024-04-30', 'date_paiement' => null,         'statut' => 'en attente', 'reference_paiement' => '',             'mode_paiement' => null,       'created_at' => now(), 'updated_at' => now()],
            // ADH002 — Zongo Aminata
            ['adherent_id' => $adhId2, 'montant' => 5000, 'date_echeance' => '2024-01-31', 'date_paiement' => '2024-02-05', 'statut' => 'payée',      'reference_paiement' => 'REF-2024-010', 'mode_paiement' => 'especes',  'created_at' => now(), 'updated_at' => now()],
            ['adherent_id' => $adhId2, 'montant' => 5000, 'date_echeance' => '2024-02-29', 'date_paiement' => null,         'statut' => 'en retard',  'reference_paiement' => '',             'mode_paiement' => null,       'created_at' => now(), 'updated_at' => now()],
            ['adherent_id' => $adhId2, 'montant' => 5000, 'date_echeance' => '2024-03-31', 'date_paiement' => null,         'statut' => 'en retard',  'reference_paiement' => '',             'mode_paiement' => null,       'created_at' => now(), 'updated_at' => now()],
            // ADH003 — Bambara Brice
            ['adherent_id' => $adhId3, 'montant' => 7500, 'date_echeance' => '2024-01-31', 'date_paiement' => '2024-01-30', 'statut' => 'payée',      'reference_paiement' => 'REF-2024-020', 'mode_paiement' => 'cheque',   'created_at' => now(), 'updated_at' => now()],
            ['adherent_id' => $adhId3, 'montant' => 7500, 'date_echeance' => '2024-02-29', 'date_paiement' => '2024-02-28', 'statut' => 'payée',      'reference_paiement' => 'REF-2024-021', 'mode_paiement' => 'cheque',   'created_at' => now(), 'updated_at' => now()],
            ['adherent_id' => $adhId3, 'montant' => 7500, 'date_echeance' => '2024-03-31', 'date_paiement' => null,         'statut' => 'en attente', 'reference_paiement' => '',             'mode_paiement' => null,       'created_at' => now(), 'updated_at' => now()],
            // ADH004 — Sawadogo Mariam
            ['adherent_id' => $adhId4, 'montant' => 5000, 'date_echeance' => '2024-01-31', 'date_paiement' => '2024-01-29', 'statut' => 'payée',      'reference_paiement' => 'REF-2024-030', 'mode_paiement' => 'carte',    'created_at' => now(), 'updated_at' => now()],
            ['adherent_id' => $adhId4, 'montant' => 5000, 'date_echeance' => '2024-02-29', 'date_paiement' => null,         'statut' => 'en retard',  'reference_paiement' => '',             'mode_paiement' => null,       'created_at' => now(), 'updated_at' => now()],
            // ADH005 — Ouédraogo Issouf
            ['adherent_id' => $adhId5, 'montant' => 5000, 'date_echeance' => '2024-01-31', 'date_paiement' => '2024-01-31', 'statut' => 'payée',      'reference_paiement' => 'REF-2024-040', 'mode_paiement' => 'virement', 'created_at' => now(), 'updated_at' => now()],
            ['adherent_id' => $adhId5, 'montant' => 5000, 'date_echeance' => '2024-02-29', 'date_paiement' => '2024-02-29', 'statut' => 'payée',      'reference_paiement' => 'REF-2024-041', 'mode_paiement' => 'virement', 'created_at' => now(), 'updated_at' => now()],
            ['adherent_id' => $adhId5, 'montant' => 5000, 'date_echeance' => '2024-03-31', 'date_paiement' => '2024-03-31', 'statut' => 'payée',      'reference_paiement' => 'REF-2024-042', 'mode_paiement' => 'virement', 'created_at' => now(), 'updated_at' => now()],
        ];

        foreach ($cotisations as $index => $cotisation) {
            try {
                DB::table('cotisations')->insert($cotisation);
                \Log::info("Cotisation {$index} inserted successfully");
            } catch (\Exception $e) {
                \Log::error("Failed to insert cotisation {$index}: " . $e->getMessage());
                throw $e; // Re-throw to stop the seeder
            }
        }

        \Log::info('All cotisations inserted successfully');

        // ============================================================
        // 5. PRÊTS
        // ============================================================
        DB::table('prets')->insert([
            ['adherent_id' => $adhId1, 'montant' => 150000, 'taux_interet' => 2.5, 'duree_mois' => 12, 'date_debut' => '2024-01-15', 'date_fin' => '2025-01-15', 'statut' => 'approuvé',   'created_at' => now(), 'updated_at' => now()],
            ['adherent_id' => $adhId3, 'montant' => 300000, 'taux_interet' => 3.0, 'duree_mois' => 24, 'date_debut' => '2024-02-01', 'date_fin' => '2026-02-01', 'statut' => 'approuvé',   'created_at' => now(), 'updated_at' => now()],
            ['adherent_id' => $adhId5, 'montant' => 100000, 'taux_interet' => 2.5, 'duree_mois' =>  6, 'date_debut' => '2024-03-01', 'date_fin' => '2024-09-01', 'statut' => 'remboursé',  'created_at' => now(), 'updated_at' => now()],
            ['adherent_id' => $adhId2, 'montant' =>  75000, 'taux_interet' => 3.5, 'duree_mois' => 12, 'date_debut' => '2024-04-01', 'date_fin' => '2025-04-01', 'statut' => 'en attente', 'created_at' => now(), 'updated_at' => now()],
            ['adherent_id' => $adhId4, 'montant' =>  50000, 'taux_interet' => 4.0, 'duree_mois' =>  6, 'date_debut' => '2024-05-01', 'date_fin' => '2024-11-01', 'statut' => 'rejeté',     'created_at' => now(), 'updated_at' => now()],
        ]);

        // Récupérer l'ID du prêt approuvé d'ADH001
        $pretId1 = DB::table('prets')->where('adherent_id', $adhId1)->value('id');

        // ============================================================
        // 6. REMBOURSEMENTS PRÊTS (pour ADH001)
        // ============================================================
        DB::table('remboursements_prets')->insert([
            ['pret_id' => $pretId1, 'numero_echeance' => 1, 'montant' => 13500, 'date_echeance' => '2024-02-15', 'date_paiement' => '2024-02-14', 'statut' => 'payée',      'created_at' => now(), 'updated_at' => now()],
            ['pret_id' => $pretId1, 'numero_echeance' => 2, 'montant' => 13500, 'date_echeance' => '2024-03-15', 'date_paiement' => '2024-03-13', 'statut' => 'payée',      'created_at' => now(), 'updated_at' => now()],
            ['pret_id' => $pretId1, 'numero_echeance' => 3, 'montant' => 13500, 'date_echeance' => '2024-04-15', 'date_paiement' => '2024-04-15', 'statut' => 'payée',      'created_at' => now(), 'updated_at' => now()],
            ['pret_id' => $pretId1, 'numero_echeance' => 4, 'montant' => 13500, 'date_echeance' => '2024-05-15', 'date_paiement' => null,         'statut' => 'en attente', 'created_at' => now(), 'updated_at' => now()],
            ['pret_id' => $pretId1, 'numero_echeance' => 5, 'montant' => 13500, 'date_echeance' => '2024-06-15', 'date_paiement' => null,         'statut' => 'en attente', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // ============================================================
        // 7. SINISTRES
        // ============================================================
        DB::table('sinistres')->insert([
            ['adherent_id' => $adhId1, 'description' => 'Hospitalisation suite à paludisme sévère, 5 jours en clinique', 'date_sinistre' => '2024-02-10', 'type_sinistre' => 'hospitalisation', 'statut' => 'approuvé',  'montant_reclamation' => 85000,  'montant_remboursement' => 70000, 'created_at' => now(), 'updated_at' => now()],
            ['adherent_id' => $adhId2, 'description' => 'Consultation médicale et ordonnance pour grippe',               'date_sinistre' => '2024-03-05', 'type_sinistre' => 'maladie',         'statut' => 'déclaré',   'montant_reclamation' => 15000,  'montant_remboursement' => null,  'created_at' => now(), 'updated_at' => now()],
            ['adherent_id' => $adhId3, 'description' => 'Accident de moto, fracture du bras droit',                     'date_sinistre' => '2024-01-20', 'type_sinistre' => 'accident',        'statut' => 'approuvé',  'montant_reclamation' => 120000, 'montant_remboursement' => 100000,'created_at' => now(), 'updated_at' => now()],
            ['adherent_id' => $adhId4, 'description' => 'Consultation pédiatrique pour enfant',                         'date_sinistre' => '2024-04-01', 'type_sinistre' => 'maladie',         'statut' => 'déclaré',   'montant_reclamation' => 12000,  'montant_remboursement' => null,  'created_at' => now(), 'updated_at' => now()],
            ['adherent_id' => $adhId5, 'description' => 'Décès du père, frais funéraires',                              'date_sinistre' => '2024-02-28', 'type_sinistre' => 'décès',           'statut' => 'approuvé',  'montant_reclamation' => 200000, 'montant_remboursement' => 150000,'created_at' => now(), 'updated_at' => now()],
        ]);

        // Récupérer IDs sinistres pour les prestations
        $sinId1 = DB::table('sinistres')->where('adherent_id', $adhId1)->value('id');
        $sinId3 = DB::table('sinistres')->where('adherent_id', $adhId3)->value('id');

        // ============================================================
        // 8. PRESTATIONS
        // ============================================================
        DB::table('prestations')->insert([
            ['sinistre_id' => $sinId1, 'type_prestation' => 'Remboursement hospitalisation', 'description' => 'Frais clinique + médicaments paludisme', 'montant' => 70000,  'date_demande' => '2024-02-15', 'date_approbation' => '2024-02-25', 'statut' => 'approuvée', 'created_at' => now(), 'updated_at' => now()],
            ['sinistre_id' => $sinId3, 'type_prestation' => 'Remboursement accident',        'description' => 'Frais chirurgie et plâtre bras droit',   'montant' => 100000, 'date_demande' => '2024-01-25', 'date_approbation' => '2024-02-05', 'statut' => 'approuvée', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // ============================================================
        // 9. ALERTES
        // ============================================================
        DB::table('alertes')->insert([
            ['adherent_id' => $adhId2, 'type_alerte' => 'retard_cotisation', 'message' => 'Cotisation de février 2024 non payée',    'statut' => 'active', 'created_at' => now(), 'updated_at' => now()],
            ['adherent_id' => $adhId2, 'type_alerte' => 'retard_cotisation', 'message' => 'Cotisation de mars 2024 non payée',       'statut' => 'active', 'created_at' => now(), 'updated_at' => now()],
            ['adherent_id' => $adhId4, 'type_alerte' => 'retard_cotisation', 'message' => 'Cotisation de février 2024 non payée',    'statut' => 'active', 'created_at' => now(), 'updated_at' => now()],
            ['adherent_id' => $adhId1, 'type_alerte' => 'pret_echeance',     'message' => 'Mensualité prêt du 15/05/2024 bientôt due','statut' => 'active', 'created_at' => now(), 'updated_at' => now()],
        ]);

        $this->command->info('✅ Seed terminé avec succès !');
        $this->command->info('');
        $this->command->info('Comptes de test :');
        $this->command->info('  Admin   → admin@mamutuelle.bf   / password123');
        $this->command->info('  Agent   → agent@mamutuelle.bf   / password123');
        $this->command->info('  Adhérent → kone.oumar@email.bf  / password123');
        $this->command->info('  Adhérent → zongo.aminata@email.bf / password123');
    }
}
