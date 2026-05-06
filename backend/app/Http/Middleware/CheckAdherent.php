<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckAdherent
{
    /**
     * Vérifie que l'utilisateur connecté est bien un adhérent.
     * Bloque les admins et agents — ils ont leurs propres routes.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth('api')->user();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        if ($user->role !== 'adherent') {
            return response()->json([
                'error' => 'Accès réservé aux adhérents. Utilisez le tableau de bord administrateur.'
            ], 403);
        }

        // Vérifier qu'un profil adhérent existe bien pour ce user
        if (!$user->adherent) {
            return response()->json([
                'error'   => 'Aucun profil adhérent lié à ce compte.',
                'details' => 'Contactez un administrateur pour lier votre compte à un profil adhérent.'
            ], 404);
        }

        return $next($request);
    }
}
