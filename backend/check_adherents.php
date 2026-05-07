<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Adherents:\n";
$adherents = DB::table('adherents')->get();
foreach($adherents as $adh) {
    echo "ID: {$adh->id}, Numero: {$adh->numero_adherent}, Nom: {$adh->nom}\n";
}

echo "\nTest récupération IDs:\n";
$adhId1 = DB::table('adherents')->where('numero_adherent', 'ADH001')->value('id');
$adhId2 = DB::table('adherents')->where('numero_adherent', 'ADH002')->value('id');
echo "ADH001 ID: " . ($adhId1 ?: 'NULL') . "\n";
echo "ADH002 ID: " . ($adhId2 ?: 'NULL') . "\n";
?>