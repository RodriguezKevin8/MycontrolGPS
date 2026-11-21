<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ejecuta las migraciones creando las tablas requeridas
     */
    public function up(): void
    {
        // 1. Tabla usuarios 
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id('id_user');
            $table->string('nombre');
            $table->string('usuario')->unique();
            $table->string('password');
            $table->enum('tipo', ['Administrador', 'Usuario'])->default('Usuario');
            $table->rememberToken();
            $table->timestamps();
        });

        // 2. Tabla school 
        Schema::create('school', function (Blueprint $table) {
            $table->id('Id_school');
            $table->string('nombre');
            $table->string('direccion')->nullable();
            $table->string('email')->nullable();
            $table->string('foto')->nullable();
            $table->decimal('latitud', 10, 8)->nullable();
            $table->decimal('longitud', 11, 8)->nullable();
            $table->unsignedBigInteger('id_user');
            $table->foreign('id_user')->references('id_user')->on('usuarios')->onDelete('cascade');
            $table->timestamps();
        });

        // 3. Tabla padres 
        Schema::create('padres', function (Blueprint $table) {
            $table->id('id_padre');
            $table->string('nombre');
            $table->string('direccion')->nullable();
            $table->string('telefono')->nullable();
            $table->timestamps();
        });

        // 4. Tabla alumnos 
        Schema::create('alumnos', function (Blueprint $table) {
            $table->id('id_alumno');
            $table->string('nombre_completo');
            $table->string('direccion')->nullable();
            $table->string('telefono')->nullable();
            $table->string('email')->nullable();
            $table->string('foto')->nullable();
            $table->string('genero')->nullable();
            $table->decimal('latitud', 10, 8)->nullable();
            $table->decimal('longitud', 11, 8)->nullable();
            $table->integer('id_grado')->nullable();
            $table->integer('id_seccion')->nullable();
            $table->unsignedBigInteger('id_school');
            $table->foreign('id_school')->references('Id_school')->on('school')->onDelete('cascade');
            $table->timestamps();
        });

        // 5. Tabla padres_alumnos (relación N:M entre alumnos y padres con parentesco)
        Schema::create('padres_alumnos', function (Blueprint $table) {
            $table->id('id_padre_alumno');
            $table->unsignedBigInteger('id_alumno');
            $table->unsignedBigInteger('id_padre');
            $table->string('parentesco')->default('Tutor');
            $table->foreign('id_alumno')->references('id_alumno')->on('alumnos')->onDelete('cascade');
            $table->foreign('id_padre')->references('id_padre')->on('padres')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Revierte las migraciones eliminando las tablas en orden inverso.
     */
    public function down(): void
    {
        Schema::dropIfExists('padres_alumnos');
        Schema::dropIfExists('alumnos');
        Schema::dropIfExists('padres');
        Schema::dropIfExists('school');
        Schema::dropIfExists('usuarios');
    }
};

