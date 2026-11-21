<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class PadreAlumno extends Pivot
{
    // Indicamos que esta tabla es una tabla de relación entre otras dos tablas
    protected $table = 'padres_alumnos';
    protected $primaryKey = 'id_padre_alumno';

    protected $fillable = [
        'id_alumno',
        'id_padre',
        'parentesco',
    ];
}

