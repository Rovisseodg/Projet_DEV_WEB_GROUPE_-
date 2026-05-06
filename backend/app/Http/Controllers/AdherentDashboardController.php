<?php

namespace App\Http\Controllers;

use App\Models\Adherent;
use App\Models\AyantDroit;
use App\Models\Pret;
use App\Models\RemboursementPret;
use App\Models\Sinistre;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AdherentDashboardController extends Controller
{
    /* ================================================================
     * HELPER — Récupère l'adhérent lié à l'utilisateur connecté
     * ================================================================ */
    private function getAdherent()
    {
        $user     = auth('api')->user();
        $adherent = Adherent::where('user_id', $user->id)->first();

        if (!$adherent) {
            abort(response()->json([
                'error' => 'Aucun profil adhérent lié à ce compte.'
            ], 404));
        }

        return $adherent;
    }

    /* ================================================================
     * VUE D'ENSEMBLE — GET /api/mon-tableau-de-bord
     * Retourne toutes les statistiques personnelles en un seul appel
     * ================================================================ */
    public function overview()
    {
        $adherent = $this->getAdherent();
        $today    = now()->toDateString();

        // ── Cotisations ──
        $cotisations       = $adherent->cotisations;
        $cotisationsPayees = $cotisations->where('statut', 'payée')->count();
        $cotisationsRetard = $cotisations->where('statut', 'en retard')
                                         ->filter(fn($c) => $c->date_echeance < $today)
                                         ->count();

        // Montant total cotisé cette année
        $annee              = now()->year;
        $totalCotiseAnnee   = $cotisations
            ->where('statut', 'payée')
            ->filter(fn($c) => substr($c->date_paiement ?? '', 0, 4) == $annee)
            ->sum('montant');

        // Prochaine échéance de cotisation
        $prochaineCotisation = $cotisations
            ->where('statut', '!=', 'payée')
            ->where('date_echeance', '>=', $today)
            ->sortBy('date_echeance')
            ->first();

        // ── Prêts ──
        $prets      = $adherent->prets()->with('remboursements')->get();
        $pretActif  = $prets->where('statut', 'approuvé')->first();

        $pretInfo = null;
        if ($pretActif) {
            $remboursements      = $pretActif->remboursements;
            $mensualitesPayees   = $remboursements->where('statut', 'payé')->count();
            $mensualitesTotal    = $pretActif->duree_mois;
            $montantRembourse    = $remboursements->where('statut', 'payé')->sum('montant');
            $montantRestant      = $pretActif->montant - $montantRembourse;

            // Prochaine mensualité
            $prochaineMensualite = $remboursements
                ->where('statut', '!=', 'payé')
                ->where('date_echeance', '>=', $today)
                ->sortBy('date_echeance')
                ->first();

            $pretInfo = [
                'id'                   => $pretActif->id,
                'montant_initial'      => $pretActif->montant,
                'taux_interet'         => $pretActif->taux_interet,
                'duree_mois'           => $mensualitesTotal,
                'mensualites_payees'   => $mensualitesPayees,
                'mensualites_restantes'=> $mensualitesTotal - $mensualitesPayees,
                'montant_rembourse'    => $montantRembourse,
                'montant_restant'      => max(0, $montantRestant),
                'progression_pct'      => $mensualitesTotal > 0
                    ? round(($mensualitesPayees / $mensualitesTotal) * 100, 1)
                    : 0,
                'prochaine_mensualite' => $prochaineMensualite,
                'date_fin'             => $pretActif->date_fin,
            ];
        }

        // ── Sinistres ──
        $sinistres        = $adherent->sinistres()->with('prestations')->get();
        $sinistresOuverts = $sinistres->whereIn('statut', ['déclaré', 'en cours'])->count();
        $totalRembourse   = $sinistres->sum('montant_remboursement');

        // ── Ayants droit ──
        $ayantsDroit = $adherent->ayantsDroit;

        // ── Alertes personnelles ──
        $alertes = [];

        if ($cotisationsRetard > 0) {
            $alertes[] = [
                'type'    => 'danger',
                'message' => "$cotisationsRetard cotisation(s) en retard",
                'section' => 'cotisations',
            ];
        }

        if ($prochaineCotisation && $prochaineCotisation->date_echeance <= now()->addDays(7)->toDateString()) {
            $alertes[] = [
                'type'    => 'warning',
                'message' => 'Cotisation due le ' . date('d/m/Y', strtotime($prochaineCotisation->date_echeance)),
                'section' => 'cotisations',
            ];
        }

        if ($pretInfo && $pretInfo['prochaine_mensualite'] &&
            $pretInfo['prochaine_mensualite']['date_echeance'] <= now()->addDays(7)->toDateString()) {
            $alertes[] = [
                'type'    => 'warning',
                'message' => 'Mensualité prêt due le ' . date('d/m/Y', strtotime($pretInfo['prochaine_mensualite']['date_echeance'])),
                'section' => 'prets',
            ];
        }

        return response()->json([
            'adherent' => [
                'id'               => $adherent->id,
                'numero_adherent'  => $adherent->numero_adherent,
                'nom'              => $adherent->nom,
                'prenom'           => $adherent->prenom,
                'email'            => $adherent->email,
                'telephone'        => $adherent->telephone,
                'statut'           => $adherent->statut,
                'date_inscription' => $adherent->date_inscription,
                'ville'            => $adherent->ville,
            ],
            'stats' => [
                'cotisations_payees'   => $cotisationsPayees,
                'cotisations_retard'   => $cotisationsRetard,
                'total_cotise_annee'   => $totalCotiseAnnee,
                'pret_actif'           => $pretActif ? true : false,
                'sinistres_ouverts'    => $sinistresOuverts,
                'total_rembourse'      => $totalRembourse,
                'nb_ayants_droit'      => $ayantsDroit->count(),
            ],
            'prochaine_cotisation' => $prochaineCotisation,
            'pret_actif'           => $pretInfo,
            'alertes'              => $alertes,
        ]);
    }

    /* ================================================================
     * PROFIL — GET /api/mon-profil
     * ================================================================ */
    public function profil()
    {
        $adherent = $this->getAdherent();
        $user     = auth('api')->user();

        return response()->json([
            'user' => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role,
            ],
            'adherent' => $adherent,
        ]);
    }

    /* ================================================================
     * PROFIL — PUT /api/mon-profil
     * L'adhérent peut modifier ses infos personnelles
     * ================================================================ */
    public function updateProfil(Request $request)
    {
        $adherent = $this->getAdherent();

        $validated = $request->validate([
            'nom'         => 'sometimes|string|max:100',
            'prenom'      => 'sometimes|string|max:100',
            'telephone'   => 'sometimes|string|max:20',
            'adresse'     => 'sometimes|string|max:255',
            'ville'       => 'sometimes|string|max:100',
            'code_postal' => 'sometimes|string|max:20',
            'email'       => 'sometimes|email|unique:adherents,email,' . $adherent->id,
        ]);

        $adherent->update($validated);

        // Mettre à jour le nom dans users aussi si fourni
        if ($request->has('nom') || $request->has('prenom')) {
            $user = auth('api')->user();
            $user->update([
                'name' => ($validated['prenom'] ?? $adherent->prenom)
                        . ' '
                        . ($validated['nom'] ?? $adherent->nom),
            ]);
        }

        return response()->json([
            'message'  => 'Profil mis à jour avec succès',
            'adherent' => $adherent->fresh(),
        ]);
    }

    /* ================================================================
     * MOT DE PASSE — PUT /api/mon-mot-de-passe
     * ================================================================ */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'ancien_mot_de_passe'   => 'required|string',
            'nouveau_mot_de_passe'  => 'required|string|min:6|confirmed',
        ]);

        $user = auth('api')->user();

        if (!Hash::check($request->ancien_mot_de_passe, $user->password)) {
            return response()->json([
                'error' => 'L\'ancien mot de passe est incorrect.'
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->nouveau_mot_de_passe),
        ]);

        return response()->json(['message' => 'Mot de passe modifié avec succès']);
    }

    /* ================================================================
     * COTISATIONS — GET /api/mes-cotisations
     * ================================================================ */
    public function cotisations(Request $request)
    {
        $adherent = $this->getAdherent();
        $today    = now()->toDateString();

        $query = $adherent->cotisations()->orderBy('date_echeance', 'desc');

        // Filtre optionnel par statut
        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        $cotisations = $query->get()->map(function ($c) use ($today) {
            $joursRetard = null;
            if ($c->date_echeance < $today && $c->statut !== 'payée') {
                $joursRetard = now()->diffInDays($c->date_echeance);
            }
            $c->jours_retard = $joursRetard;
            return $c;
        });

        // Résumé
        $resume = [
            'total'        => $cotisations->count(),
            'payees'       => $cotisations->where('statut', 'payée')->count(),
            'en_attente'   => $cotisations->where('statut', 'en attente')->count(),
            'en_retard'    => $cotisations->where('statut', 'en retard')->count(),
            'total_paye'   => $cotisations->where('statut', 'payée')->sum('montant'),
        ];

        return response()->json([
            'resume'      => $resume,
            'cotisations' => $cotisations,
        ]);
    }

    /* ================================================================
     * PRÊTS — GET /api/mes-prets
     * ================================================================ */
    public function prets()
    {
        $adherent = $this->getAdherent();
        $today    = now()->toDateString();

        $prets = $adherent->prets()->with('remboursements')->orderBy('date_debut', 'desc')->get();

        $prets = $prets->map(function ($pret) use ($today) {
            $remboursements    = $pret->remboursements;
            $mensualitesPayees = $remboursements->where('statut', 'payé')->count();
            $montantRembourse  = $remboursements->where('statut', 'payé')->sum('montant');

            // Calcul mensualité théorique
            $M = $pret->montant;
            $r = ($pret->taux_interet ?? 0) / 100 / 12;
            $n = $pret->duree_mois;
            $mensualiteTheorique = $r > 0
                ? round($M * $r * pow(1 + $r, $n) / (pow(1 + $r, $n) - 1), 2)
                : round($M / $n, 2);

            $pret->mensualite_theorique  = $mensualiteTheorique;
            $pret->mensualites_payees    = $mensualitesPayees;
            $pret->montant_rembourse     = $montantRembourse;
            $pret->montant_restant       = max(0, $M - $montantRembourse);
            $pret->progression_pct       = $n > 0 ? round(($mensualitesPayees / $n) * 100, 1) : 0;

            // Prochaine mensualité impayée
            $pret->prochaine_echeance = $remboursements
                ->where('statut', '!=', 'payé')
                ->where('date_echeance', '>=', $today)
                ->sortBy('date_echeance')
                ->first();

            return $pret;
        });

        return response()->json([
            'prets'      => $prets,
            'nb_actifs'  => $prets->where('statut', 'approuvé')->count(),
            'nb_total'   => $prets->count(),
        ]);
    }

    /* ================================================================
     * TABLEAU D'AMORTISSEMENT — GET /api/mes-prets/{id}/amortissement
     * Retourne le détail complet des remboursements d'un prêt
     * ================================================================ */
    public function amortissement($id)
    {
        $adherent = $this->getAdherent();

        $pret = Pret::with('remboursements')
            ->where('adherent_id', $adherent->id)
            ->find($id);

        if (!$pret) {
            return response()->json(['error' => 'Prêt non trouvé ou accès non autorisé'], 404);
        }

        // Générer le tableau si les remboursements n'existent pas encore
        $remboursements = $pret->remboursements->sortBy('numero_echeance')->values();

        if ($remboursements->isEmpty()) {
            $remboursements = $this->genererAmortissement($pret);
        }

        $montantRembourse = $remboursements->where('statut', 'payé')->sum('montant');

        return response()->json([
            'pret' => [
                'id'             => $pret->id,
                'montant'        => $pret->montant,
                'taux_interet'   => $pret->taux_interet,
                'duree_mois'     => $pret->duree_mois,
                'date_debut'     => $pret->date_debut,
                'date_fin'       => $pret->date_fin,
                'statut'         => $pret->statut,
                'montant_rembourse' => $montantRembourse,
                'montant_restant'   => max(0, $pret->montant - $montantRembourse),
            ],
            'amortissement' => $remboursements,
        ]);
    }

    /* Helper : génère le tableau d'amortissement théorique */
    private function genererAmortissement(Pret $pret): \Illuminate\Support\Collection
    {
        $M       = (float) $pret->montant;
        $r       = ($pret->taux_interet ?? 0) / 100 / 12;
        $n       = (int) $pret->duree_mois;
        $capital = $M;
        $rows    = collect();
        $debut   = \Carbon\Carbon::parse($pret->date_debut);

        $mensualite = $r > 0
            ? round($M * $r * pow(1 + $r, $n) / (pow(1 + $r, $n) - 1), 2)
            : round($M / $n, 2);

        for ($i = 1; $i <= $n; $i++) {
            $interet        = round($capital * $r, 2);
            $amortissement  = round($mensualite - $interet, 2);
            $capital        = max(0, round($capital - $amortissement, 2));
            $dateEcheance   = $debut->copy()->addMonths($i)->toDateString();

            $rows->push([
                'numero_echeance'  => $i,
                'date_echeance'    => $dateEcheance,
                'montant'          => $mensualite,
                'interet'          => $interet,
                'amortissement'    => $amortissement,
                'capital_restant'  => $capital,
                'statut'           => 'en attente',
                'date_paiement'    => null,
            ]);
        }

        return $rows;
    }

    /* ================================================================
     * SINISTRES — GET /api/mes-sinistres
     * ================================================================ */
    public function sinistres()
    {
        $adherent  = $this->getAdherent();

        $sinistres = $adherent->sinistres()
            ->with('prestations')
            ->orderBy('date_sinistre', 'desc')
            ->get();

        $resume = [
            'total'             => $sinistres->count(),
            'declares'          => $sinistres->where('statut', 'déclaré')->count(),
            'en_cours'          => $sinistres->where('statut', 'en cours')->count(),
            'approuves'         => $sinistres->where('statut', 'approuvé')->count(),
            'rembourses'        => $sinistres->where('statut', 'remboursé')->count(),
            'total_reclame'     => $sinistres->sum('montant_reclamation'),
            'total_rembourse'   => $sinistres->sum('montant_remboursement'),
        ];

        return response()->json([
            'resume'    => $resume,
            'sinistres' => $sinistres,
        ]);
    }

    /* ================================================================
     * DÉCLARER UN SINISTRE — POST /api/mes-sinistres
     * L'adhérent déclare lui-même un sinistre
     * ================================================================ */
    public function declarerSinistre(Request $request)
    {
        $adherent = $this->getAdherent();

        $validated = $request->validate([
            'description'       => 'required|string|max:1000',
            'date_sinistre'     => 'required|date|before_or_equal:today',
            'type_sinistre'     => 'required|in:maladie,accident,décès,hospitalisation,autre',
            'montant_reclamation' => 'nullable|numeric|min:0',
        ]);

        $sinistre = Sinistre::create([
            ...$validated,
            'adherent_id' => $adherent->id,
            'statut'      => 'déclaré',
        ]);

        return response()->json([
            'message'  => 'Sinistre déclaré avec succès. Il sera traité par notre équipe.',
            'sinistre' => $sinistre,
        ], 201);
    }

    /* ================================================================
     * DEMANDER UN PRÊT — POST /api/mes-prets
     * L'adhérent soumet une demande de prêt
     * ================================================================ */
    public function demanderPret(Request $request)
    {
        $adherent = $this->getAdherent();

        // Vérifier qu'il n'a pas déjà un prêt en cours ou en attente
        $pretEnCours = $adherent->prets()
            ->whereIn('statut', ['en attente', 'approuvé'])
            ->first();

        if ($pretEnCours) {
            return response()->json([
                'error' => 'Vous avez déjà un prêt en cours ou en attente d\'approbation.'
            ], 422);
        }

        $validated = $request->validate([
            'montant'    => 'required|numeric|min:1000',
            'duree_mois' => 'required|integer|min:1|max:60',
            'motif'      => 'nullable|string|max:500',
        ]);

        $pret = Pret::create([
            'adherent_id' => $adherent->id,
            'montant'     => $validated['montant'],
            'duree_mois'  => $validated['duree_mois'],
            'date_debut'  => now()->toDateString(),
            'statut'      => 'en attente',
            // taux_interet sera fixé par l'admin lors de l'approbation
        ]);

        return response()->json([
            'message' => 'Demande de prêt soumise avec succès. Elle sera examinée par notre équipe.',
            'pret'    => $pret,
        ], 201);
    }

    /* ================================================================
     * AYANTS DROIT — GET /api/mes-ayants-droit
     * ================================================================ */
    public function ayantsDroit()
    {
        $adherent    = $this->getAdherent();
        $ayantsDroit = $adherent->ayantsDroit()
            ->orderBy('relation')
            ->get()
            ->map(function ($a) {
                // Calculer l'âge
                $a->age = $a->date_naissance
                    ? now()->diffInYears($a->date_naissance)
                    : null;
                return $a;
            });

        return response()->json([
            'nb_ayants_droit' => $ayantsDroit->count(),
            'ayants_droit'    => $ayantsDroit,
        ]);
    }

    /* ================================================================
     * AYANTS DROIT — POST /api/mes-ayants-droit
     * ================================================================ */
    public function ajouterAyantDroit(Request $request)
    {
        $adherent = $this->getAdherent();

        $validated = $request->validate([
            'nom'            => 'required|string|max:100',
            'prenom'         => 'required|string|max:100',
            'relation'       => 'required|string|in:conjoint,enfant,parent,frère,sœur,autre',
            'date_naissance' => 'nullable|date|before:today',
        ]);

        $ayantDroit = AyantDroit::create([
            ...$validated,
            'adherent_id' => $adherent->id,
        ]);

        return response()->json([
            'message'     => 'Ayant droit ajouté avec succès',
            'ayant_droit' => $ayantDroit,
        ], 201);
    }

    /* ================================================================
     * AYANTS DROIT — PUT /api/mes-ayants-droit/{id}
     * ================================================================ */
    public function modifierAyantDroit(Request $request, $id)
    {
        $adherent   = $this->getAdherent();
        $ayantDroit = AyantDroit::where('adherent_id', $adherent->id)->find($id);

        if (!$ayantDroit) {
            return response()->json(['error' => 'Ayant droit non trouvé ou accès non autorisé'], 404);
        }

        $validated = $request->validate([
            'nom'            => 'sometimes|string|max:100',
            'prenom'         => 'sometimes|string|max:100',
            'relation'       => 'sometimes|string|in:conjoint,enfant,parent,frère,sœur,autre',
            'date_naissance' => 'sometimes|nullable|date|before:today',
        ]);

        $ayantDroit->update($validated);

        return response()->json([
            'message'     => 'Ayant droit modifié avec succès',
            'ayant_droit' => $ayantDroit->fresh(),
        ]);
    }

    /* ================================================================
     * AYANTS DROIT — DELETE /api/mes-ayants-droit/{id}
     * ================================================================ */
    public function supprimerAyantDroit($id)
    {
        $adherent   = $this->getAdherent();
        $ayantDroit = AyantDroit::where('adherent_id', $adherent->id)->find($id);

        if (!$ayantDroit) {
            return response()->json(['error' => 'Ayant droit non trouvé ou accès non autorisé'], 404);
        }

        $ayantDroit->delete();

        return response()->json(['message' => 'Ayant droit supprimé avec succès']);
    }
}
