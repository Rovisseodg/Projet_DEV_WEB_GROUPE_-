<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'role' => 'in:admin,agent,adherent',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $user = User::create($validated);

        return response()->json([
            'message' => 'Utilisateur créé',
            'user' => $user,
            'token' => $this->generateToken($user)
        ], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $validated['email'])->first();
        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json(['error' => 'Identifiants invalides'], 401);
        }

        return response()->json([
            'message' => 'Connexion réussie',
            'user' => $user,
            'token' => $this->generateToken($user)
        ]);
    }

    public function me(Request $request)
    {
        $token = $request->bearerToken();
        if (!$token) {
            return response()->json(['error' => 'Token manquant'], 401);
        }

        // Pour dev: simple validation, remplace par JWT réel en prod
        $user = User::find($request->user_id ?? 1);
        return response()->json($user);
    }

    private function generateToken($user)
    {
        // Token simple pour dev (remplacer par JWT réel)
        return base64_encode(json_encode([
            'id' => $user->id,
            'email' => $user->email,
            'role' => $user->role,
            'timestamp' => time()
        ]));
    }
}
