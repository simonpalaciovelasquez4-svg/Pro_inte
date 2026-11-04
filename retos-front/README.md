# Nexo Retos — Front (React + Bootstrap)

## Cómo correrlo
1. `npm install`
2. Si el backend no está en `http://localhost:3001`, configura su URL en `BACKEND_URL`.
3. `npm run dev`

En desarrollo, Vite redirige `/api/*` a tu backend, así no hay problemas de CORS.
El front asume que el backend monta sus rutas bajo `/api` (`/api/auth/login`, `/api/retos`, ...).
Si usas otro prefijo, cambia `BASE` en `src/services/api.js` (o define `VITE_API_URL`).

## Estructura
- `src/pages/`          una página por ruta
- `src/components/`     piezas reutilizables (Navbar, Layout, RetoCard, RetoForm, ConfirmModal...)
- `src/context/`        sesión del usuario (AuthContext)
- `src/hooks/`          useCatalogos (empresas, categorías, prioridades)
- `src/services/api.js` TODAS las llamadas al backend

## Rutas
| Ruta              | Página      | Privada |
|-------------------|-------------|---------|
| /login            | Login       | no      |
| /registro         | Registro    | no      |
| /                 | Dashboard   | sí      |
| /retos/nuevo      | NuevoReto   | sí      |
| /retos/:id        | DetalleReto | sí      |
| /retos/:id/editar | EditarReto  | sí      |
| /gestion/empresas | Gestión     | sí      |
| /gestion/categorias | Gestión   | sí      |
| /gestion/prioridades | Gestión  | sí      |
| /gestion/usuarios | Gestión     | sí      |
| /gestion/registros | Gestión    | sí      |

El módulo de retos ya permite listar, consultar, crear, editar y eliminar retos.
Las rutas de gestión usan los endpoints `GET`, `POST`, `PUT` y `DELETE` bajo `/api/{recurso}` y requieren una sesión iniciada.

El CRUD de empresas usa nombre, NIT, sector, contacto, correo y teléfono; categorías usa nombre y descripción; prioridades usa nombre y nivel; e inscripciones vinculan un participante con un reto, fecha, estado y observación.
El módulo de usuarios permite gestionar perfiles a todos los usuarios autenticados. Solo los administradores pueden asignar/cambiar roles y eliminar cuentas. Crear un usuario desde el CRUD no crea credenciales de acceso; para iniciar sesión, debe usar el formulario de registro.
