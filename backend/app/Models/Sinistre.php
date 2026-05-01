<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sinistre extends Model
{
    protected $table = 'sinistres';
    protected $fillable = [
        'adherent_id', 'description', 'date_sinistre', 'type_sinistre',
        'statut', 'montant_reclamation', 'montant_remboursement'
    ];

    public function adherent()
    {
        return $this->belongsTo(Adherent::class, 'adherent_id');
    }

    public function prestations()
    {
        return $this->hasMany(Prestation::class, 'sinistre_id');
    }
}
