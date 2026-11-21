# MycontrolGPS - Gestión Escolar y Geolocalización

Sistema de gestión escolar con mapa interactivo y geolocalización de sedes y alumnos. Desarrollado con **Laravel 12 (API REST)**, **MySQL 8**, **React 18 (TypeScript + Vite + Tailwind CSS)** y **Leaflet + OpenStreetMap**.

---

## 📋 Requisitos Previos

- Tener instalado y en ejecución **[Docker Desktop](https://www.docker.com/products/docker-desktop/)**.

---

## 🚀 Inicio Rápido (Un solo comando)

Clona el repositorio, abre una terminal en la raíz del proyecto y ejecuta:

```bash
docker compose up -d --build
```

El sistema automáticamente:

1. Iniciará **MySQL 8.0** y esperará a que esté listo.
2. Ejecutará las **migraciones** y cargará los **seeders** (con colegios, alumnos, tutores y coordenadas GPS).
3. Configurará el almacenamiento para fotos (`storage:link`).
4. Levantará la **API de Laravel** en el puerto `8000`.
5. Levantará el **Frontend de React** en el puerto `5173`.

---

## 🌐 URLs de Acceso

- **Aplicación Web (Frontend):** [http://localhost:5173](http://localhost:5173)
- **API REST (Backend):** [http://localhost:8000/api](http://localhost:8000/api)

---

## 🔑 Credenciales de Acceso

| Rol                 | Usuario     | Contraseña | Descripción                                             |
| :------------------ | :---------- | :--------- | :------------------------------------------------------ |
| **Administrador**   | `admin`     | `admin123` | Acceso global a todas las escuelas, alumnos y reportes. |
| **Usuario Regular** | `director1` | `admin123` | Acceso restringido exclusivamente a su sede asignada.   |

---

## 🛠️ Comandos Útiles

- **Ver los registros en tiempo real:**

  ```bash
  docker compose logs -f
  ```

- **Detener la aplicación:**

  ```bash
  docker compose down
  ```

- **Reiniciar y restablecer la base de datos desde cero (opcional):**
  ```bash
  docker compose down -v
  docker compose up -d --build
  ```
