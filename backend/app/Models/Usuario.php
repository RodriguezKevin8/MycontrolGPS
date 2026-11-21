<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Usuario extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'usuarios';
    protected $primaryKey = 'id_user';

    /**
     * Atributos asignables de forma masiva (proteccion Mass Assignment)
     */
    protected $fillable = [
        'nombre',
        'usuario',
        'password',
        'tipo',
    ];

    /**
     * Atributos ocultos en serialización JSON
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Conversion automatica de tipos 
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    /**
     * Una cuenta de tipo 'Usuario' está vinculada a una escuela.
     */
    public function school()
    {
        return $this->hasOne(School::class, 'id_user', 'id_user');
    }

    /**
     * Verifica si el usuario es Administrador.
     */
    public function esAdmin(): bool
    {
        return $this->tipo === 'Administrador';
    }
}

