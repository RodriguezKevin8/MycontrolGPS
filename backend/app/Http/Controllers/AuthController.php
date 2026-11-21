<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\Usuario;

class AuthController extends Controller
{
    /**
     * Inicia sesion validando credenciales y respondiendo con datos del usuario.
     */
    public function login(Request $request)
    {
        $request->validate([
            'usuario' => 'required|string',
            'password' => 'required|string',
        ]);

        $usuario = Usuario::where('usuario', $request->usuario)->first();
        if (!$usuario || !Hash::check($request->password, $usuario->password)) {
            return response()->json([
                'message' => 'Credenciales inválidas. Verifica tu usuario y contraseña.'
            ], 401);
        }

        // Generamos el token de autenticación seguro de Sanctum
        $token = $usuario->createToken('auth_token')->plainTextToken;
        $usuario->load('school');

        return response()->json([
            'message' => 'Inicio de sesión exitoso',
            'token' => $token,
            'user' => $usuario,
        ]);
    }

    /**
     * Retornamos los datos del usuario actualmente autenticado.
     */
    public function me(Request $request)
    {
        $user = $request->user();

        if ($user) {
            $user->load('school');
        }

        return response()->json([
            'user' => $user
        ]);
    }

    /**
     * Cierra la sesion activa revocando el token de acceso.
     */
    public function logout(Request $request)
    {
        if ($request->user() && $request->user()->currentAccessToken()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json([
            'message' => 'Sesión cerrada correctamente'
        ]);
    }
}

