<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\School;

class SchoolController extends Controller
{
    /**
     * Listado de escuelas con filtro segun el rol del usuario.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // El Administrador ve todas las escuelas y el Usuario ve solo la suya
        if ($user && $user->tipo === 'Administrador') {
            $schools = School::with('usuario:id_user,nombre,usuario')->latest()->get();
        } else {
            $schools = School::with('usuario:id_user,nombre,usuario')
                             ->where('id_user', $user->id_user)
                             ->get();
        }

        return response()->json($schools);
    }

    /**
     * Registra una nueva escuela con captura de foto y coordenadas de mapa.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'nombre' => 'required|string|max:255',
            'direccion' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'latitud' => 'nullable|numeric',
            'longitud' => 'nullable|numeric',
            'id_user' => 'nullable|exists:usuarios,id_user',
            'foto' => 'nullable',
        ]);

        $data = $request->only(['nombre', 'direccion', 'email', 'latitud', 'longitud']);


        $data['id_user'] = ($user->tipo === 'Administrador' && $request->filled('id_user'))
            ? $request->id_user
            : $user->id_user;

        if ($request->hasFile('foto')) {
            $request->validate([
                'foto' => 'image|mimes:jpeg,png,jpg,webp,gif|max:5120'
            ]);
            $path = $request->file('foto')->store('schools', 'public');
            $data['foto'] = url('storage/' . $path);
        } elseif ($request->filled('foto') && filter_var($request->foto, FILTER_VALIDATE_URL)) {
            $data['foto'] = $request->foto;
        }

        $school = School::create($data);

        return response()->json([
            'message' => 'Escuela registrada exitosamente',
            'school' => $school
        ], 201);
    }

    /**
     * Actualiza los datos o coordenadas de una escuela existente.
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $school = School::findOrFail($id);

        // Control de acceso: solo el Admin o el usuario vinculado pueden modificarla
        if ($user->tipo !== 'Administrador' && $school->id_user !== $user->id_user) {
            return response()->json(['message' => 'No autorizado para modificar esta escuela'], 403);
        }

        $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'direccion' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'latitud' => 'nullable|numeric',
            'longitud' => 'nullable|numeric',
            'id_user' => 'nullable|exists:usuarios,id_user',
            'foto' => 'nullable',
        ]);

        $data = $request->only(['nombre', 'direccion', 'email', 'latitud', 'longitud']);

        if ($user->tipo === 'Administrador' && $request->filled('id_user')) {
            $data['id_user'] = $request->id_user;
        }

        if ($request->hasFile('foto')) {
            $request->validate([
                'foto' => 'image|mimes:jpeg,png,jpg,webp,gif|max:5120'
            ]);

            if ($school->foto && str_contains($school->foto, '/storage/schools/')) {
                $oldFile = 'schools/' . basename($school->foto);
                Storage::disk('public')->delete($oldFile);
            }
            $path = $request->file('foto')->store('schools', 'public');
            $data['foto'] = url('storage/' . $path);
        } elseif ($request->filled('foto') && filter_var($request->foto, FILTER_VALIDATE_URL)) {
            $data['foto'] = $request->foto;
        }

        $school->update($data);

        return response()->json([
            'message' => 'Escuela actualizada correctamente',
            'school' => $school
        ]);
    }

    /**
     * Elimina una escuela si el usuario es Administrador.
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $school = School::findOrFail($id);

        if ($user->tipo !== 'Administrador') {
            return response()->json(['message' => 'Solo administradores pueden eliminar escuelas'], 403);
        }

        // Si tenía imagen local en storage, la eliminamos
        if ($school->foto && str_contains($school->foto, '/storage/schools/')) {
            $oldFile = 'schools/' . basename($school->foto);
            Storage::disk('public')->delete($oldFile);
        }

        $school->delete();

        return response()->json(['message' => 'Escuela eliminada correctamente']);
    }
}

