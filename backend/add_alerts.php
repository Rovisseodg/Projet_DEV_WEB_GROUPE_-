<?php

// PostgreSQL configuration
$host = getenv('DB_HOST') ?: '127.0.0.1';
$port = getenv('DB_PORT') ?: 5432;
$database = getenv('DB_DATABASE') ?: 'mamutuelle';
$username = getenv('DB_USERNAME') ?: 'postgres';
$password = getenv('DB_PASSWORD') ?: '';

$dsn = "pgsql:host=$host;port=$port;dbname=$database";

try {
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Ajouter des cotisations en retard (date passée, statut != payée)
    $yesterday = date('Y-m-d', strtotime('-10 days'));
    $stmt = $pdo->prepare('INSERT INTO cotisations (adherent_id, montant, date_echeance, statut, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())');

    // Adhérent 1 - cotisation très en retard
    $stmt->execute([1, 75000, $yesterday, 'en attente']);

    // Adhérent 2 - cotisation modérément en retard
    $dayBefore = date('Y-m-d', strtotime('-5 days'));
    $stmt->execute([2, 50000, $dayBefore, 'en attente']);

    // Adhérent 3 - cotisation légèrement en retard
    $yesterday2 = date('Y-m-d', strtotime('-2 days'));
    $stmt->execute([3, 60000, $yesterday2, 'en attente']);

    echo "✓ Cotisations en retard ajoutées!\n";
    echo "- Adhérent 1: 75,000 FCFA (10 jours en retard)\n";
    echo "- Adhérent 2: 50,000 FCFA (5 jours en retard)\n";
    echo "- Adhérent 3: 60,000 FCFA (2 jours en retard)\n";
} catch (PDOException $e) {
    echo "✗ Erreur: " . $e->getMessage() . "\n";
    exit(1);
}
