<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class School extends Model
{
    use HasFactory;

    protected $table = 'school';
    protected $primaryKey = 'Id_school';

    protected $fillable = [
        'nombre',
        'direccion',
        'email',
        'foto',
        'latitud',
        'longitud',
        'id_user',
    ];

    protected $casts = [
        'latitud' => 'float',
        'longitud' => 'float',
    ];

    /**
     * Usuario encargado de administrar esta escuela.
     */
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_user', 'id_user');
    }

    /**
     * Alumnos matriculados en esta escuela.
     */
    public function alumnos()
    {
        return $this->hasMany(Alumno::class, 'id_school', 'Id_school');
    }
}

