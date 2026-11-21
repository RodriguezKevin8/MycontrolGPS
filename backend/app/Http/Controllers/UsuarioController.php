<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Usuario;

class UsuarioController extends Controller
{
    /**
     * Listado de usuarios con su escuela asociada (solo Administradores).
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->tipo !== 'Administrador') {
            return response()->json(['message' => 'No autorizado para gestionar usuarios'], 403);
        }

        $usuarios = Usuario::with('school:Id_school,nombre,id_user')
            ->latest('id_user')
            ->get();

        return response()->json($usuarios);
    }

    /**
     * Registra un nuevo usuario en el sistema.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->tipo !== 'Administrador') {
            return response()->json(['message' => 'No autorizado para crear usuarios'], 403);
        }

        $request->validate([
            'nombre' => 'required|string|max:255',
            'usuario' => 'required|string|max:100|unique:usuarios,usuario',
            'password' => 'required|string|min:6',
            'tipo' => 'required|in:Administrador,Usuario',
        ], [
            'usuario.unique' => 'El nombre de usuario ya está en uso',
            'password.min' => 'La contraseña debe tener al menos 6 caracteres',
            'tipo.in' => 'El tipo de cuenta debe ser Administrador o Usuario',
        ]);

        $nuevoUsuario = Usuario::create([
            'nombre' => $request->nombre,
            'usuario' => $request->usuario,
            'password' => Hash::make($request->password),
            'tipo' => $request->tipo,
        ]);

        return response()->json([
            'message' => 'Usuario registrado exitosamente',
            'usuario' => $nuevoUsuario
        ], 201);
    }

    /**
     * Obtiene los detalles de un usuario específico.
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();

        if ($user->tipo !== 'Administrador' && $user->id_user != $id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $usuario = Usuario::with('school')->findOrFail($id);

        return response()->json($usuario);
    }

    /**
     * Actualiza la información de un usuario existente.
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();

        if ($user->tipo !== 'Administrador' && $user->id_user != $id) {
            return response()->json(['message' => 'No autorizado para editar este usuario'], 403);
        }

        $usuario = Usuario::findOrFail($id);

        $rules = [
            'nombre' => 'sometimes|required|string|max:255',
            'usuario' => 'sometimes|required|string|max:100|unique:usuarios,usuario,' . $id . ',id_user',
            'password' => 'nullable|string|min:6',
        ];

        if ($user->tipo === 'Administrador') {
            $rules['tipo'] = 'sometimes|required|in:Administrador,Usuario';
        }

        $request->validate($rules, [
            'usuario.unique' => 'El nombre de usuario ya está registrado en otra cuenta',
            'password.min' => 'La nueva contraseña debe tener al menos 6 caracteres',
        ]);

        $data = $request->only(['nombre', 'usuario']);

        if ($user->tipo === 'Administrador' && $request->filled('tipo')) {
            $data['tipo'] = $request->tipo;
        }

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $usuario->update($data);

        return response()->json([
            'message' => 'Usuario actualizado correctamente',
            'usuario' => $usuario->load('school')
        ]);
    }

    /**
     * Elimina un usuario del sistema.
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        if ($user->tipo !== 'Administrador') {
            return response()->json(['message' => 'Solo administradores pueden eliminar usuarios'], 403);
        }

        if ($user->id_user == $id) {
            return response()->json(['message' => 'No puedes eliminar tu propia cuenta en sesión'], 400);
        }

        $usuario = Usuario::findOrFail($id);
        $usuario->delete();

        return response()->json(['message' => 'Usuario eliminado correctamente']);
    }
}
