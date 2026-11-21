<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\SchoolController;
use App\Http\Controllers\AlumnoController;
use App\Http\Controllers\PadreController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReporteController;


// Rutas públicas de autenticacio
Route::post('/login', [AuthController::class, 'login']);

// Rutas protegidas por Sanctum 
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::apiResource('schools', SchoolController::class);

    Route::apiResource('usuarios', UsuarioController::class);

    Route::apiResource('alumnos', AlumnoController::class);

    Route::apiResource('padres', PadreController::class);

    Route::prefix('reportes')->group(function () {
        Route::get('/escuelas', [ReporteController::class, 'escuelas']);
        Route::get('/alumnos', [ReporteController::class, 'alumnos']);
    });
});

