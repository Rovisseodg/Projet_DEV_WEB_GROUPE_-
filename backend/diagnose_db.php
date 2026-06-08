<?php
/**
 * Script de diagnostic de la base de données
 * Vérifie l'état de la migration des utilisateurs
 */

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "╔══════════════════════════════════════════════════════════╗\n";
echo "║  📊 DIAGNOSTIC - État de la Migration JWT                ║\n";
echo "╚══════════════════════════════════════════════════════════╝\n\n";

// 1. Comptes dans la table users
echo "1️⃣  TABLE USERS (Système JWT)\n";
echo "─────────────────────────────────\n";
$users = DB::table('users')->get();
echo "Total: " . count($users) . " utilisateurs\n";
foreach ($users as $user) {
    echo "   • {$user->email} (role: {$user->role})\n";
}

// 2. Adhérents sans user_id
echo "\n2️⃣  TABLE ADHERENTS (Adhérents sans user_id)\n";
echo "──────────────────────────────────────────────\n";
$adherents_no_user = DB::table('adherents')->whereNull('user_id')->get();
echo "Total: " . count($adherents_no_user) . " adhérents non migrés\n";
foreach ($adherents_no_user as $adh) {
    echo "   • {$adh->email} - {$adh->nom}\n";
}

// 3. Adhérents avec user_id
echo "\n3️⃣  TABLE ADHERENTS (Adhérents avec user_id)\n";
echo "─────────────────────────────────────────────\n";
$adherents_with_user = DB::table('adherents')->whereNotNull('user_id')->get();
echo "Total: " . count($adherents_with_user) . " adhérents migrés\n";
foreach ($adherents_with_user as $adh) {
    echo "   • {$adh->email} - {$adh->nom} (user_id: {$adh->user_id})\n";
}

// 4. Tester la connexion
echo "\n4️⃣  TEST DE CONNEXION\n";
echo "────────────────────\n";
if (count($users) > 0) {
    $test_user = $users[0];
    echo "Test avec: {$test_user->email}\n";
    echo "Hash: " . substr($test_user->password, 0, 20) . "...\n";
    echo "Valid bcrypt? " . (preg_match('/^\$2[aby]\$/', $test_user->password) ? '✓ OUI' : '✗ NON') . "\n";
}

echo "\n" . str_repeat('═', 58) . "\n";
echo "✅ RECOMMANDATIONS:\n";
echo str_repeat('═', 58) . "\n";

if (count($adherents_no_user) > 0) {
    echo "⚠️  IL Y A " . count($adherents_no_user) . " ADHÉRENTS NON MIGRÉS\n";
    echo "   ➜ Exécutez: php migrate_users.php\n";
}

if (count($users) === 0) {
    echo "❌ AUCUN UTILISATEUR DANS LA TABLE USERS!\n";
    echo "   ➜ Créez au moins un admin: php create_admin.php\n";
}

echo "\n";
?>
