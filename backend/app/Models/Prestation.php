<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Prestation extends Model
{
    protected $table = 'prestations';
    protected $fillable = [
        'sinistre_id', 'type_prestation', 'description', 'montant',
        'date_demande', 'date_approbation', 'statut'
    ];

    public function sinistre()
    {
        return $this->belongsTo(Sinistre::class, 'sinistre_id');
    }
}
