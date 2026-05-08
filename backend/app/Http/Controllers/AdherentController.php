<?php

namespace App\Http\Controllers;

use App\Models\Adherent;
use App\Models\AyantDroit;
use Illuminate\Http\Request;

class AdherentController extends Controller
{
    public function index()
    {
        return response()->json(Adherent::with(['cotisations', 'prets', 'sinistres', 'ayantsDroit'])->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string',
            'prenom' => 'required|string',
            'email' => 'required|email|unique:adherents',
            'telephone' => 'required|string',
            'numero_adherent' => 'required|unique:adherents',
            'date_inscription' => 'required|date',
        ]);

        $adherent = Adherent::create($validated);
        return response()->json($adherent, 201);
    }

    public function show($id)
    {
        $adherent = Adherent::with(['cotisations', 'prets', 'sinistres', 'ayantsDroit'])->find($id);
        if (!$adherent) {
            return response()->json(['error' => 'Adhérent non trouvé'], 404);
        }
        return response()->json($adherent);
    }

    public function update(Request $request, $id)
    {
        $adherent = Adherent::find($id);
        if (!$adherent) {
            return response()->json(['error' => 'Adhérent non trouvé'], 404);
        }

        $validated = $request->validate([
            'nom' => 'string',
            'prenom' => 'string',
            'email' => 'email|unique:adherents,email,' . $id,
            'telephone' => 'string',
            'statut' => 'in:actif,suspendu,retraite',
        ]);

        $adherent->update($validated);
        return response()->json($adherent);
    }

    public function destroy($id)
    {
        $adherent = Adherent::find($id);
        if (!$adherent) {
            return response()->json(['error' => 'Adhérent non trouvé'], 404);
        }
        $adherent->delete();
        return response()->json(['message' => 'Adhérent supprimé']);
    }

    // ── Ayants droit ──────────────────────────────────────────────
    public function getAyantsDroit($adherent_id)
    {
        $adherent = Adherent::find($adherent_id);
        if (!$adherent) {
            return response()->json(['error' => 'Adhérent non trouvé'], 404);
        }
        return response()->json($adherent->ayantsDroit);
    }

    public function storeAyantDroit(Request $request, $adherent_id)
    {
        $adherent = Adherent::find($adherent_id);
        if (!$adherent) {
            return response()->json(['error' => 'Adhérent non trouvé'], 404);
        }

        $validated = $request->validate([
            'nom' => 'required|string',
            'prenom' => 'required|string',
            'relation' => 'required|string|in:conjoint,enfant,parent,autre',
            'date_naissance' => 'nullable|date',
        ]);

        $ayantDroit = $adherent->ayantsDroit()->create($validated);
        return response()->json($ayantDroit, 201);
    }

    public function updateAyantDroit(Request $request, $adherent_id, $id)
    {
        $adherent = Adherent::find($adherent_id);
        if (!$adherent) {
            return response()->json(['error' => 'Adhérent non trouvé'], 404);
        }

        $ayantDroit = $adherent->ayantsDroit()->find($id);
        if (!$ayantDroit) {
            return response()->json(['error' => 'Ayant droit non trouvé'], 404);
        }

        $validated = $request->validate([
            'nom' => 'string',
            'prenom' => 'string',
            'relation' => 'string|in:conjoint,enfant,parent,autre',
            'date_naissance' => 'nullable|date',
        ]);

        $ayantDroit->update($validated);
        return response()->json($ayantDroit);
    }

    public function destroyAyantDroit($adherent_id, $id)
    {
        $adherent = Adherent::find($adherent_id);
        if (!$adherent) {
            return response()->json(['error' => 'Adhérent non trouvé'], 404);
        }

        $ayantDroit = $adherent->ayantsDroit()->find($id);
        if (!$ayantDroit) {
            return response()->json(['error' => 'Ayant droit non trouvé'], 404);
        }

        $ayantDroit->delete();
        return response()->json(['message' => 'Ayant droit supprimé']);
    }
}
