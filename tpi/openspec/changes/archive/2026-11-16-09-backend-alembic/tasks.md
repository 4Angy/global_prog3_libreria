# Tasks

## 1. Alembic

- [x] 1.1 Agregar `alembic` a `requirements.txt` e inicializar con la plantilla `async` (`alembic init -t async migrations`). Configurar `env.py` con `get_settings()`, `import_model_modules()` y `SQLModel.metadata`, sin URL en `alembic.ini`. Verificar `alembic current`.
- [x] 1.2 Generar la migración inicial sobre una base vacía y revisarla. Verificar `alembic upgrade head`, `alembic check` y comparar `pg_dump --schema-only` contra una base creada con `create_all`.
- [x] 1.3 Quitar `create_all` del `lifespan` de `app/main.py`. Verificar que la API arranca sobre la base migrada, que `/health/ready` responde 200 y que `scripts/datos_iniciales.py` carga los datos.

## 2. Imagen

- [x] 2.1 Cambiar el `CMD` del `Dockerfile` para aplicar `alembic upgrade head` antes de Uvicorn y sumar al `.dockerignore` las entradas de la consigna (`.venv`, `__pycache__`, `.pytest_cache`, `.env`, `.env.*`, `.git`). Verificar `docker build` y `docker run` contra una base vacía: logs con la migración y `/health/ready` 200.

## 3. Documentación

- [x] 3.1 Actualizar `backend/README.md` y `tpi/README.md`: `alembic upgrade head` para una base nueva y `alembic stamp head` para una base existente.

## Workflow follow-up

- Archivar el change con `/openspec-archive-change` cuando estén todas las tareas.
