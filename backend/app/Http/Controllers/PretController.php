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

    public function export(Request $request)
    {
        $format = $request->query('format', 'csv');
        $prets = Pret::with('adherent')->get();

        $data = [];
        $data[] = ['ID', 'Adhérent', 'Montant', 'Taux', 'Durée', 'Statut', 'Date Demande'];

        foreach ($prets as $pret) {
            $data[] = [
                $pret->id,
                $pret->adherent ? $pret->adherent->nom . ' ' . $pret->adherent->prenom : '',
                $pret->montant,
                $pret->taux_interet,
                $pret->duree_mois,
                $pret->statut,
                $pret->date_demande ? $pret->date_demande->format('Y-m-d') : ''
            ];
        }

        return $this->generateExport($data, 'prets', $format);
    }

    private function generateExport($data, $filename, $format)
    {
        $filename = $filename . '_' . date('Y-m-d_H-i-s');

        if ($format === 'csv') {
            $csv = '';
            foreach ($data as $row) {
                $csv .= implode(',', array_map(function($field) {
                    return '"' . str_replace('"', '""', $field) . '"';
                }, $row)) . "\n";
            }

            return response($csv)
                ->header('Content-Type', 'text/csv')
                ->header('Content-Disposition', 'attachment; filename="' . $filename . '.csv"');
        }

        if ($format === 'xlsx' || $format === 'excel') {
            $csv = '';
            foreach ($data as $row) {
                $csv .= implode("\t", $row) . "\n";
            }

            return response($csv)
                ->header('Content-Type', 'application/vnd.ms-excel')
                ->header('Content-Disposition', 'attachment; filename="' . $filename . '.xls"');
        }

        if ($format === 'pdf') {
            $pdfContent = "Export des données - " . ucfirst($filename) . "\n\n";
            foreach ($data as $row) {
                $pdfContent .= implode(' | ', $row) . "\n";
            }

            return response($pdfContent)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'attachment; filename="' . $filename . '.pdf"');
        }

        return response()->json(['error' => 'Format non supporté'], 400);
    }
}
