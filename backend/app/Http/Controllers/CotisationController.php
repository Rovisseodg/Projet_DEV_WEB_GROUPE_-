<?php

namespace App\Http\Controllers;

use App\Models\Cotisation;
use Illuminate\Http\Request;

class CotisationController extends Controller
{
    public function index()
    {
        return response()->json(Cotisation::with('adherent')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'adherent_id' => 'required|exists:adherents,id',
            'montant' => 'required|numeric',
            'date_echeance' => 'required|date',
            'mode_paiement' => 'in:virement,cheque,especes,carte',
        ]);

        $cotisation = Cotisation::create($validated);
        return response()->json($cotisation, 201);
    }

    public function show($id)
    {
        $cotisation = Cotisation::with('adherent')->find($id);
        if (!$cotisation) {
            return response()->json(['error' => 'Cotisation non trouvée'], 404);
        }
        return response()->json($cotisation);
    }

    public function update(Request $request, $id)
    {
        $cotisation = Cotisation::find($id);
        if (!$cotisation) {
            return response()->json(['error' => 'Cotisation non trouvée'], 404);
        }

        $validated = $request->validate([
            'statut' => 'in:en attente,payée,en retard,annulée',
            'date_paiement' => 'date',
            'reference_paiement' => 'string',
        ]);

        $cotisation->update($validated);
        return response()->json($cotisation);
    }

    public function destroy($id)
    {
        $cotisation = Cotisation::find($id);
        if (!$cotisation) {
            return response()->json(['error' => 'Cotisation non trouvée'], 404);
        }
        $cotisation->delete();
        return response()->json(['message' => 'Cotisation supprimée']);
    }
}
