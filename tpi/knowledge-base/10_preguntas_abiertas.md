# Preguntas Abiertas

## Inconsistencias detectadas
### IN-01 — Migraciones: `create_all` vs. Alembic
**Documento A dice** (Consigna Parcial 2): «Tampoco se evalúan las migraciones: el esquema se crea con create_all al arrancar».
**Documento B dice** (Consignas Global): `backend/` incluye `alembic.ini` y `migrations/`; se ejecuta `alembic upgrade head`.
**Impacto**: el backend actual no tiene Alembic; los pasos de la guía fallarían tal cual.
**Resolución**: manda el Global (DD-00) → change `09-backend-alembic` (DD-08).

### IN-02 — Imagen base del backend
**Documento A dice** (Parcial 2): `python:3.12-alpine`, no root, HEALTHCHECK.
**Documento B dice** (Global): ejemplo con `python:3.12-slim`, solo si no hay Dockerfile.
**Impacto**: bajo.
**Resolución**: no es contradicción; el ejemplo del Global es opcional. Se mantiene alpine y se cumplen los requisitos del Global (DD-00, DD-09).

### IN-03 — Autorías vacías
**Documento A dice** (Global): el alta lleva «al menos un autor».
**Documento B dice** (backend actual): `POST /libros/` acepta `autores: []` → 201.
**Impacto**: un cliente que no valide podría crear libros sin autor.
**Resolución**: manda el Global (DD-00): se exige en la UI (DD-06); queda abierto si además se agrega `min_length=1` en el schema.

### IN-04 — Importes del ejemplo de venta
**Documento A dice** (Parcial 2): total `77000.00` con «Rayuela» y «Respiración artificial».
**Documento B dice** (semilla): libro 1 «Cien años de soledad» 24500.00 y libro 4 «El nombre de la rosa» 19900.00 → `68900.00`.
**Resolución propuesta**: mantener la semilla (DD-11).

### IN-05 — Filtros del catálogo del Parcial 1
**Documento A dice** (Parcial 1 implementado): filtro por criterio (título, autor, editorial, género) y rango de precio.
**Documento B dice** (Global/API): búsqueda por `titulo` (y `genero_id`) con paginación.
**Resolución propuesta**: DD-03.

### IN-06 — Clientes con perfil en la semilla
La semilla crea un perfil por cliente; la interfaz del Global no muestra ni crea perfiles. Sin impacto en la consigna.

## Preguntas resueltas
- Grupo e integrantes: **Super logicas** — Herrera Julieta y Zalazar María de los Ángeles.
- Criterio ante contradicciones entre consignas: manda el Global (DD-00).

## Preguntas abiertas (priorizadas)
| Prioridad | Pregunta | Bloquea | Decisor |
|-----------|----------|---------|---------|
| Alta | ¿Cuál es el proyecto de Easypanel del grupo, el nombre interno del backend y la base PostgreSQL asignada? | Change 10 | Cátedra / grupo |
| Alta | ¿Qué repositorio Git (y rama) usará Easypanel como fuente? | Change 10 | Grupo |
| Media | ¿Se mantiene el filtro por género en el catálogo (via `genero_id`)? | Change 02 | Grupo |
| Media | ¿Se agrega `min_length=1` a `autores` en el backend además de la UI? | Change 04 | Grupo |
| Baja | ¿Se agrega una pantalla para `PATCH /libros/{id}` o G-05 se hace desde `/docs` o `.http`? | Change 07 | Grupo |
