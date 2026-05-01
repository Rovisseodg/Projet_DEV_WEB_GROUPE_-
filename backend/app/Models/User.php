<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $table = 'users';
    protected $fillable = ['name', 'email', 'password', 'role'];
    protected $hidden = ['password'];

    public function adherent()
    {
        return $this->hasOne(Adherent::class, 'user_id');
    }
}
