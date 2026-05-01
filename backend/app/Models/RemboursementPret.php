<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RemboursementPret extends Model
{
    protected $table = 'remboursements_prets';
    protected $fillable = [
        'pret_id', 'numero_echeance', 'montant', 'date_echeance',
        'date_paiement', 'statut'
    ];

    public function pret()
    {
        return $this->belongsTo(Pret::class, 'pret_id');
    }
}
