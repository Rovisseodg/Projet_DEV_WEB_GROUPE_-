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

    public function export(Request $request)
    {
        $format = $request->query('format', 'csv');
        $sinistres = Sinistre::with('adherent')->get();

        $data = [];
        $data[] = ['ID', 'Adhérent', 'Type', 'Description', 'Montant Réclamé', 'Statut', 'Date Déclaration'];

        foreach ($sinistres as $sinistre) {
            $data[] = [
                $sinistre->id,
                $sinistre->adherent ? $sinistre->adherent->nom . ' ' . $sinistre->adherent->prenom : '',
                $sinistre->type,
                $sinistre->description,
                $sinistre->montant_reclame,
                $sinistre->statut,
                $sinistre->date_declaration ? $sinistre->date_declaration->format('Y-m-d') : ''
            ];
        }

        return $this->generateExport($data, 'sinistres', $format);
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
