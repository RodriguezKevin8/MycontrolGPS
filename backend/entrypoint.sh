#!/bin/bash
set -e

echo "==> [Backend] Verificando conexión a la Base de Datos MySQL..."
until php -r "try { new PDO('mysql:host=mysql;port=3306;dbname=school', 'user', 'admin123'); echo 'Conectado'; exit(0); } catch (\Exception \$e) { exit(1); }" > /dev/null 2>&1; do
    echo "==> [Backend] Esperando que MySQL esté listo para aceptar conexiones..."
    sleep 2
done
echo "==> [Backend] MySQL está listo y conectado."

# 1. Configurar archivo .env si no existe
if [ ! -f .env ]; then
    echo "==> [Backend] .env no encontrado. Copiando desde .env.example..."
    cp .env.example .env
fi

# 2. Instalar dependencias de Composer si la carpeta vendor no existe
if [ ! -d vendor ]; then
    echo "==> [Backend] Carpeta vendor no encontrada. Ejecutando composer install..."
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi

# 3. Generar APP_KEY si aún no existe
if ! grep -q "APP_KEY=base64:" .env; then
    echo "==> [Backend] Generando APP_KEY..."
    php artisan key:generate --force
fi

# 4. Crear enlace simbólico de almacenamiento público para imágenes
echo "==> [Backend] Verificando enlace simbólico de almacenamiento..."
php artisan storage:link || true

# 5. Ejecutar migraciones de la base de datos
echo "==> [Backend] Ejecutando migraciones..."
php artisan migrate --force

# 6. Ejecutar Seeders de forma segura e idempotente
echo "==> [Backend] Verificando y ejecutando Seeders iniciales..."
php artisan db:seed --force

# 7. Iniciar el servidor API de Laravel
echo "==> [Backend] Servidor Laravel listo en http://0.0.0.0:8000"
exec php artisan serve --host=0.0.0.0 --port=8000
