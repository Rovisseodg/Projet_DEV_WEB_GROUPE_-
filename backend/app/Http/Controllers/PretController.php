<?php

namespace App\Http\Controllers;

use App\Models\Pret;
use Illuminate\Http\Request;

class PretController extends Controller
{
    public function index()
    {
        return response()->json(Pret::with(['adherent', 'remboursements'])->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'adherent_id' => 'required|exists:adherents,id',
            'montant' => 'required|numeric',
            'taux_interet' => 'numeric',
            'duree_mois' => 'required|integer',
            'date_debut' => 'required|date',
        ]);

        $pret = Pret::create($validated);
        return response()->json($pret, 201);
    }

    public function show($id)
    {
        $pret = Pret::with(['adherent', 'remboursements'])->find($id);
        if (!$pret) {
            return response()->json(['error' => 'Prêt non trouvé'], 404);
        }
        return response()->json($pret);
    }

    public function update(Request $request, $id)
    {
        $pret = Pret::find($id);
        if (!$pret) {
            return response()->json(['error' => 'Prêt non trouvé'], 404);
        }

        $validated = $request->validate([
            'statut' => 'in:en attente,approuvé,remboursé,rejeté',
            'date_fin' => 'date',
        ]);

        $pret->update($validated);
        return response()->json($pret);
    }

    public function destroy($id)
    {
        $pret = Pret::find($id);
        if (!$pret) {
            return response()->json(['error' => 'Prêt non trouvé'], 404);
        }
        $pret->delete();
        return response()->json(['message' => 'Prêt supprimé']);
    }
}
