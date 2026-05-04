<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Sanctum retiré : le projet utilise JWT (tymon/jwt-auth)
        // $middleware->statefulApi(); ← causait l'erreur Sanctum
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
