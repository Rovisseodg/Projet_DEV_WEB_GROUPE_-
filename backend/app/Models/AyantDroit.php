<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AyantDroit extends Model
{
    protected $table = 'ayants_droit';
    protected $fillable = [
        'adherent_id', 'nom', 'prenom', 'relation', 'date_naissance'
    ];

    public function adherent()
    {
        return $this->belongsTo(Adherent::class, 'adherent_id');
    }
}
