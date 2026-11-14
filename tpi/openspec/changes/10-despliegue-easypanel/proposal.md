# Proposal

## Why

El **Ejercicio 5 · Servicios en Easypanel** (20 puntos) pide publicar backend y frontend como dos servicios App del mismo proyecto, verificar desde la URL pública con los casos G-01 a G-07 y entregar `README.md`, `DEPLOY.md` y `evidencia/`. Es el cierre del TP.

## What Changes

- Se prepara el repositorio Git con `frontend/`, `backend/`, `README.md`, `DEPLOY.md` y `evidencia/`, y un `.gitignore` raíz que excluye `.env`, entornos virtuales y cachés.
- Se crea el servicio `backend` en Easypanel (Build Path `/backend`, `DATABASE_URL` con `postgresql+asyncpg`, sin dominio público) y se cargan los datos de prueba.
- Se crea el servicio `frontend` (Build Path `/frontend`, `API_UPSTREAM=<proyecto>_backend:8000`, dominio HTTPS al puerto 80).
- Se ejecutan los casos G-01 a G-07 desde la URL pública y se guarda la evidencia.
- Se completan `README.md` (grupo, ejecución local, carga de datos) y `DEPLOY.md` (URL, revisión, rutas de build, puertos, proxy, variables, migraciones, carga inicial, actualización).
- Se arma el ZIP de entrega sin `.env`, credenciales ni dependencias instaladas.

## Capabilities

### New Capabilities

- `despliegue`: publicación en Easypanel, verificación pública y documentación de entrega.

### Modified Capabilities

- Ninguna.

## Impact

- **Repositorio:** `.gitignore` raíz, `README.md`, `DEPLOY.md`, `evidencia/`.
- **Infraestructura:** dos servicios App y una base PostgreSQL en el proyecto de Easypanel del grupo.
- **Depende de:** todos los changes anteriores, en especial `08-docker-frontend` y `09-backend-alembic`.
- **Necesita del grupo:** acceso al panel de Easypanel, la base PostgreSQL asignada, el nombre del proyecto y un repositorio Git accesible desde Easypanel.
