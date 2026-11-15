# Librería web integrada — Instrucciones para Agentes

> Este archivo (y su copia `CLAUDE.md`) es lo PRIMERO que todo agente lee al entrar al repo.
> Generado a partir de `knowledge-base/`, `CHANGES.md` y `.atl/skill-registry.md`. Si cambiás la KB o el roadmap, regeneralo con `/active-orchestrator:rules` y re-sincronizá ambas copias.
>
> Proyecto: **TP Global Programación III — grupo Super logicas** (Herrera Julieta, Zalazar María de los Ángeles).

---

## Stack Tecnológico

| Capa | Tecnología | Versión mínima |
|---|---|---|
| Frontend | HTML, CSS y JavaScript nativos (scripts clásicos, sin módulos ni frameworks) | Navegadores actuales |
| Servidor web / proxy | Nginx (imagen oficial) | `nginx:1.30-alpine` |
| Backend | Python, FastAPI (handlers `async def`) | Python 3.12, FastAPI 0.111 |
| ORM / contratos | SQLModel, SQLAlchemy asincrónico | SQLModel 0.0.24, SQLAlchemy 2.0 |
| Driver DB | asyncpg | 0.30 |
| Base de datos | PostgreSQL | 16 |
| Configuración | python-dotenv (`.env` no versionado) | 1.0 |
| Migraciones | Alembic (pedido por el Global; aún no instalado en `backend/`) | — |
| Contenedores | Docker | 20.10 |
| Despliegue | Easypanel sobre VPS | — |

Arquitectura: navegador → **Nginx** (estáticos + proxy `/api/` → backend en la red interna) → **FastAPI** → **PostgreSQL**, todo en el mismo origen (sin CORS).
Detalle completo: [knowledge-base/02_descripcion_general.md](knowledge-base/02_descripcion_general.md).

Identidad visual: [design-system/README.md](design-system/README.md) — modo `system-only`, revisión 1 **aprobada**. `design-system/tokens.css` y `components.css` son la fuente; no se inventan estilos por pantalla.

---

## Base de Conocimiento

La fuente de verdad del dominio vive en `knowledge-base/`. **Leé el archivo relevante ANTES de implementar.**

| Archivo | Cuándo leerlo |
|---------|---------------|
| [01_vision_y_objetivos.md](knowledge-base/01_vision_y_objetivos.md) | Entender propósito, alcance por ejercicio y fuera de alcance |
| [02_descripcion_general.md](knowledge-base/02_descripcion_general.md) | Stack, arquitectura y contrato REST |
| [03_actores_y_roles.md](knowledge-base/03_actores_y_roles.md) | Actores y permisos (no hay autenticación) |
| [04_modelo_de_datos.md](knowledge-base/04_modelo_de_datos.md) | Las 9 tablas, relaciones, restricciones, semilla |
| [05_reglas_de_negocio.md](knowledge-base/05_reglas_de_negocio.md) | Reglas RN-XX codificadas |
| [06_funcionalidades.md](knowledge-base/06_funcionalidades.md) | Historias US-001 a US-010 y su change |
| [07_flujos_principales.md](knowledge-base/07_flujos_principales.md) | Flujos E2E (catálogo, altas, venta, historial, despliegue) |
| [08_arquitectura_propuesta.md](knowledge-base/08_arquitectura_propuesta.md) | Patrones, directorios, seguridad, variables de entorno |
| [09_decisiones_y_supuestos.md](knowledge-base/09_decisiones_y_supuestos.md) | DD-00 a DD-11 y supuestos SU-01 a SU-03 |
| [10_preguntas_abiertas.md](knowledge-base/10_preguntas_abiertas.md) | ⚠️ Inconsistencias IN-01 a IN-06 y preguntas priorizadas |

> ⚠️ Antes del primer change, resolver las preguntas de prioridad **Alta** de `10_preguntas_abiertas.md` (proyecto/base en Easypanel y repositorio Git). **No bloquean** C-01 a C-09: solo C-10.

---

## Skills Disponibles

Fuente de verdad: `.atl/skill-registry.md` (generado por `skill-registry`). Cargá la skill correspondiente al contexto ANTES de escribir código.

| Agente | Rol | Skills que carga |
|--------|-----|------------------|
| **Frontend** | Vistas HTML/CSS/JS nativo, estados, accesibilidad | `impeccable` |
| **Backend** | FastAPI async, SQLModel, contratos y errores | `fastapi`, `fastapi-templates`, `postgresql-table-design` |
| **Infra / Deploy** | Dockerfiles, Nginx, compose, Easypanel, Alembic | `multi-stage-dockerfile`, `docker-compose-patterns` |
| **Orquestación (SDD)** | OPSX, KB, roadmap, reglas, registry | `active-orchestrator`, `kb-creator`, `roadmap-generator`, `agents-md-generator`, `skill-registry`, `openspec-propose`, `openspec-apply-change`, `openspec-archive-change`, `openspec-explore` |

