<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CorsMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $allowedOrigins = [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:8000',
            'https://mutuelle-frontend.onrender.com',
            'https://mamutuelle-api.onrender.com',
        ];

        $origin = $request->header('Origin');

        // Always respond to OPTIONS with CORS headers if origin is allowed
        if ($request->isMethod('OPTIONS')) {
            if (in_array($origin, $allowedOrigins)) {
                return response()
                    ->setStatusCode(200)
                    ->header('Access-Control-Allow-Origin', $origin)
                    ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
                    ->header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, X-Requested-With')
                    ->header('Access-Control-Allow-Credentials', 'true')
                    ->header('Access-Control-Max-Age', '3600');
            }
            return response()->setStatusCode(403);
        }

        $response = $next($request);

        // Add CORS headers to all responses if origin is allowed
        if (in_array($origin, $allowedOrigins)) {
            $response
                ->header('Access-Control-Allow-Origin', $origin)
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
                ->header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, X-Requested-With')
                ->header('Access-Control-Allow-Credentials', 'true');
        }

        return $response;
    }
}

