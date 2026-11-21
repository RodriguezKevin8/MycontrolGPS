<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Alumno extends Model
{
    use HasFactory;

    protected $table = 'alumnos';
    protected $primaryKey = 'id_alumno';

    protected $fillable = [
        'nombre_completo',
        'direccion',
        'telefono',
        'email',
        'foto',
        'genero',
        'latitud',
        'longitud',
        'id_grado',
        'id_seccion',
        'id_school',
    ];

    protected $casts = [
        'latitud' => 'float',
        'longitud' => 'float',
        'id_grado' => 'integer',
        'id_seccion' => 'integer',
    ];

    /**
     * Escuela a la que pertenece el alumno.
     */
    public function school()
    {
        return $this->belongsTo(School::class, 'id_school', 'Id_school');
    }

    /**
     * Padres o encargados vinculados al alumno.
     */
    public function padres()
    {
        return $this->belongsToMany(Padre::class, 'padres_alumnos', 'id_alumno', 'id_padre', 'id_alumno', 'id_padre')
                    ->withPivot('id_padre_alumno', 'parentesco')
                    ->withTimestamps();
    }
}

