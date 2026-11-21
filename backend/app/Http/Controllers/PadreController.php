<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Padre;

class PadreController extends Controller
{
    /**
     * Listado de padres filtrado según el rol del usuario:
     * - Administrador: visualiza todos los tutores del sistema.
     * - Usuario: solo visualiza tutores de su sede escolar asignada.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user && $user->tipo === 'Administrador') {
            $padres = Padre::with('school:Id_school,nombre')
                ->latest('id_padre')
                ->get();
        } else {
            $userSchoolId = $user->school ? $user->school->Id_school : null;
            $padres = Padre::with('school:Id_school,nombre')
                ->where('id_school', $userSchoolId)
                ->orWhereHas('alumnos', function ($q) use ($userSchoolId) {
                    $q->where('id_school', $userSchoolId);
                })
                ->latest('id_padre')
                ->get();
        }

        return response()->json($padres);
    }

    /**
     * Registra un nuevo padre o tutor vinculado a la sede escolar.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'nombre' => 'required|string|max:255',
            'direccion' => 'nullable|string|max:255',
            'telefono' => 'nullable|string|max:50',
            'id_school' => 'nullable|exists:school,Id_school',
        ]);

        $data = $request->only(['nombre', 'direccion', 'telefono']);

        // Si es Usuario regular, forzamos que pertenezca a su escuela asignada
        if ($user->tipo !== 'Administrador') {
            $data['id_school'] = $user->school ? $user->school->Id_school : null;
        } else {
            $data['id_school'] = $request->id_school;
        }

        $padre = Padre::create($data);

        return response()->json([
            'message' => 'Responsable registrado exitosamente',
            'padre' => $padre->load('school:Id_school,nombre')
        ], 201);
    }

    /**
     * Actualiza datos de contacto del padre o tutor respetando permisos.
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $padre = Padre::findOrFail($id);

        if ($user->tipo !== 'Administrador') {
            $userSchoolId = $user->school ? $user->school->Id_school : null;
            if ($padre->id_school && $padre->id_school !== $userSchoolId) {
                return response()->json(['message' => 'No autorizado para editar este tutor'], 403);
            }
        }

        $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'direccion' => 'nullable|string|max:255',
            'telefono' => 'nullable|string|max:50',
            'id_school' => 'nullable|exists:school,Id_school',
        ]);

        $data = $request->only(['nombre', 'direccion', 'telefono']);

        if ($user->tipo === 'Administrador' && $request->filled('id_school')) {
            $data['id_school'] = $request->id_school;
        }

        $padre->update($data);

        return response()->json([
            'message' => 'Responsable actualizado con éxito',
            'padre' => $padre->load('school:Id_school,nombre')
        ]);
    }

    /**
     * Elimina un padre o tutor si el usuario tiene permiso sobre su escuela.
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $padre = Padre::findOrFail($id);

        if ($user->tipo !== 'Administrador') {
            $userSchoolId = $user->school ? $user->school->Id_school : null;
            if ($padre->id_school && $padre->id_school !== $userSchoolId) {
                return response()->json(['message' => 'No autorizado para eliminar este tutor'], 403);
            }
        }

        $padre->delete();

        return response()->json(['message' => 'Responsable eliminado con éxito']);
    }
}
