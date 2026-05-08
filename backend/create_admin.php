<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Créer un utilisateur admin
$user = User::firstOrCreate(
    ['email' => 'admin@test.com'],
    [
        'name' => 'Admin',
        'password' => Hash::make('password'),
        'role' => 'admin'
    ]
);

echo "User ID: " . $user->id . "\n";

// Générer un token JWT
$token = auth()->login($user);
echo "Token: " . $token . "\n";