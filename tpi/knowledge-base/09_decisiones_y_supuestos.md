# Decisiones y Supuestos

## Decisiones documentadas
### DD-00 — Precedencia de la consigna Global
**Decisión**: cuando la consigna Global contradice a las de los parciales, manda el Global.
**Contexto**: definido por el grupo; el Global es la instancia que se evalúa.
**Ejemplo**: migraciones con Alembic (Global) en lugar de `create_all` (Parcial 2).
**Trade-offs aceptados**: hay que adaptar código de los parciales que ya estaba aprobado.

### DD-01 — JavaScript clásico con objeto global `Api`
**Decisión**: mantener scripts clásicos y exponer `Api` y `ErrorApi` como globales en `api.js`.
**Contexto**: el Parcial 1 usa scripts clásicos sin módulos.
**Alternativas consideradas**: migrar a módulos ES.
**Justificación**: menor cambio; respeta el orden de carga existente.
**Trade-offs aceptados**: dependencias implícitas por orden de `<script>`.

### DD-02 — Nginx como proxy de mismo origen, también en local
**Decisión**: probar siempre detrás de Nginx; el frontend deja de funcionar con `file://`.
**Contexto**: la base `/api` solo existe con el proxy.
**Alternativas consideradas**: URL absoluta del backend con CORS.
**Justificación**: es lo que pide la guía y evita CORS.
**Trade-offs aceptados**: hace falta Docker (o Nginx) para probar el frontend.

### DD-03 — Filtros del catálogo delegados a la API
**Decisión**: quitar el selector de criterio y los filtros locales por autor, editorial, género y rango de precio.
**Contexto**: la API filtra solo por `titulo` y `genero_id`; filtrar en el navegador sobre una página de 20 daría resultados incompletos.
**Alternativas consideradas**: traer todo el catálogo; mantener filtro por género vía `genero_id`.
**Justificación**: resultados correctos con paginación.
**Trade-offs aceptados**: se pierden filtros del Parcial 1 (el de género puede re-agregarse).

### DD-04 — Paginación sin total
**Decisión**: habilitar «Siguiente» cuando llega una página completa.
**Contexto**: los listados devuelven una lista sin conteo.
**Trade-offs aceptados**: puede aparecer una última página vacía.

### DD-05 — Selectores de autores y clientes por consulta individual
**Decisión**: verificar autores con `GET /autores/{id}` y buscar clientes con `GET /clientes/{id}`.
**Contexto**: el backend no expone listados de autores ni de clientes; la consigna lo permite y pide documentarlo.
**Alternativas consideradas**: agregar endpoints de listado al backend.
**Justificación**: no cambia el contrato de referencia.
**Trade-offs aceptados**: el usuario necesita conocer el ID.

### DD-06 — Al menos una autoría exigida en la UI
**Decisión**: el formulario exige ≥ 1 autoría aunque la API acepta `autores: []`.
**Justificación**: la consigna lo exige para el alta.

### DD-07 — Importes mostrados tal cual los devuelve la API
**Decisión**: la UI no recalcula subtotales ni totales confirmados.
**Justificación**: los importes históricos son responsabilidad del servidor.

### DD-08 — Alembic en un change separado
**Decisión**: agregar Alembic (change 09) con migración inicial de las nueve tablas y quitar `create_all` del lifespan; la imagen aplica `alembic upgrade head` antes de Uvicorn. Bases ya creadas con `create_all` se marcan con `alembic stamp head`.
**Contexto**: el Parcial 2 excluía migraciones; la guía del Global las asume.
**Alternativas consideradas**: mantener `create_all` y documentarlo.
**Justificación**: el Global prevalece (DD-00) y sigue la guía al pie de la letra.
**Trade-offs aceptados**: más archivos y un paso de migración en el despliegue.

### DD-09 — Mantener la imagen base `python:3.12-alpine` del backend
**Decisión**: conservar el Dockerfile del Parcial 2 (alpine, usuario sin privilegios, HEALTHCHECK) y sumarle las migraciones.
**Contexto**: la guía del Global muestra un ejemplo con `python:3.12-slim` solo «si tu backend todavía no tiene Dockerfile».
**Justificación**: el backend ya tiene Dockerfile y el Global no obliga a cambiar la base: solo pide que instale dependencias, acceda a las migraciones y escuche en `0.0.0.0:8000` (requisitos que se cumplen por DD-00).

### DD-10 — Trabajo dividido en 10 changes OpenSpec
**Decisión**: `01-cliente-http` … `10-despliegue-easypanel`, uno por funcionalidad.
**Justificación**: changes chicos, verificables y archivables por separado.

### DD-11 — Semilla del Parcial 1 en lugar del ejemplo de la consigna
**Decisión**: conservar la semilla del frontend (libro 1 = 24500.00, libro 4 = 19900.00).
**Trade-offs aceptados**: el ejemplo de venta da `68900.00` en vez de `77000.00`; se verifica la forma y la regla de cálculo.

## Supuestos inferidos
### SU-01 — Easypanel con PostgreSQL asignado
**Supuesto**: la cátedra provee un proyecto Easypanel y una base PostgreSQL (o permite crear un servicio Postgres).
**Origen**: guía del Global, pasos 6 y 7.
**Riesgo si es falso**: no se puede desplegar.
**Cómo validar**: confirmar con la cátedra el proyecto, el nombre interno y las credenciales.

### SU-02 — Nombre interno del backend `<proyecto>_backend`
**Supuesto**: Easypanel resuelve el servicio por `<proyecto>_backend`.
**Origen**: ejemplo `grupo1_backend:8000`.
**Cómo validar**: revisar el nombre interno real en el panel.

### SU-03 — Repositorio Git accesible por Easypanel
**Supuesto**: hay un repositorio con `frontend/` y `backend/` en la raíz.
**Riesgo si es falso**: no se puede usar Build Path.
**Cómo validar**: crear o elegir el repositorio antes del change 10.
