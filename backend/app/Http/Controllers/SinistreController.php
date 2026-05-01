<?php

namespace App\Http\Controllers;

use App\Models\Sinistre;
use Illuminate\Http\Request;

class SinistreController extends Controller
{
    public function index()
    {
        return response()->json(Sinistre::with(['adherent', 'prestations'])->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'adherent_id' => 'required|exists:adherents,id',
            'description' => 'required|string',
            'date_sinistre' => 'required|date',
            'type_sinistre' => 'required|in:maladie,accident,décès,hospitalisation,autre',
        ]);

        $sinistre = Sinistre::create($validated);
        return response()->json($sinistre, 201);
    }

    public function show($id)
    {
        $sinistre = Sinistre::with(['adherent', 'prestations'])->find($id);
        if (!$sinistre) {
            return response()->json(['error' => 'Sinistre non trouvé'], 404);
        }
        return response()->json($sinistre);
    }

    public function update(Request $request, $id)
    {
        $sinistre = Sinistre::find($id);
        if (!$sinistre) {
            return response()->json(['error' => 'Sinistre non trouvé'], 404);
        }

        $validated = $request->validate([
            'statut' => 'in:déclaré,en cours,approuvé,rejeté,remboursé',
            'montant_reclamation' => 'numeric',
            'montant_remboursement' => 'numeric',
        ]);

        $sinistre->update($validated);
        return response()->json($sinistre);
    }

    public function destroy($id)
    {
        $sinistre = Sinistre::find($id);
        if (!$sinistre) {
            return response()->json(['error' => 'Sinistre non trouvé'], 404);
        }
        $sinistre->delete();
        return response()->json(['message' => 'Sinistre supprimé']);
    }
}
