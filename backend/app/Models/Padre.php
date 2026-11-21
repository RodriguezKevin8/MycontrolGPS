<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Padre extends Model
{
    use HasFactory;

    protected $table = 'padres';
    protected $primaryKey = 'id_padre';

    protected $fillable = [
        'nombre',
        'direccion',
        'telefono',
        'id_school',
    ];

    /**
     * Escuela a la que está vinculado este tutor.
     */
    public function school()
    {
        return $this->belongsTo(School::class, 'id_school', 'Id_school');
    }

    /**
     * Alumnos a cargo de este padre o tutor.
     */
    public function alumnos()
    {
        return $this->belongsToMany(Alumno::class, 'padres_alumnos', 'id_padre', 'id_alumno', 'id_padre', 'id_alumno')
                    ->withPivot('id_padre_alumno', 'parentesco')
                    ->withTimestamps();
    }
}

