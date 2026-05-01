<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdherentController;
use App\Http\Controllers\CotisationController;
use App\Http\Controllers\PretController;
use App\Http\Controllers\SinistreController;
use App\Http\Controllers\AlerteController;

Route::get('/', function () {
    return response()->json(['message' => 'MaMutuelle API', 'version' => '1.0']);
});

// Auth Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/me', [AuthController::class, 'me'])->middleware('auth:api');

// Resource Routes
Route::apiResource('adherents', AdherentController::class);
Route::apiResource('cotisations', CotisationController::class);
Route::apiResource('prets', PretController::class);
Route::apiResource('sinistres', SinistreController::class);

// Alertes Routes
Route::get('/alertes', [AlerteController::class, 'index']);
Route::get('/alertes/statistics', [AlerteController::class, 'statistics']);

// Stats
Route::get('/stats', function () {
    return response()->json([
        'adherents_total' => \App\Models\Adherent::count(),
        'cotisations_payees' => \App\Models\Cotisation::where('statut', 'payée')->count(),
        'prets_actifs' => \App\Models\Pret::where('statut', 'approuvé')->count(),
        'sinistres_en_cours' => \App\Models\Sinistre::where('statut', 'en cours')->count(),
    ]);
});
