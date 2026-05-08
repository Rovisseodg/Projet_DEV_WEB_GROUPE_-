<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdherentController;
use App\Http\Controllers\CotisationController;
use App\Http\Controllers\PretController;
use App\Http\Controllers\SinistreController;
use App\Http\Controllers\AlerteController;
use App\Http\Controllers\AdherentDashboardController;

/* ====================================================================
 * ROUTE PUBLIQUE — Santé de l'API
 * ==================================================================== */
Route::get('/', function () {
    return response()->json([
        'message' => 'MaMutuelle API',
        'version' => '1.0',
        'status'  => 'running'
    ]);
});


/* ====================================================================
 * AUTHENTIFICATION — Routes publiques
 * ==================================================================== */
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
Route::post('/refresh',  [AuthController::class, 'refresh']);

/* ====================================================================
 * ROUTES PROTÉGÉES (JWT requis)
 * ==================================================================== */
Route::middleware('auth:api')->group(function () {

    // ── Auth ──────────────────────────────────────────────────────────
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    /* ==================================================================
     * TABLEAU DE BORD ADHÉRENT — réservé au rôle "adherent"
     * Middleware CheckAdherent : vérifie role === 'adherent'
     *                            + existence du profil adherent lié
     * ================================================================== */
    Route::middleware('App\Http\Middleware\CheckAdherent')->group(function () {

        // Vue d'ensemble personnalisée (stats, alertes, prochaines échéances)
        Route::get('/mon-tableau-de-bord', [AdherentDashboardController::class, 'overview']);

        // Profil
        Route::get('/mon-profil',  [AdherentDashboardController::class, 'profil']);
        Route::put('/mon-profil',  [AdherentDashboardController::class, 'updateProfil']);

        // Mot de passe
        Route::put('/mon-mot-de-passe', [AdherentDashboardController::class, 'updatePassword']);

        // Cotisations (lecture seule — l'admin crée, l'adhérent consulte)
        Route::get('/mes-cotisations', [AdherentDashboardController::class, 'cotisations']);

        // Prêts
        Route::get('/mes-prets',                          [AdherentDashboardController::class, 'prets']);
        Route::post('/mes-prets',                         [AdherentDashboardController::class, 'demanderPret']);
        Route::get('/mes-prets/{id}/amortissement',       [AdherentDashboardController::class, 'amortissement']);

        // Sinistres
        Route::get('/mes-sinistres',   [AdherentDashboardController::class, 'sinistres']);
        Route::post('/mes-sinistres',  [AdherentDashboardController::class, 'declarerSinistre']);

        // Ayants droit
        Route::get('/mes-ayants-droit',         [AdherentDashboardController::class, 'ayantsDroit']);
        Route::post('/mes-ayants-droit',        [AdherentDashboardController::class, 'ajouterAyantDroit']);
        Route::put('/mes-ayants-droit/{id}',    [AdherentDashboardController::class, 'modifierAyantDroit']);
        Route::delete('/mes-ayants-droit/{id}', [AdherentDashboardController::class, 'supprimerAyantDroit']);
    });

    /* ==================================================================
     * TABLEAU DE BORD ADMIN / AGENT
     * Middleware CheckAdminOrAgent
     * ================================================================== */
    Route::middleware('App\Http\Middleware\CheckAdminOrAgent')->group(function () {

        // CRUD complet adhérents
        Route::apiResource('adherents',   AdherentController::class);

        // Ayants droit d'un adhérent (routes imbriquées)
        Route::get('/adherents/{adherent_id}/ayants-droit',         [AdherentController::class, 'getAyantsDroit']);
        Route::post('/adherents/{adherent_id}/ayants-droit',        [AdherentController::class, 'storeAyantDroit']);
        Route::put('/adherents/{adherent_id}/ayants-droit/{id}',    [AdherentController::class, 'updateAyantDroit']);
        Route::delete('/adherents/{adherent_id}/ayants-droit/{id}', [AdherentController::class, 'destroyAyantDroit']);

        // CRUD complet cotisations
        Route::apiResource('cotisations', CotisationController::class);

        // CRUD complet prêts
        Route::apiResource('prets',       PretController::class);

        // CRUD complet sinistres
        Route::apiResource('sinistres',   SinistreController::class);

        // Alertes
        Route::get('/alertes',            [AlerteController::class, 'index']);
        Route::get('/alertes/statistics', [AlerteController::class, 'statistics']);

        // Statistiques globales
        Route::get('/stats', function () {
            return response()->json([
                'adherents_total'    => \App\Models\Adherent::count(),
                'cotisations_payees' => \App\Models\Cotisation::where('statut', 'payée')->count(),
                'prets_actifs'       => \App\Models\Pret::where('statut', 'approuvé')->count(),
                'sinistres_en_cours' => \App\Models\Sinistre::where('statut', 'en cours')->count(),
            ]);
        });

        // Exports
        Route::get('/adherents/export',  [AdherentController::class, 'export']);
        Route::get('/cotisations/export', [CotisationController::class, 'export']);
        Route::get('/prets/export',       [PretController::class, 'export']);
        Route::get('/sinistres/export',   [SinistreController::class, 'export']);
    });

    

    /* ==================================================================
     * ADMIN UNIQUEMENT
     * ================================================================== */
    Route::middleware('App\Http\Middleware\CheckRole:admin')->group(function () {
        Route::post('/register-admin', [AuthController::class, 'registerAdmin']);
    });
});
