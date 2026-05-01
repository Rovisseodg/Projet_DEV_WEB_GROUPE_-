<?php

$pdo = new PDO('sqlite:database/database.sqlite');
echo "Date d'aujourd'hui: " . date('Y-m-d') . "\n\n";

$stmt = $pdo->query('SELECT * FROM cotisations ORDER BY id DESC LIMIT 10');
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Cotisations en BD:\n";
foreach ($rows as $row) {
    echo "ID: " . $row['id'] . ", Adhérent: " . $row['adherent_id'] . ", Date: " . $row['date_echeance'] . ", Statut: " . $row['statut'] . "\n";
}
