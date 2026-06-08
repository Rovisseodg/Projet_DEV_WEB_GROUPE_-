<?php
/**
 * Script de diagnostic pour vérifier les problèmes de connexion
 * Vérifie si les hashes bcrypt existants sont valides
 */

require 'vendor/autoload.php';

$passwords = [
    'password123',
    'password',
    'Password@123',
    '123456',
    'admin',
    'test123',
];

// Hash existant dans la BD
$hash_in_db = '$2y$12$K1kJm8F7t.RZV.LH2.dS0uEZr5xKHsxJqVlVz5QcH7K0y8qQu2EwK';

echo "=== Test de Hash Bcrypt ===\n";
echo "Hash dans la BD: {$hash_in_db}\n\n";

echo "Test des mots de passe connus:\n";
foreach ($passwords as $pwd) {
    $match = password_verify($pwd, $hash_in_db);
    $result = $match ? '✓ MATCH' : '✗ Non';
    echo "  - '$pwd': $result\n";
}

// Créer un nouveau hash valide
echo "\n=== Nouveau Hash Valide ===\n";
$password = 'password123';
$new_hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
echo "Mot de passe: {$password}\n";
echo "Nouveau hash: {$new_hash}\n";
echo "Vérification: " . (password_verify($password, $new_hash) ? 'OK' : 'FAILED') . "\n";

// SQL pour mettre à jour les mots de passe
echo "\n=== SQL à exécuter pour corriger ===\n";
echo "UPDATE users SET password = '{$new_hash}' WHERE role IN ('admin', 'agent', 'adherent');\n";
?>
