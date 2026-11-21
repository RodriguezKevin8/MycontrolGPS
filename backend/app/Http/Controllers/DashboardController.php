<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\School;
use App\Models\Alumno;

class DashboardController extends Controller
{
    /**
     * Devuelve los marcadores geográficos del mapa tanto de escuela como de alumnos diferenciados.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Determinamos qué escuela mostrar
        if ($user->tipo === 'Administrador') {
          
            $schoolId = $request->query('id_school');
            $school = $schoolId ? School::find($schoolId) : School::first();
        } else {
          
            $school = $user->school;
        }

        if (!$school) {
            return response()->json([
                'school' => null,
                'markers' => []
            ]);
        }

        // Cargamos los alumnos matriculados
        $alumnos = Alumno::where('id_school', $school->Id_school)
                         ->whereNotNull('latitud')
                         ->whereNotNull('longitud')
                         ->with('padres:id_padre,nombre,telefono')
                         ->get();

        $markers = [];

       
        if ($school->latitud && $school->longitud) {
            $markers[] = [
                'id' => 'school_' . $school->Id_school,
                'tipo' => 'escuela',
                'titulo' => $school->nombre,
                'direccion' => $school->direccion,
                'lat' => (float) $school->latitud,
                'lng' => (float) $school->longitud,
                'foto' => $school->foto,
            ];
        }

      
        foreach ($alumnos as $alumno) {
            $tutoresNombres = $alumno->padres->pluck('nombre')->join(', ');

            $markers[] = [
                'id' => 'alumno_' . $alumno->id_alumno,
                'tipo' => 'alumno',
                'titulo' => $alumno->nombre_completo,
                'direccion' => $alumno->direccion,
                'lat' => (float) $alumno->latitud,
                'lng' => (float) $alumno->longitud,
                'foto' => $alumno->foto,
                'grado' => $alumno->id_grado ? "Grado {$alumno->id_grado}" : 'Sin grado',
                'seccion' => $alumno->id_seccion ? "Sección {$alumno->id_seccion}" : 'Sin sección',
                'tutores' => $tutoresNombres ?: 'Sin tutores registrados',
            ];
        }

        return response()->json([
            'school' => $school,
            'total_alumnos' => $school->alumnos()->count(),
            'total_mapeados' => count($alumnos),
            'markers' => $markers,
        ]);
    }
}

