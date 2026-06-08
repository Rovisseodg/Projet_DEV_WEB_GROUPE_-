<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CorsMiddleware
{
    protected $allowedOrigins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:8000',
        'https://mutuelle-frontend.onrender.com',
        'https://mamutuelle-api.onrender.com',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $origin = $request->header('Origin', '');

        // Check if origin is allowed
        if (!in_array($origin, $this->allowedOrigins, true)) {
            // Still allow OPTIONS requests without CORS headers for local development
            if ($request->isMethod('OPTIONS')) {
                return response('', 200);
            }
            return $next($request);
        }

        // Handle preflight requests
        if ($request->isMethod('OPTIONS')) {
            return response('', 200)
                ->header('Access-Control-Allow-Origin', $origin)
                ->header('Access-Control-Allow-Credentials', 'true')
                ->header('Access-Control-Max-Age', '86400')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD')
                ->header('Access-Control-Allow-Headers', $request->header('Access-Control-Request-Headers', 'Content-Type, Authorization'));
        }

        // Process the request
        $response = $next($request);

        // Add CORS headers to response
        return $response
            ->header('Access-Control-Allow-Origin', $origin)
            ->header('Access-Control-Allow-Credentials', 'true')
            ->header('Access-Control-Expose-Headers', 'Content-Length, Content-Range');
    }
}

