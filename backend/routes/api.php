<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdherentController;
use App\Http\Controllers\CotisationController;
use App\Http\Controllers\PretController;
use App\Http\Controllers\SinistreController;
use App\Http\Controllers\AlerteController;

Route::get('/', function () {
    return response()->json([
        'message' => 'MaMutuelle API',
        'version' => '1.0',
        'status' => 'running'
    ]);
});

// Auth Routes (sans middleware)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/refresh', [AuthController::class, 'refresh']);

// Protected Routes (avec JWT middleware)
Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Routes réservées aux admins et agents
    Route::middleware('App\Http\Middleware\CheckAdminOrAgent')->group(function () {
        Route::apiResource('adherents', AdherentController::class);
        Route::apiResource('cotisations', CotisationController::class);
        Route::apiResource('prets', PretController::class);
        Route::apiResource('sinistres', SinistreController::class);
    });

    // Routes réservées aux admins uniquement
    Route::middleware('App\Http\Middleware\CheckRole:admin')->group(function () {
        Route::post('/register-admin', [AuthController::class, 'registerAdmin']);
    });

    // Alertes Routes (accessibles aux admins et agents)
    Route::middleware('App\Http\Middleware\CheckAdminOrAgent')->group(function () {
        Route::get('/alertes', [AlerteController::class, 'index']);
        Route::get('/alertes/statistics', [AlerteController::class, 'statistics']);
    });

    // Stats (accessibles aux admins et agents)
    Route::middleware('App\Http\Middleware\CheckAdminOrAgent')->group(function () {
        Route::get('/stats', function () {
            return response()->json([
                'adherents_total' => \App\Models\Adherent::count(),
                'cotisations_payees' => \App\Models\Cotisation::where('statut', 'payée')->count(),
                'prets_actifs' => \App\Models\Pret::where('statut', 'approuvé')->count(),
                'sinistres_en_cours' => \App\Models\Sinistre::where('statut', 'en cours')->count(),
            ]);
        });
    });
});
