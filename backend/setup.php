<?php
// PostgreSQL configuration
$host = getenv('DB_HOST') ?: '127.0.0.1';
$port = getenv('DB_PORT') ?: 5432;
$database = getenv('DB_DATABASE') ?: 'mamutuelle';
$username = getenv('DB_USERNAME') ?: 'postgres';
$password = getenv('DB_PASSWORD') ?: '';

$dsn = "pgsql:host=$host;port=$port;dbname=$database";

try {
    $db = new PDO($dsn, $username, $password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $sql = file_get_contents(__DIR__ . '/database/schema.sql');
    
    // Split and execute statements separately for PostgreSQL
    $statements = array_filter(array_map('trim', explode(';', $sql)));
    foreach ($statements as $statement) {
        if (!empty($statement)) {
            $db->exec($statement);
        }
    }
    
    echo "✓ Tables créées avec succès!\n";
    echo "✓ Schéma PostgreSQL appliqué\n";
    echo "✓ Données d'initialisation insérées\n";
} catch (PDOException $e) {
    echo "✗ Erreur: " . $e->getMessage() . "\n";
    exit(1);
}
