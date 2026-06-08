<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Adherent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class MigrationController extends Controller
{
    /**
     * POST /api/migrate-users
     * Migrer les adhérents existants vers le système JWT
     * Crée des utilisateurs et lie les adhérents
     * 
     * Sécurité: Vérifier le header X-Migration-Secret
     */
    public function migrateUsers(Request $request)
    {
        // Vérification simple: requérir un token secret
        $secret = $request->header('X-Migration-Secret');
        $expectedSecret = env('MIGRATION_SECRET', 'mamutuelle-migration-2024');
        
        if ($secret !== $expectedSecret) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Header X-Migration-Secret invalide'
            ], 401);
        }
        
        try {
            $output = [];
            
            // ÉTAPE 1: Récupérer les adhérents sans user_id
            $adherents = Adherent::whereNull('user_id')->get();
            $output[] = "📋 Adhérents trouvés: " . count($adherents);
            
            $created = 0;
            
            // ÉTAPE 2: Créer les utilisateurs
            foreach ($adherents as $adherent) {
                $user = User::where('email', $adherent->email)->first();
                
                if (!$user) {
                    $user = User::create([
                        'name' => trim($adherent->prenom . ' ' . $adherent->nom),
                        'email' => $adherent->email,
                        'password' => Hash::make('password123'),
                        'role' => 'adherent',
                    ]);
                }
                
                $adherent->update(['user_id' => $user->id]);
                $created++;
                $output[] = "✅ ID {$adherent->id} -> User {$user->id}";
            }
            
            // ÉTAPE 3: Créer les comptes de test
            $testAccounts = [
                ['email' => 'test@mamutuelle.bf', 'name' => 'Test User', 'pwd' => 'test123', 'role' => 'adherent'],
                ['email' => 'admin@mamutuelle.bf', 'name' => 'Admin', 'pwd' => 'admin123', 'role' => 'admin'],
                ['email' => 'agent@mamutuelle.bf', 'name' => 'Agent', 'pwd' => 'agent123', 'role' => 'agent'],
            ];
            
            $testCreated = 0;
            foreach ($testAccounts as $account) {
                if (!User::where('email', $account['email'])->exists()) {
                    User::create([
                        'name' => $account['name'],
                        'email' => $account['email'],
                        'password' => Hash::make($account['pwd']),
                        'role' => $account['role'],
                    ]);
                    $testCreated++;
                }
            }
            
            $output[] = "🧪 Comptes test: $testCreated créés";
            $output[] = "👥 Total users: " . User::count();
            
            return response()->json([
                'success' => true,
                'message' => 'Migration réussie',
                'adhérents_migré' => $created,
                'test_accounts' => $testCreated,
                'total_users' => User::count(),
                'log' => $output,
                'test_credentials' => [
                    ['email' => 'test@mamutuelle.bf', 'password' => 'test123'],
                    ['email' => 'admin@mamutuelle.bf', 'password' => 'admin123'],
                    ['email' => 'agent@mamutuelle.bf', 'password' => 'agent123'],
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Migration failed',
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ], 500);
        }
    }
}
