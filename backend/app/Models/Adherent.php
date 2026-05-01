<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Adherent extends Model
{
    protected $table = 'adherents';
    protected $fillable = [
        'user_id', 'nom', 'prenom', 'email', 'telephone',
        'numero_adherent', 'date_inscription', 'statut',
        'adresse', 'ville', 'code_postal', 'date_naissance', 'genre'
    ];

    public function cotisations()
    {
        return $this->hasMany(Cotisation::class, 'adherent_id');
    }

    public function prets()
    {
        return $this->hasMany(Pret::class, 'adherent_id');
    }

    public function sinistres()
    {
        return $this->hasMany(Sinistre::class, 'adherent_id');
    }

    public function ayantsDroit()
    {
        return $this->hasMany(AyantDroit::class, 'adherent_id');
    }
}
