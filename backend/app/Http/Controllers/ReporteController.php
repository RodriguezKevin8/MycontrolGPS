<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\School;
use App\Models\Alumno;

class ReporteController extends Controller
{
    /**
     * Reporte con los datos generales de las escuelas y su cantidad de alumnos.
     */
    public function escuelas(Request $request)
    {
        $user = $request->user();

        $query = School::with('usuario:id_user,nombre,usuario')
                       ->withCount('alumnos');

        if ($user && $user->tipo !== 'Administrador') {
            $query->where('id_user', $user->id_user);
        }

        $escuelas = $query->get()->map(function ($s) {
            return [
                'id' => $s->Id_school,
                'nombre' => $s->nombre,
                'direccion' => $s->direccion,
                'email' => $s->email,
                'coordenadas' => ($s->latitud && $s->longitud) ? "{$s->latitud}, {$s->longitud}" : 'No registradas',
                'responsable' => $s->usuario ? $s->usuario->nombre : 'Sin asignar',
                'total_alumnos' => $s->alumnos_count,
            ];
        });

        return response()->json($escuelas);
    }

    /**
     * Reporte consolidado de alumnos con sus respectivos encargados y parentesco.
     */
    public function alumnos(Request $request)
    {
        $user = $request->user();

        $query = Alumno::with(['school:Id_school,nombre', 'padres']);

        if ($user && $user->tipo !== 'Administrador') {
            $schoolId = $user->school ? $user->school->Id_school : 0;
            $query->where('id_school', $schoolId);
        } elseif ($request->filled('id_school')) {
            $query->where('id_school', $request->id_school);
        }

        $alumnos = $query->get()->map(function ($a) {
            $encargados = $a->padres->map(function ($p) {
                $parentesco = $p->pivot->parentesco ?? 'Tutor';
                return "{$p->nombre} ({$parentesco}) - Tel: " . ($p->telefono ?: 'N/A');
            })->values();

            return [
                'id' => $a->id_alumno,
                'nombre' => $a->nombre_completo,
                'escuela' => $a->school ? $a->school->nombre : 'Sin escuela',
                'telefono' => $a->telefono ?: 'N/A',
                'email' => $a->email ?: 'N/A',
                'genero' => $a->genero ?: 'N/A',
                'grado_seccion' => "Grado {$a->id_grado} - Secc. {$a->id_seccion}",
                'coordenadas' => ($a->latitud && $a->longitud) ? "{$a->latitud}, {$a->longitud}" : 'Sin GPS',
                'encargados' => $encargados,
            ];
        });

        return response()->json($alumnos);
    }
}

