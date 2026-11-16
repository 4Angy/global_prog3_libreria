# Proposal

## Why

La guía de despliegue asume que `backend/` incluye `alembic.ini` y `migrations/`, y que la imagen ejecuta `alembic upgrade head` antes de iniciar la API. El backend del parcial 2 crea las tablas con `SQLModel.metadata.create_all` al arrancar y no tiene Alembic. Para seguir la guía del **Ejercicio 5** y que `DEPLOY.md` pueda documentar migraciones, el esquema pasa a manejarse con Alembic.

## What Changes

- Se agrega Alembic al backend: dependencia, `alembic.ini` y `migrations/` con un `env.py` asincrónico que lee `DATABASE_URL` de la configuración existente.
- Se agrega una migración inicial que crea el mismo esquema que hoy genera `create_all` (tablas, claves foráneas, `UNIQUE`, `CHECK` nombrados e índices).
- **BREAKING:** la API deja de crear tablas al arrancar. Una base nueva se prepara con `alembic upgrade head`; una base ya creada con `create_all` se marca con `alembic stamp head`.
- El `Dockerfile` del backend aplica `alembic upgrade head` antes de iniciar Uvicorn en `0.0.0.0:8000`.
- El `.dockerignore` del backend suma las entradas de la consigna.

## Capabilities

### New Capabilities

- `migraciones-backend`: versionado del esquema de la base con Alembic y su aplicación al desplegar.

### Modified Capabilities

- Ninguna.

## Impact

- **Backend:** `requirements.txt`, nuevo `alembic.ini`, nueva carpeta `migrations/`, `app/main.py` (sin `create_all`), `Dockerfile`, `.dockerignore`, `README.md`.
- **Scripts:** `scripts/datos_iniciales.py` sigue funcionando sobre una base migrada.
- **Frontend:** sin cambios.
