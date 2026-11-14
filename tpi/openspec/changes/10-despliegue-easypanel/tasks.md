# Tasks

## 1. Repositorio

- [ ] 1.1 Crear el `.gitignore` raíz (`.env`, `.env.*`, `.venv`, `__pycache__`, `.pytest_cache`, `node_modules`), inicializar Git en `tpi/` y subirlo al repositorio del grupo. Verificar con `git ls-files` que no hay `.env`.

## 2. Easypanel

- [ ] 2.1 Crear el servicio `backend` (Build Path `/backend`, Dockerfile, `DATABASE_URL` de la base asignada), desplegar y revisar en los logs la migración. Verificar la salud desde el Shell (200), cargar los datos con `scripts/datos_iniciales.py` y quitar el dominio automático si existe.
- [ ] 2.2 Crear el servicio `frontend` (Build Path `/frontend`, `API_UPSTREAM=<proyecto>_backend:8000`, dominio HTTPS → HTTP 80) y desplegar. Verificar `https://<dominio>/api/health/ready` (200) y el catálogo.

## 3. Verificación

- [ ] 3.1 Ejecutar G-01 a G-06 desde la URL pública y guardar capturas en `evidencia/`.
- [ ] 3.2 Ejecutar G-07: build del frontend, HTTPS, salud 200 y datos presentes tras redesplegar ambos servicios.

## 4. Documentación y entrega

- [ ] 4.1 Completar `README.md` (grupo, ejecución local, carga de datos) y `DEPLOY.md` (URL, revisión, rutas de build, puertos, proxy, variables, migraciones, carga inicial, actualización, tabla de G-01 a G-07, diagnóstico).
- [ ] 4.2 Armar el ZIP con `frontend/`, `backend/`, `README.md`, `DEPLOY.md` y `evidencia/`. Verificar que no contiene `.env`, `.venv`, `node_modules` ni credenciales.

## Workflow follow-up

- Archivar el change con `/openspec-archive-change` cuando estén todas las tareas.
