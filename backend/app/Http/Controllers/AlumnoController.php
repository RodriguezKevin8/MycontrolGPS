<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Alumno;
use App\Models\School;

class AlumnoController extends Controller
{
    /**
     * Listado de alumnos con filtrado según la escuela asignada al usuario.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Alumno::with(['school:Id_school,nombre', 'padres']);

        if ($user && $user->tipo !== 'Administrador') {
            $schoolId = $user->school ? $user->school->Id_school : 0;
            $query->where('id_school', $schoolId);
        } elseif ($request->filled('id_school')) {
            $query->where('id_school', $request->id_school);
        }

        return response()->json($query->latest()->get());
    }

    /**
     * Registrar cada alumno con ubicación residencial en mapa y asignación de múltiples tutores.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if ($request->has('padres') && is_string($request->padres)) {
            $decoded = json_decode($request->padres, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $request->merge(['padres' => $decoded]);
            }
        }

        $request->validate([
            'nombre_completo' => 'required|string|max:255',
            'direccion' => 'nullable|string|max:255',
            'telefono' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'genero' => 'nullable|string|max:50',
            'latitud' => 'nullable|numeric',
            'longitud' => 'nullable|numeric',
            'id_grado' => 'nullable|integer',
            'id_seccion' => 'nullable|integer',
            'id_school' => 'nullable|exists:school,Id_school',
            'foto' => 'nullable',
            'padres' => 'nullable|array',
            'padres.*.id_padre' => 'required|exists:padres,id_padre',
            'padres.*.parentesco' => 'nullable|string|max:100',
        ]);

        $data = $request->only([
            'nombre_completo', 'direccion', 'telefono', 'email', 'genero',
            'latitud', 'longitud', 'id_grado', 'id_seccion'
        ]);

        if ($user->tipo !== 'Administrador') {
            $data['id_school'] = $user->school ? $user->school->Id_school : null;
        } else {
            $data['id_school'] = $request->id_school;
        }

        if ($request->hasFile('foto')) {
            $request->validate([
                'foto' => 'image|mimes:jpeg,png,jpg,webp,gif|max:5120'
            ]);
            $path = $request->file('foto')->store('alumnos', 'public');
            $data['foto'] = url('storage/' . $path);
        } elseif ($request->filled('foto') && filter_var($request->foto, FILTER_VALIDATE_URL)) {
            $data['foto'] = $request->foto;
        }

        $alumno = Alumno::create($data);

        // SE vinculan los padres con su respectivo parentesco
        $padres = $request->padres;
        if (is_string($padres)) {
            $padres = json_decode($padres, true);
        }
        if (is_array($padres)) {
            $syncData = [];
            foreach ($padres as $p) {
                if (isset($p['id_padre'])) {
                    $syncData[$p['id_padre']] = ['parentesco' => $p['parentesco'] ?? 'Tutor'];
                }
            }
            $alumno->padres()->sync($syncData);
        }

        $alumno->load(['school', 'padres']);

        return response()->json([
            'message' => 'Alumno registrado con éxito',
            'alumno' => $alumno
        ], 201);
    }

    /**
     * Actualiza los datos de un alumno y sus responsables asociados.
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $alumno = Alumno::findOrFail($id);

        if ($user->tipo !== 'Administrador') {
            $userSchoolId = $user->school ? $user->school->Id_school : null;
            if ($alumno->id_school !== $userSchoolId) {
                return response()->json(['message' => 'No autorizado para editar este alumno'], 403);
            }
        }

        if ($request->has('padres') && is_string($request->padres)) {
            $decoded = json_decode($request->padres, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $request->merge(['padres' => $decoded]);
            }
        }

        $request->validate([
            'nombre_completo' => 'sometimes|required|string|max:255',
            'direccion' => 'nullable|string|max:255',
            'telefono' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'genero' => 'nullable|string|max:50',
            'latitud' => 'nullable|numeric',
            'longitud' => 'nullable|numeric',
            'id_grado' => 'nullable|integer',
            'id_seccion' => 'nullable|integer',
            'id_school' => 'nullable|exists:school,Id_school',
            'foto' => 'nullable',
            'padres' => 'nullable|array',
            'padres.*.id_padre' => 'required|exists:padres,id_padre',
            'padres.*.parentesco' => 'nullable|string|max:100',
        ]);

        $data = $request->only([
            'nombre_completo', 'direccion', 'telefono', 'email', 'genero',
            'latitud', 'longitud', 'id_grado', 'id_seccion'
        ]);

        if ($user->tipo === 'Administrador' && $request->filled('id_school')) {
            $data['id_school'] = $request->id_school;
        }

        if ($request->hasFile('foto')) {
            $request->validate([
                'foto' => 'image|mimes:jpeg,png,jpg,webp,gif|max:5120'
            ]);
          
            if ($alumno->foto && str_contains($alumno->foto, '/storage/alumnos/')) {
                $oldFile = 'alumnos/' . basename($alumno->foto);
                Storage::disk('public')->delete($oldFile);
            }
            $path = $request->file('foto')->store('alumnos', 'public');
            $data['foto'] = url('storage/' . $path);
        } elseif ($request->filled('foto') && filter_var($request->foto, FILTER_VALIDATE_URL)) {
            $data['foto'] = $request->foto;
        }

        $alumno->update($data);

        // se vinculan los padres con su respectivo parentesco
        $padres = $request->padres;
        if (is_string($padres)) {
            $padres = json_decode($padres, true);
        }
        if (is_array($padres)) {
            $syncData = [];
            foreach ($padres as $p) {
                if (isset($p['id_padre'])) {
                    $syncData[$p['id_padre']] = ['parentesco' => $p['parentesco'] ?? 'Tutor'];
                }
            }
            $alumno->padres()->sync($syncData);
        }

        $alumno->load(['school', 'padres']);

        return response()->json([
            'message' => 'Alumno actualizado correctamente',
            'alumno' => $alumno
        ]);
    }

    /**
     * Eliminar un alumno del sistema.
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $alumno = Alumno::findOrFail($id);

        if ($user->tipo !== 'Administrador') {
            $userSchoolId = $user->school ? $user->school->Id_school : null;
            if ($alumno->id_school !== $userSchoolId) {
                return response()->json(['message' => 'No autorizado para eliminar este alumno'], 403);
            }
        }

        // Si tenia foto local en storage, la eliminamos
        if ($alumno->foto && str_contains($alumno->foto, '/storage/alumnos/')) {
            $oldFile = 'alumnos/' . basename($alumno->foto);
            Storage::disk('public')->delete($oldFile);
        }

        $alumno->delete();

        return response()->json(['message' => 'Alumno eliminado correctamente']);
    }
}

