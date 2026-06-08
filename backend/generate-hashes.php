<?php
/**
 * Helper Script: Générer des hashes bcrypt valides
 * Utilisation: php generate-hashes.php
 */

require 'vendor/autoload.php';

$passwords = [
    'password123' => 'DEFAULT_PASSWORD',
    'SecureAdmin2024!' => 'ADMIN_ONLY',
    'AgentAccess2024!' => 'AGENT_ONLY',
];

echo "\n╔════════════════════════════════════════════════════════════════╗\n";
echo "║        GÉNÉRATEUR DE HASHES BCRYPT VALIDES                     ║\n";
echo "╚════════════════════════════════════════════════════════════════╝\n\n";

$sql_commands = [];

foreach ($passwords as $password => $label) {
    $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    
    echo "💾 {$label}\n";
    echo "   Mot de passe: {$password}\n";
    echo "   Hash bcrypt: {$hash}\n";
    echo "   Vérification: " . (password_verify($password, $hash) ? '✓ OK' : '✗ FAILED') . "\n";
    echo "\n";
    
    if ($label === 'DEFAULT_PASSWORD') {
        $sql_commands[] = "UPDATE users SET password = '{$hash}' WHERE role IN ('admin', 'agent', 'adherent');";
    } elseif ($label === 'ADMIN_ONLY') {
        $sql_commands[] = "UPDATE users SET password = '{$hash}' WHERE role = 'admin';";
    } elseif ($label === 'AGENT_ONLY') {
        $sql_commands[] = "UPDATE users SET password = '{$hash}' WHERE role = 'agent';";
    }
}

echo "╔════════════════════════════════════════════════════════════════╗\n";
echo "║        COMMANDES SQL À EXÉCUTER                                ║\n";
echo "╚════════════════════════════════════════════════════════════════╝\n\n";

echo "BEGIN TRANSACTION;\n";
foreach ($sql_commands as $cmd) {
    echo $cmd . "\n";
}
echo "COMMIT;\n\n";

// Alternative: Générer le SQL dans un fichier
$output_file = 'generated-bcrypt-fix.sql';
$sql_content = "BEGIN TRANSACTION;\n" . implode("\n", $sql_commands) . "\nCOMMIT;\n";
file_put_contents($output_file, $sql_content);

echo "✓ Fichier SQL généré: {$output_file}\n\n";

// Copier dans le dossier database/
$dest = __DIR__ . '/../database/generated-bcrypt-fix.sql';
if (copy($output_file, $dest)) {
    echo "✓ Fichier copié vers: ../database/\n\n";
} else {
    echo "✗ Erreur lors de la copie du fichier\n";
}

echo "📝 PROCHAINES ÉTAPES:\n";
echo "   1. Exécuter le SQL via pgAdmin ou psql\n";
echo "   2. Tester la connexion avec admin@mamutuelle.bf / password123\n";
echo "   3. Supprimer ce script après utilisation (sécurité)\n\n";
?>
