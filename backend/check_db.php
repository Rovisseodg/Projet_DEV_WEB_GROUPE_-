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
    
    echo "✓ Connexion PostgreSQL réussie\n";
    echo "Date d'aujourd'hui: " . date('Y-m-d') . "\n\n";

    $stmt = $pdo->query('SELECT * FROM cotisations ORDER BY id DESC LIMIT 10');
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "Cotisations en BD:\n";
    foreach ($rows as $row) {
        echo "ID: " . $row['id'] . ", Adhérent: " . $row['adherent_id'] . ", Date: " . $row['date_echeance'] . ", Statut: " . $row['statut'] . "\n";
    }
} catch (PDOException $e) {
    echo "✗ Erreur de connexion: " . $e->getMessage() . "\n";
    exit(1);
}
