# 🔒 Configuration Sécurité - MaMutuelle

## CORS Configuration

Créer le fichier `config/cors.php` :

```php
<?php

return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3000', 'http://127.0.0.1:3000'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

## Rate Limiting

Ajouter dans `routes/api.php` :

```php
Route::middleware('throttle:60,1')->group(function () {
    // Routes API existantes
});
```

## Validation Avancée

Exemple de validation renforcée dans les contrôleurs :

```php
$validated = $request->validate([
    'email' => 'required|email:rfc,dns|unique:users,email',
    'password' => 'required|string|min:8|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/',
    'telephone' => 'nullable|string|regex:/^[\+]?[1-9][\d]{0,15}$/',
]);
```

## Logs de Sécurité

Configuration dans `config/logging.php` :

```php
'security' => [
    'driver' => 'single',
    'path' => storage_path('logs/security.log'),
    'level' => 'info',
],
```

## Middleware de Sécurité

Créer `app/Http/Middleware/SecurityHeaders.php` :

```php
<?php

namespace App\Http\Middleware;

use Closure;

class SecurityHeaders
{
    public function handle($request, Closure $next)
    {
        $response = $next($request);

        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        return $response;
    }
}
```

## Installation

```bash
composer require fruitcake/laravel-cors
composer require laravel/telescope # Pour le debugging en dev
```

Enregistrer le middleware dans `app/Http/Kernel.php`.