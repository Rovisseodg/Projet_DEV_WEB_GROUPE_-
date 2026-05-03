<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckAdminOrAgent
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth('api')->user();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        if (!in_array($user->role, ['admin', 'agent'])) {
            return response()->json(['error' => 'Accès réservé aux administrateurs et agents'], 403);
        }

        return $next($request);
    }
}