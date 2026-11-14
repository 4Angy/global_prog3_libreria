# Design

## Context

- Los modelos usan SQLModel y se registran con `app.core.registry.import_model_modules()`; `SQLModel.metadata` tiene el esquema completo: nueve tablas, `CHECK` nombrados (`ck_libro_precio_positivo`, etc.), `UNIQUE` en `libro.isbn` y `cliente.email`, `ON DELETE CASCADE` en `renglon_venta.venta_id` e índices en claves foráneas.
- `app.core.config.get_settings()` valida que `DATABASE_URL` use `postgresql+asyncpg://`.
- El `Dockerfile` actual usa `python:3.12-alpine`, un usuario sin privilegios, `HEALTHCHECK` con `wget` a `127.0.0.1:8000/health/ready` y `CMD uvicorn` directo.

## Goals / Non-Goals

**Goals:**
- Que `alembic upgrade head` sobre una base vacía deje el mismo esquema que `create_all`.
- Conservar el `Dockerfile` existente (Alpine, usuario sin privilegios, healthcheck), cambiando solo el arranque.

**Non-Goals:**
- Migraciones de datos o cambios de esquema nuevos.

## Decisions

1. **`env.py` asincrónico** (plantilla `async` de Alembic): toma la URL de `get_settings().database_url`, llama a `import_model_modules()` y usa `target_metadata = SQLModel.metadata`. `alembic.ini` no guarda la URL.
2. **Migración inicial autogenerada y revisada a mano** contra una base vacía, comparando con `pg_dump --schema-only` de una base creada con `create_all`. Se agrega `import sqlmodel` al template para los tipos `AutoString`.
3. **Quitar `create_all` del `lifespan`**: el arranque solo crea el motor y la fábrica de sesiones.
4. **Arranque del contenedor:** `CMD ["sh", "-c", "alembic upgrade head && exec uvicorn app.main:app --host 0.0.0.0 --port 8000"]`, manteniendo la base Alpine y el usuario `app`.
   *Alternativa:* el `Dockerfile` de ejemplo de la consigna (`python:3.12-slim`). Se descarta porque el existente ya cumple lo que pide la guía y es más chico.
5. **Base existente:** se documenta `alembic stamp head` para una base que ya tiene las tablas.

## Risks / Trade-offs

- [La autogeneración no detecta bien algunos `CHECK`] → Se revisan a mano y se comparan los esquemas.
- [Varios contenedores aplicando migraciones a la vez] → Easypanel corre una sola réplica del backend.
