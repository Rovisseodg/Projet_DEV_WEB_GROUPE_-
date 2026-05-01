<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pret extends Model
{
    protected $table = 'prets';
    protected $fillable = [
        'adherent_id', 'montant', 'taux_interet', 'duree_mois',
        'date_debut', 'date_fin', 'statut'
    ];

    public function adherent()
    {
        return $this->belongsTo(Adherent::class, 'adherent_id');
    }

    public function remboursements()
    {
        return $this->hasMany(RemboursementPret::class, 'pret_id');
    }
}
