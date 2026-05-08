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

    public function export(Request $request)
    {
        $format = $request->query('format', 'csv');
        $cotisations = Cotisation::with('adherent')->get();

        $data = [];
        $data[] = ['ID', 'Adhérent', 'Montant', 'Échéance', 'Statut', 'Date Paiement', 'Mode Paiement'];

        foreach ($cotisations as $cotisation) {
            $data[] = [
                $cotisation->id,
                $cotisation->adherent ? $cotisation->adherent->nom . ' ' . $cotisation->adherent->prenom : '',
                $cotisation->montant,
                $cotisation->date_echeance ? $cotisation->date_echeance->format('Y-m-d') : '',
                $cotisation->statut,
                $cotisation->date_paiement ? $cotisation->date_paiement->format('Y-m-d') : '',
                $cotisation->mode_paiement
            ];
        }

        return $this->generateExport($data, 'cotisations', $format);
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