> Los compact rules de cada skill los resuelve el orquestador desde `.atl/skill-registry.md` (generado por `skill-registry`; **no versionado** — no está en el repo). Esta tabla solo mapea skill→rol.

Skills instaladas que **no aplican** a este proyecto: `java-springboot`, `cv-builder`.

---

## Roadmap de Changes

El plan de implementación completo está en [CHANGES.md](CHANGES.md). Resumen:

- **Total**: 10 changes en 6 fases (FASE 0 a FASE 5).
- **Camino crítico** (6): `C-01 → C-02 → C-06 → C-07 → C-08 → C-10` (`C-06` representa el bloque C-03/C-04/C-05/C-06, que debe cerrarse entero antes de C-07).
- **Primer change**: `C-01` (`01-cliente-http`) — es bloqueante de todo el frente frontend.
- **Fork temprano**: `C-09` (`09-backend-alembic`) corre en paralelo desde el GATE 1 porque solo toca `backend/` y la base.
- **Bloqueantes externos**: `C-10` depende de datos humanos (proyecto/base en Easypanel, nombre del backend, repo Git).

**Antes de cualquier `/opsx:propose`**: leé [CHANGES.md](CHANGES.md), verificá que las dependencias del change estén archivadas en `openspec/changes/archive/` y leé los archivos de "Leer antes".

Estado actual: los 10 changes existen como propuestas OpenSpec con `proposal.md`, `design.md`, `tasks.md` y delta specs. **Ninguno está implementado** (0 tareas tildadas).

---

## Reglas Duras

> En este entorno **no existe** `~/.claude/CLAUDE.md` ni `AGENTS.md` global, así que las reglas universales (commit/build/atribución) viven acá. Las reglas del orquestador, governance y TDD las inyecta el harness del stack. Romper cualquiera de estas reglas es un defecto, no un detalle de estilo.

### Contrato / frontend

1. **NUNCA** usar framework ni bundler (React, Vue, Vite, Webpack, `import`/ESM) → scripts clásicos con `<script src="...">` y variables globales.
2. **NUNCA** `innerHTML` con datos que vienen de la API → `textContent` o `createElement` (anti-XSS).
3. **NUNCA** llamar `fetch` suelto desde una vista → siempre `Api.get/post/patch` de `api.js`, capturando `ErrorApi` (`estado`, `mensaje`, `esConexion`).
4. **NUNCA** hardcodear la URL del backend → mismo origen, base `/api` (proxy de Nginx). Solo `API_BASE` en `api.js`.

### Backend

5. **NUNCA** handlers `def` sincrónicos → `async def` + sesión asincrónica (`AsyncSession`/`asyncpg`).
6. **NUNCA** un schema de entrada sin `extra='forbid'` → los campos no declarados se rechazan con 422.
7. **NUNCA** cambiar rutas o contratos del backend del Parcial 2 sin correr `backend/test/rutas.py` (26 rutas) y los `.http` que correspondan.
8. **NUNCA** romper el mapa de errores: 404 recurso inexistente, 409 conflicto, 422 validación, 503 `health/ready`, mensajes de error en español.

### Datos / infraestructura

9. **NUNCA** usar `create_all` como mecanismo de migración → Alembic `upgrade head` (DD-08, change C-09).
10. **NUNCA** exponer el backend con dominio público ni agregar CORS → solo red interna de Easypanel + proxy `/api/` desde Nginx.
11. **NUNCA** versionar `.env` ni secretos → `.env` fuera del repo; `.env.example` sí, con los nombres de las variables (`DATABASE_URL`, `API_UPSTREAM`).
12. **NUNCA** correr el backend como root en la imagen → usuario no-root (DD-09).

### Flujo de trabajo / commits

13. **NUNCA** commitear ni pushear sin pedido explícito del usuario.
14. **NUNCA** firmar commits con co-autoría IA (`Co-Authored-By: Claude…`) ni atribución de herramienta.
15. **SIEMPRE** conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`), en presente y sin punto final.

---

## Flujo de Trabajo

```
1. Leer la KB relevante (knowledge-base/)        → entender el dominio
2. Identificar el change en CHANGES.md           → respetar dependencias y gates
3. /opsx:propose C-NN-nombre                     → proposal + design + delta specs + tasks
4. Implementar las tasks (cargando skills)       → respetando las reglas duras
5. /opsx:archive C-NN-nombre + marcar [x]        → cerrar el change
```

Comandos útiles: `openspec list --json`, `openspec status --change "<nombre>" --json`, `openspec instructions apply --change "<nombre>" --json`.

Aplicar TODAS las reglas duras en cada paso. Ante conflicto entre la KB y este archivo, **las reglas duras prevalecen**; ante conflicto entre consignas, manda el Global (DD-00).
