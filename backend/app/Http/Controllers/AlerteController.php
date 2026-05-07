<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use DateTime;

class AlerteController extends Controller
{
    public function index()
    {
        $today = date('Y-m-d');
        
        // Cotisations en retard (date_echeance passée et statut != payée)
        $cotisationsRetard = DB::table('cotisations')
            ->join('adherents', 'cotisations.adherent_id', '=', 'adherents.id')
            ->where('cotisations.date_echeance', '<', $today)
            ->where('cotisations.statut', '!=', 'payée')
            ->select([
                'cotisations.id',
                'cotisations.adherent_id',
                'adherents.nom',
                'adherents.prenom',
                'adherents.email',
                'adherents.telephone',
                'cotisations.montant',
                'cotisations.date_echeance',
                'cotisations.statut',
                DB::raw("'cotisation' as type"),
                DB::raw("(CURRENT_DATE - cotisations.date_echeance::date)::INTEGER as jours_retard")
            ])
            ->get();

        // Prêts arrivant à échéance ou en retard
        $pretsEcheance = DB::table('prets')
            ->join('adherents', 'prets.adherent_id', '=', 'adherents.id')
            ->whereRaw("(prets.date_debut + (prets.duree_mois || ' months')::interval) <= (CURRENT_DATE + interval '7 days')")
            ->where('prets.statut', '!=', 'remboursé')
            ->select([
                'prets.id',
                'prets.adherent_id',
                'adherents.nom',
                'adherents.prenom',
                'adherents.email',
                'adherents.telephone',
                'prets.montant',
                DB::raw("(prets.date_debut + (prets.duree_mois || ' months')::interval)::date as date_echeance"),
                'prets.statut',
                DB::raw("'pret' as type"),
                DB::raw("0 as jours_retard")
            ])
            ->get();

        $alertes = $cotisationsRetard->concat($pretsEcheance);

        return response()->json($alertes);
    }

    public function statistics()
    {
        $today = date('Y-m-d');
        
        $stats = [
            'cotisations_retard_count' => DB::table('cotisations')
                ->where('date_echeance', '<', $today)
                ->where('statut', '!=', 'payée')
                ->count(),
            'montant_en_retard' => DB::table('cotisations')
                ->where('date_echeance', '<', $today)
                ->where('statut', '!=', 'payée')
                ->sum('montant'),
            'prets_echeance_count' => DB::table('prets')
            ->whereRaw("(date_debut + (duree_mois || ' months')::interval) <= (CURRENT_DATE + interval '7 days')")
            ->where('statut', '!=', 'remboursé')
                ->count()
        ];

        return response()->json($stats);
    }
}
