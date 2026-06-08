<?php
/**
 * Script de migration des adhérents existants vers le système d'authentification JWT
 * 
 * Utilisation: php migrate_users.php
 * 
 * Cela va:
 * 1. Créer des utilisateurs dans la table `users` pour chaque adhérent
 * 2. Hasher les mots de passe correctement
 * 3. Lier les adhérents aux utilisateurs via user_id
 */

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\Adherent;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

echo "╔═══════════════════════════════════════════════════════════╗\n";
echo "║  Migration des adhérents existants vers JWT Auth          ║\n";
echo "╚═══════════════════════════════════════════════════════════╝\n\n";

try {
    // ══════════════════════════════════════════════════════════════
    // ÉTAPE 1: Récupérer tous les adhérents sans user_id
    // ══════════════════════════════════════════════════════════════
    $adherents = Adherent::whereNull('user_id')->get();
    
    echo "📋 Adhérents trouvés sans utilisateur: " . count($adherents) . "\n\n";
    
    if (count($adherents) === 0) {
        echo "✅ Tous les adhérents ont déjà un utilisateur associé!\n";
        echo "   Les comptes existants devraient fonctionner avec la connexion.\n";
        exit(0);
    }
    
    // ══════════════════════════════════════════════════════════════
    // ÉTAPE 2: Créer des utilisateurs pour chaque adhérent
    // ══════════════════════════════════════════════════════════════
    $created = 0;
    $failed = 0;
    
    foreach ($adherents as $adherent) {
        try {
            // Vérifier si l'utilisateur existe déjà avec ce email
            $user = User::where('email', $adherent->email)->first();
            
            if ($user) {
                // Utilisateur existe, il suffit de le lier
                echo "🔗 Lien adhérent (ID: {$adherent->id}) au user existant (ID: {$user->id})\n";
                $adherent->update(['user_id' => $user->id]);
                $created++;
            } else {
                // Créer un nouvel utilisateur avec mot de passe par défaut
                $defaultPassword = 'password123'; // À CHANGER À LA PREMIÈRE CONNEXION!
                
                $user = User::create([
                    'name' => $adherent->prenom . ' ' . $adherent->nom,
                    'email' => $adherent->email,
                    'password' => Hash::make($defaultPassword),
                    'role' => 'adherent',
                ]);
                
                // Lier l'adhérent au nouvel utilisateur
                $adherent->update(['user_id' => $user->id]);
                
                echo "✅ Créé user (ID: {$user->id}) pour adhérent ID: {$adherent->id}\n";
                echo "   Email: {$user->email}\n";
                echo "   ⚠️  Mot de passe temporaire: {$defaultPassword}\n\n";
                
                $created++;
            }
        } catch (\Exception $e) {
            echo "❌ Erreur pour adhérent ID {$adherent->id}: {$e->getMessage()}\n";
            $failed++;
        }
    }
    
    // ══════════════════════════════════════════════════════════════
    // ÉTAPE 3: Créer des comptes de test
    // ══════════════════════════════════════════════════════════════
    echo "\n╔═══════════════════════════════════════════════════════════╗\n";
    echo "║  Création des comptes de test                             ║\n";
    echo "╚═══════════════════════════════════════════════════════════╝\n\n";
    
    $testUsers = [
        [
            'email' => 'test@mamutuelle.bf',
            'name' => 'Test Utilisateur',
            'password' => 'test123',
            'role' => 'adherent',
        ],
        [
            'email' => 'admin@mamutuelle.bf',
            'name' => 'Admin MaMutuelle',
            'password' => 'admin123',
            'role' => 'admin',
        ],
        [
            'email' => 'agent@mamutuelle.bf',
            'name' => 'Agent MaMutuelle',
            'password' => 'agent123',
            'role' => 'agent',
        ],
    ];
    
    foreach ($testUsers as $testUser) {
        $existingUser = User::where('email', $testUser['email'])->first();
        
        if ($existingUser) {
            echo "⏭️  Compte existant: {$testUser['email']} (ID: {$existingUser->id})\n";
        } else {
            User::create([
                'name' => $testUser['name'],
                'email' => $testUser['email'],
                'password' => Hash::make($testUser['password']),
                'role' => $testUser['role'],
            ]);
            
            echo "✅ Créé: {$testUser['email']}\n";
            echo "   Mot de passe: {$testUser['password']}\n";
        }
    }
    
    // ══════════════════════════════════════════════════════════════
    // RÉSUMÉ
    // ══════════════════════════════════════════════════════════════
    echo "\n╔═══════════════════════════════════════════════════════════╗\n";
    echo "║  ✅ Migration terminée!                                   ║\n";
    echo "╚═══════════════════════════════════════════════════════════╝\n\n";
    
    echo "📊 Résumé:\n";
    echo "   • Utilisateurs créés/liés: $created\n";
    echo "   • Erreurs: $failed\n";
    echo "   • Total dans la BDD: " . User::count() . " users\n\n";
    
    echo "🔐 Comptes de test disponibles:\n";
    echo "   1. Email: test@mamutuelle.bf\n";
    echo "      Mot de passe: test123\n";
    echo "      Rôle: Adhérent\n\n";
    echo "   2. Email: admin@mamutuelle.bf\n";
    echo "      Mot de passe: admin123\n";
    echo "      Rôle: Admin\n\n";
    echo "   3. Email: agent@mamutuelle.bf\n";
    echo "      Mot de passe: agent123\n";
    echo "      Rôle: Agent\n\n";
    
    echo "✨ Vous pouvez maintenant vous connecter avec ces comptes!\n";
    echo "⚠️  IMPORTANT: Changez les mots de passe en production!\n";

} catch (\Exception $e) {
    echo "❌ Erreur générale: {$e->getMessage()}\n";
    exit(1);
}
