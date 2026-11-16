# Tasks

## 1. Repositorio

- [x] 1.1 Crear el `.gitignore` raíz (`.env`, `.env.*`, `.venv`, `__pycache__`, `.pytest_cache`, `node_modules`), inicializar Git en `tpi/` y subirlo al repositorio del grupo. Verificar con `git ls-files` que no hay `.env`. (Archivo creado y verificado: ningún `.env` rastreado; el `git push` lo hace el grupo con su repo.)

## 2. Easypanel

- [x] 2.1 Reutilizar el servicio `backend` existente (proyecto `app_grupo3`): cambiar la fuente al repositorio del grupo y el Build Path a `/tpi/backend`, recrear la base PostgreSQL (o marcarla con `alembic stamp head`), desplegar y revisar en los logs la migración. Verificar la salud desde el Shell (200), cargar los datos con `scripts/datos_iniciales.py` y quitar el dominio automático si existe.
- [x] 2.2 Crear el servicio `frontend` (Build Path `/frontend`, `API_UPSTREAM=<proyecto>_backend:8000`, dominio HTTPS → HTTP 80) y desplegar. Verificar `https://<dominio>/api/health/ready` (200) y el catálogo.

## 3. Verificación

- [x] 3.1 Ejecutar G-01 a G-06 desde la URL pública y guardar capturas en `evidencia/`.
- [x] 3.2 Ejecutar G-07: build del frontend, HTTPS, salud 200 y datos presentes tras redesplegar ambos servicios.

## 4. Documentación y entrega

- [x] 4.1 Completar `README.md` (grupo, ejecución local, carga de datos) y `DEPLOY.md` (URL, revisión, rutas de build, puertos, proxy, variables, migraciones, carga inicial, actualización, tabla de G-01 a G-07, diagnóstico).
- [x] 4.2 Armar el ZIP con `frontend/`, `backend/`, `README.md`, `DEPLOY.md` y `evidencia/`. Verificar que no contiene `.env`, `.venv`, `node_modules` ni credenciales. (ZIP `libreria-global.zip`, 101 archivos incluyendo las 10 capturas, sin prohibidos.)

## Workflow follow-up

- Archivar el change con `/openspec-archive-change` cuando estén todas las tareas.
