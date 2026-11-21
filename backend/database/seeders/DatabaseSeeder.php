<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Usuario;
use App\Models\School;
use App\Models\Padre;
use App\Models\Alumno;

class DatabaseSeeder extends Seeder
{
    /**
     * Llenando datos iniciales con coordenadas geográficas reales
     */
    public function run(): void
    {
        // Si el usuario admin ya existe, omitir para evitar duplicados
        if (Usuario::where('usuario', 'admin')->exists()) {
            if ($this->command) {
                $this->command->info('La base de datos ya cuenta con datos iniciales. Omitiendo seeders.');
            }
            return;
        }

        // 1. Usuarios con roles
        $admin = Usuario::create([
            'nombre' => 'Administrador del Sistema',
            'usuario' => 'admin',
            'password' => Hash::make('admin123'),
            'tipo' => 'Administrador',
        ]);

        $director1 = Usuario::create([
            'nombre' => 'Lic. Carlos Morales',
            'usuario' => 'director1',
            'password' => Hash::make('admin123'),
            'tipo' => 'Usuario',
        ]);

        $director2 = Usuario::create([
            'nombre' => 'Mtra. Elena Gómez',
            'usuario' => 'director2',
            'password' => Hash::make('admin123'),
            'tipo' => 'Usuario',
        ]);

        // 2. Escuelas con coordenadas reales
        $escuela1 = School::create([
            'nombre' => 'Colegio San José',
            'direccion' => 'Av. Central y 5ta Calle Poniente, Zona 1',
            'email' => 'contacto@colegiosanjose.edu',
            'foto' => 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&auto=format&fit=crop&q=80',
            'latitud' => 14.634915,
            'longitud' => -90.506882,
            'id_user' => $director1->id_user,
        ]);

        $escuela2 = School::create([
            'nombre' => 'Instituto Tecnológico Las Américas',
            'direccion' => 'Boulevard Los Próceres #18-20, Zona 10',
            'email' => 'admisiones@lasamericas.edu',
            'foto' => 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=600&auto=format&fit=crop&q=80',
            'latitud' => 14.589211,
            'longitud' => -90.512401,
            'id_user' => $director2->id_user,
        ]);

        // 3. Padres / Tutores
        $padre1 = Padre::create(['nombre' => 'Roberto Méndez', 'direccion' => 'Colonia El Roble, Casa 12', 'telefono' => '5551-1122']);
        $padre2 = Padre::create(['nombre' => 'Carmen Flores de Méndez', 'direccion' => 'Colonia El Roble, Casa 12', 'telefono' => '5552-3344']);
        $padre3 = Padre::create(['nombre' => 'Ing. Juan Carlos Morales', 'direccion' => 'Residenciales Los Pinos, Lote 45', 'telefono' => '5553-5566']);
        $padre4 = Padre::create(['nombre' => 'Dra. Sofía Castillo', 'direccion' => 'Condominio Bella Vista, Apto 3B', 'telefono' => '5554-7788']);
        $padre5 = Padre::create(['nombre' => 'Fernando Álvarez', 'direccion' => 'Zona 10, Diagonal 6 #14-22', 'telefono' => '5555-9900']);

        // 4. Alumnos para Escuela 1 (georreferenciados alrededor de Escuela 1)
        $a1 = Alumno::create([
            'nombre_completo' => 'Mateo Méndez Flores',
            'direccion' => 'Colonia El Roble, Casa 12',
            'telefono' => '5551-1122',
            'email' => 'mateo.mendez@estudiante.edu',
            'foto' => 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=400&auto=format&fit=crop&q=80',
            'genero' => 'Masculino',
            'latitud' => 14.638210,
            'longitud' => -90.502100,
            'id_grado' => 3,
            'id_seccion' => 1,
            'id_school' => $escuela1->Id_school,
        ]);
        $a1->padres()->attach($padre1->id_padre, ['parentesco' => 'Padre']);
        $a1->padres()->attach($padre2->id_padre, ['parentesco' => 'Madre']);

        $a2 = Alumno::create([
            'nombre_completo' => 'Valentina Morales Castillo',
            'direccion' => 'Residenciales Los Pinos, Lote 45',
            'telefono' => '5553-5566',
            'email' => 'valentina.morales@estudiante.edu',
            'foto' => 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
            'genero' => 'Femenino',
            'latitud' => 14.631500,
            'longitud' => -90.510800,
            'id_grado' => 4,
            'id_seccion' => 2,
            'id_school' => $escuela1->Id_school,
        ]);
        $a2->padres()->attach($padre3->id_padre, ['parentesco' => 'Padre']);

        $a3 = Alumno::create([
            'nombre_completo' => 'Santiago Méndez Flores',
            'direccion' => 'Colonia El Roble, Casa 12',
            'telefono' => '5552-3344',
            'email' => 'santiago.mendez@estudiante.edu',
            'foto' => 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
            'genero' => 'Masculino',
            'latitud' => 14.639100,
            'longitud' => -90.505400,
            'id_grado' => 1,
            'id_seccion' => 1,
            'id_school' => $escuela1->Id_school,
        ]);
        $a3->padres()->attach($padre1->id_padre, ['parentesco' => 'Padre']);
        $a3->padres()->attach($padre2->id_padre, ['parentesco' => 'Madre']);

        // 5. Alumnos para Escuela 2 (alrededor de Escuela 2 en Zona 10)
        $a4 = Alumno::create([
            'nombre_completo' => 'Camila Álvarez Castillo',
            'direccion' => 'Condominio Bella Vista, Apto 3B',
            'telefono' => '5554-7788',
            'email' => 'camila.alvarez@estudiante.edu',
            'foto' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
            'genero' => 'Femenino',
            'latitud' => 14.593200,
            'longitud' => -90.509800,
            'id_grado' => 5,
            'id_seccion' => 1,
            'id_school' => $escuela2->Id_school,
        ]);
        $a4->padres()->attach($padre4->id_padre, ['parentesco' => 'Madre']);
        $a4->padres()->attach($padre5->id_padre, ['parentesco' => 'Padre']);

        $a5 = Alumno::create([
            'nombre_completo' => 'Sebastián Álvarez',
            'direccion' => 'Zona 10, Diagonal 6 #14-22',
            'telefono' => '5555-9900',
            'email' => 'sebastian.alvarez@estudiante.edu',
            'foto' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
            'genero' => 'Masculino',
            'latitud' => 14.586100,
            'longitud' => -90.515200,
            'id_grado' => 2,
            'id_seccion' => 2,
            'id_school' => $escuela2->Id_school,
        ]);
        $a5->padres()->attach($padre5->id_padre, ['parentesco' => 'Tutor Legal']);
    }
}
