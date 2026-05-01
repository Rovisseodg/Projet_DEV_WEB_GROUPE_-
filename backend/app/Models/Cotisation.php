<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cotisation extends Model
{
    protected $table = 'cotisations';
    protected $fillable = [
        'adherent_id', 'montant', 'date_echeance', 'date_paiement',
        'statut', 'reference_paiement', 'mode_paiement'
    ];

    public function adherent()
    {
        return $this->belongsTo(Adherent::class, 'adherent_id');
    }
}
