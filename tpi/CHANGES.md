# CHANGES — Secuencia de Implementación

> Índice canónico de todos los changes del proyecto **Librería web integrada — TP Global Programación III (grupo Super logicas)**.
> Cada change es atómico: un agente puede implementarlo en una sesión (~4-6 horas).
> **Leer este archivo antes de ejecutar cualquier `/opsx:propose`.**
>
> Los 10 changes ya existen como propuestas OpenSpec en `openspec/changes/`. El código `C-NN` coincide con el prefijo de la carpeta: `C-01` ↔ `01-cliente-http`, …, `C-10` ↔ `10-despliegue-easypanel`. **Los nombres de carpeta no se renombran, no se crean changes nuevos y no se borra ninguno.**

---

## Cómo usar este documento

1. Identificar el change a implementar y verificar que **todas** sus dependencias estén implementadas y archivadas en `openspec/changes/archive/` (hoy esa carpeta está vacía: los 10 changes están pendientes).
2. Leer los archivos de la knowledge-base indicados en **Leer antes** de cada change.
3. Ejecutar `/opsx:propose <nombre-del-change>` usando el nombre exacto de la carpeta (`01-cliente-http`, `02-catalogo-listado`, …).
4. Al terminar y verificar las tareas, archivar con `/opsx:archive <nombre-del-change>`.
5. Marcar el checkbox `[x]` en la sección de ese change en este archivo.

> Convención de lectura: `C-NN` es el identificador operativo; el string entre backticks es el nombre real de la carpeta OpenSpec.

---

## Árbol de dependencias

```
C-01 01-cliente-http                       ← base del frontend: api.js + proxy Nginx
  ├── C-02 02-catalogo-listado             ← aporta formato.js a todas las pantallas
  │     ├── C-03 03-catalogo-detalle ─────┐
  │     ├── C-04 04-alta-libros ──────────┤
  │     ├── C-05 05-alta-clientes ────────┤
  │     └── C-06 06-ventas ───────────────┤
  │                                       ▼
  │                            C-07 07-historial-ventas
  │                            (borra los scripts del Parcial 1)
  │                                       │
  │                                       ▼
  │                            C-08 08-docker-frontend
  │                                       │
  └── C-09 09-backend-alembic ────────────┤   (independiente del frontend)
                                          ▼
                               C-10 10-despliegue-easypanel
```

Notas del grafo:

- `C-04` y `C-05` comparten `frontend/public/js/validaciones.js`: **no deben ejecutarse en simultáneo**. `C-05` arranca cuando `C-04` termina de tocar ese archivo.
- `C-05` se declara dependiente de `C-01` en su `proposal.md`, pero su tarea 1.1 carga `formato.js`, que nace en `C-02`: la dependencia real es `C-01 + C-02`.
- `C-09` solo toca `backend/` y la base: puede adelantarse en paralelo al frente frontend (GATE 1). Es obligatorio para `C-10`.
- `C-08` depende duro de `C-01` (`default.conf.template`); se ejecuta después de `C-07` para verificar todas las pantallas dentro de la imagen y para mover el logo una sola vez.

### Paralelismo por fase

> Cada GATE es un punto de sincronización. Los changes de un mismo GATE pueden ejecutarse en paralelo **salvo la restricción de archivos compartidos anotada**.

```
GATE 0: ninguna
  → C-01 01-cliente-http                    [Agente A]   (solo: agrega api.js a las 5 páginas)

GATE 1: C-01 ✓                              ← PRIMER FORK (2 ramas)
  → C-02 02-catalogo-listado                [Agente A]
  → C-09 09-backend-alembic                 [Agente B]   (no depende del frontend)

GATE 2: C-02 ✓                              ← FORK (3 en paralelo)
  → C-03 03-catalogo-detalle                [Agente A]
  → C-04 04-alta-libros                     [Agente B]   (toca validaciones.js)
  → C-06 06-ventas                          [Agente C]
  → C-05 05-alta-clientes                   [espera: comparte validaciones.js con C-04]

GATE 3: C-04 ✓
  → C-05 05-alta-clientes                   [Agente C]   (validaciones.js ya libre)

GATE 4: C-02 + C-03 + C-04 + C-05 + C-06 ✓  ← PRIMER GATE DE LIMPIEZA
  → C-07 07-historial-ventas                [Agente A]   (borra los scripts del Parcial 1)

GATE 5: C-07 ✓ + C-09 ✓
  → C-08 08-docker-frontend                 [Agente B]   (imagen con las 5 pantallas migradas)

GATE 6: C-08 ✓
  → C-10 10-despliegue-easypanel            [Agente B]   (requiere panel y repo: ver riesgos)
```

### Camino crítico (6 changes — mínimo irreducible)

```
C-01 → C-02 → C-06 → C-07 → C-08 → C-10
```

- `C-06` representa el conjunto `C-03/C-04/C-05/C-06`: **todos** deben terminar antes de `C-07`, porque `C-07` borra los scripts que esas cuatro pantallas dejan de usar. Cualquiera de los cuatro puede escribirse en ese lugar de la cadena.
- `C-09` es obligatorio para `C-10`, pero su cadena (`C-01 → C-09 → C-10`) es mucho más corta: corre en paralelo desde el GATE 1 y **no** extiende el camino crítico. Si se atrasa, pasa a ser el cuello de botella de `C-10`.
- `C-08` y `C-09` son ambos imprescindibles para `C-10`; el camino crítico pasa por `C-08` porque arrastra la cadena frontend completa.

### Plan óptimo con 3 agentes

> En este proyecto el backend ya existe (Parcial 2); el trabajo pesado es frontend. Se reasigna el rol de los agentes al dominio real, manteniendo los 3 carriles.

```
Paso │ Agente A (Catálogo y altas)      │ Agente B (Backend e infraestructura) │ Agente C (Ventas e historial)
─────┼──────────────────────────────────┼──────────────────────────────────────┼──────────────────────────────
  1  │ C-01 01-cliente-http             │ —                                    │ —
  2  │ C-02 02-catalogo-listado         │ C-09 09-backend-alembic              │ —
  3  │ C-03 03-catalogo-detalle         │ C-04 04-alta-libros                  │ C-06 06-ventas
  4  │ —                                │ —                                    │ C-05 05-alta-clientes
  5  │ C-07 07-historial-ventas         │ — (corre backend/test/)              │ —
  6  │ —                                │ C-08 08-docker-frontend              │ —
  7  │ —                                │ C-10 10-despliegue-easypanel         │ —
```

---

## FASE 0 — Base del frontend y servidor local

### [C-01] `01-cliente-http`
- **Estado**: `[x]` archivado el 2026-11-15 (`openspec/changes/archive/2026-11-15-01-cliente-http`); spec sincronizada a `openspec/specs/cliente-http/spec.md`
- **Scope**: Cliente HTTP único y proxy Nginx de mismo origen (US-001, Ej. 1)
  - Nuevo `frontend/public/js/api.js`: `API_BASE = "/api"`, `Api.get(ruta, params)`, `Api.post(ruta, cuerpo)`, `Api.patch(ruta, cuerpo)` sobre una función interna `pedir`; la ruta se concatena sin agregar ni quitar barras.
  - `ErrorApi { estado, mensaje, esConexion }`: extrae `detail` (texto o lista de `msg` de 422), texto genérico por estado si el cuerpo no es JSON y `estado: 0 / esConexion: true` ante `fetch` rechazado.
  - Query con `URLSearchParams`: omite `null`, `undefined` y `""`; codifica el resto.
  - Nuevo `frontend/default.conf.template` con `location /api/ { proxy_pass http://${API_UPSTREAM}/; }` y `NGINX_ENVSUBST_FILTER=^API_UPSTREAM$`; sirve `public/` en el puerto 80.
  - Cargar `<script src="js/api.js">` en `index.html`, `libros.html`, `clientes.html`, `ventas.html` e `historial.html` antes de los demás scripts; ninguna pantalla usa todavía el cliente.
  - Nuevo `README.md` raíz: PostgreSQL 16, backend en `:8000`, `scripts/datos_iniciales.py` y Nginx con volúmenes (`docker run … -e API_UPSTREAM=host.docker.internal:8000`).
  - Verificación manual: `GET /api/health/ready` = 200 detrás del proxy; `Api.get("/libros/", {limit: 2})`, 404/422/502 y `esConexion` con backend y Nginx detenidos.
  - Sin migraciones ni cambios de backend.
- **Dependencias**: ninguna
- **Governance**: MEDIO
- **Leer antes**:
  - `knowledge-base/02_descripcion_general.md` §API REST (contrato usado por el frontend)
  - `knowledge-base/05_reglas_de_negocio.md` §RN-HT
  - `knowledge-base/07_flujos_principales.md` §Flujo 1
  - `knowledge-base/08_arquitectura_propuesta.md` §Patrones y §Estructura de directorios
  - `knowledge-base/09_decisiones_y_supuestos.md` §DD-01 y §DD-02

---

## FASE 1 — Catálogo (Ej. 1)

### [C-02] `02-catalogo-listado`
- **Estado**: `[ ]` pendiente
- **Scope**: Listado, búsqueda y paginación del catálogo contra la API (US-002, G-01)
  - Nuevo `frontend/public/js/formato.js`: `formatearPrecio` (acepta número o texto decimal, formato `es-AR`/ARS) y `TEXTO_SIN_GENERO`; se quitan de `catalogo.js` y se carga primero en las otras cuatro páginas.
  - Nuevo `frontend/public/js/vista-catalogo.js` con estado `{ titulo, offset, limit: 20 }` y descarte de respuestas viejas por número de petición.
  - `index.html`: quitar selector de criterio, rango de precio y columna «Autores»; agregar «Cargando…», error con «Reintentar», «Anterior»/«Siguiente»; cargar solo `formato.js`, `api.js` y `vista-catalogo.js` (sin `datos.js`, `persistencia.js` ni `inicio.js`).
  - `GET /libros/?titulo&limit=20&offset`: búsqueda parcial sin distinguir mayúsculas; cambiar o borrar el filtro reinicia `offset` a 0.
  - Columnas: título, ISBN, precio, editorial y género («Sin clasificar» si es `null`); celdas con `textContent`.
  - Cuatro estados: cargando, catálogo vacío, búsqueda sin coincidencias y error de conexión; «Siguiente» habilitado solo si `recibidos === limit`.
  - README: documentar que se quitaron los filtros del Parcial 1 y por qué.
  - Sin migraciones ni endpoints nuevos.
- **Dependencias**: C-01
- **Governance**: BAJO
- **Leer antes**:
  - `knowledge-base/06_funcionalidades.md` §US-002
  - `knowledge-base/07_flujos_principales.md` §Flujo 1
  - `knowledge-base/05_reglas_de_negocio.md` §RN-CA
  - `knowledge-base/04_modelo_de_datos.md` §Representación en la API
  - `knowledge-base/09_decisiones_y_supuestos.md` §DD-03 y §DD-04

---

### [C-03] `03-catalogo-detalle`
- **Estado**: `[ ]` pendiente
- **Scope**: Detalle de libro con autores, rol y orden (US-003, G-01)
  - `index.html`: columna «Detalle» y panel oculto `#catalogo-detalle` con datos, lista de autores, mensaje de error y «Cerrar detalle».
  - `vista-catalogo.js`: botón «Ver detalle» que consulta `GET /libros/{id}`; muestra título, ISBN, precio, stock, editorial, género y `autores[] {autor {id, nombre}, rol, orden}` ordenados por `orden`; «Sin autores» si la lista viene vacía.
  - Un error del detalle (404 o red) se muestra en el panel y **no** vacía la tabla.
  - El panel se cierra al buscar, al cambiar de página y con «Cerrar detalle»; el foco vuelve al botón que lo abrió.
  - Verificación manual: libro con dos autores, libro sin autores, `id` inexistente desde consola.
  - Sin migraciones ni cambios de backend.
- **Dependencias**: C-02
- **Governance**: BAJO
- **Leer antes**:
  - `knowledge-base/06_funcionalidades.md` §US-003
  - `knowledge-base/07_flujos_principales.md` §Flujo 2
  - `knowledge-base/04_modelo_de_datos.md` §libro_autor y §Representación en la API
  - `knowledge-base/05_reglas_de_negocio.md` §RN-CA-04 y §RN-CA-05

---

## FASE 2 — Altas (Ej. 2)

### [C-04] `04-alta-libros`
- **Estado**: `[ ]` pendiente
- **Scope**: Alta de libros con editorial, género y autorías verificadas (US-004, G-02)
  - `libros.html`: campo «Stock»; reemplazar el selector múltiple de autores por «ID del autor» + «Rol» + «Buscar y agregar» + lista de autorías; renombrar la tabla a «Libros registrados en esta sesión» con columna «Stock»; cargar `formato.js`, `api.js`, `validaciones.js` y `vista-libros.js`, sin scripts del estado local.
  - Nuevo `frontend/public/js/vista-libros.js`: `GET /editoriales/?limit=100` y `GET /generos/?limit=100` en paralelo; si falla alguno, error con «Reintentar» y botón «Registrar libro» deshabilitado.
  - Autorías: verificar con `GET /autores/{id}` (404 → mensaje), rechazar repetidos, quitar y renumerar `orden` (posición 1..N); rol ∈ {autor, coautor, traductor, ilustrador}.
  - `validaciones.js`: `validarLibro(datos)` sin contexto local; valida título, ISBN, `precio > 0`, `stock ≥ 0`, editorial y ≥ 1 autoría. Los duplicados los decide la API.
  - `POST /libros/` con `{isbn, titulo, precio, stock, editorial_id, genero_id, autores:[{autor_id, rol, orden}]}` y botón deshabilitado durante el envío; 201 muestra el libro y agrega la fila; 409 (ISBN repetido o referencia inexistente) y 422 muestran `detail` sin perder datos.
  - README: documentar selectores por listado (`limit=100`) y autores por ID.
  - Sin migraciones ni cambios de backend.
- **Dependencias**: C-01, C-02 (`formato.js`)
- **Governance**: MEDIO
- **Leer antes**:
  - `knowledge-base/06_funcionalidades.md` §US-004
  - `knowledge-base/07_flujos_principales.md` §Flujo 3
  - `knowledge-base/05_reglas_de_negocio.md` §RN-LI
  - `knowledge-base/04_modelo_de_datos.md` §libro y §libro_autor
  - `knowledge-base/10_preguntas_abiertas.md` §IN-03 (autorías vacías)

---

### [C-05] `05-alta-clientes`
- **Estado**: `[ ]` pendiente
- **Scope**: Alta de clientes y búsqueda por ID (US-005, G-03)
  - `clientes.html`: tabla «Clientes registrados en esta sesión» con columna «ID»; sección «Buscar cliente por ID» con resultado y mensaje de error; cargar `formato.js`, `api.js`, `validaciones.js` y `vista-clientes.js`, sin scripts locales.
  - Nuevo `frontend/public/js/vista-clientes.js`: `POST /clientes/` con email normalizado (recorte + minúsculas) y botón deshabilitado; 201 muestra el `id`, agrega la fila y limpia el formulario.
  - `validarCliente(datos)` sin contexto local: nombre no vacío y email con formato válido; el email repetido lo decide la API.
  - 409 «Ya existe un cliente con ese correo.» y 422 muestran `detail` y conservan los datos.
  - Búsqueda con `GET /clientes/{id}`: muestra nombre y email; 404 y texto no numérico con mensaje propio.
  - README: documentar que la API no tiene listado y por eso se busca por ID.
  - Sin migraciones ni cambios de backend. La tabla de sesión se pierde al recargar (los clientes quedan en la API).
- **Dependencias**: C-01, C-02 (`formato.js`)
- **Governance**: BAJO
- **Leer antes**:
  - `knowledge-base/06_funcionalidades.md` §US-005
  - `knowledge-base/07_flujos_principales.md` §Flujo 4
  - `knowledge-base/05_reglas_de_negocio.md` §RN-CL
  - `knowledge-base/04_modelo_de_datos.md` §cliente y §perfil_cliente
  - `knowledge-base/09_decisiones_y_supuestos.md` §DD-05

---

## FASE 3 — Ventas e historial (Ej. 3)

### [C-06] `06-ventas`
- **Estado**: `[ ]` pendiente
- **Scope**: Registro de venta con borrador en memoria y comprobante (US-006, G-04/G-06)
  - `ventas.html`: «ID del cliente» + «Buscar» con nombre encontrado; «Buscar libro por título» con selector de resultados; columna «Precio de catálogo» y «Total estimado» en el borrador; tarjeta de comprobante oculta; cargar `formato.js`, `api.js`, `validaciones.js` y `vista-ventas.js`.
  - Nuevo `frontend/public/js/vista-ventas.js`: reutiliza la lógica de borrador de `ventas.js` pero cada renglón guarda `{libroId, titulo, precioReferencia, cantidad}` tomado de la búsqueda, sin leer estado local.
  - Cliente por ID: `GET /clientes/{id}`; queda elegido solo con 200 y se deselecciona al cambiar el ID.
  - Libros por título: `GET /libros/?titulo=…&limit=10`; agregar suma cantidad si el libro ya está (un renglón por libro); cambiar cantidad y quitar renglones.
  - Validación local: cliente elegido, ≥ 1 renglón y cantidades enteras positivas.
  - `POST /ventas/` con cuerpo exacto `{cliente_id, renglones:[{libro_id, cantidad}]}`, sin precio ni total; botón deshabilitado con «Registrando…».
  - 201: comprobante con precios unitarios, subtotales y total **de la respuesta**, enlace `historial.html?venta={id}`, limpieza del borrador. 409/422: mensaje del servidor y borrador intacto.
  - Sin migraciones; no descuenta stock (RN-VE-11).
- **Dependencias**: C-01, C-02 (`formato.js`)
- **Governance**: MEDIO
- **Leer antes**:
  - `knowledge-base/06_funcionalidades.md` §US-006
  - `knowledge-base/07_flujos_principales.md` §Flujo 5
  - `knowledge-base/05_reglas_de_negocio.md` §RN-VE
  - `knowledge-base/04_modelo_de_datos.md` §venta y §renglon_venta
  - `knowledge-base/09_decisiones_y_supuestos.md` §DD-07

---

### [C-07] `07-historial-ventas`
- **Estado**: `[ ]` pendiente
- **Scope**: Historial paginado, detalle con importes históricos y limpieza del Parcial 1 (US-007, G-04/G-05)
  - `historial.html`: quitar columna «Cliente» del listado; «Cargando…», error con «Reintentar», «Anterior»/«Siguiente»; email en el detalle; cargar `formato.js`, `api.js` y `vista-historial.js`.
  - Nuevo `frontend/public/js/vista-historial.js`: `GET /ventas/?limit=20&offset`, «Siguiente» si `recibidos === limit`; tabla con número, fecha y total.
  - Detalle con `GET /ventas/{id}`: fecha local desde ISO UTC, cliente «nombre (email)», renglones con `precio_unitario` y `subtotal`, y total formateados con `formatearPrecio` sobre los textos de la API (sin recalcular).
  - Parámetro `?venta={id}`: si es entero positivo, abre el detalle además de cargar el listado (enlace del comprobante y verificación tras recargar).
  - Limpieza: borrar `datos-iniciales.js`, `persistencia.js`, `datos.js`, `inicio.js`, `catalogo.js`, `altas.js`, `ventas.js` e `historial.js` tras comprobar con una búsqueda que ninguna página los referencia; quitar de `validaciones.js` las funciones `existe…En`.
  - Verificación G-05: registrar venta, `PATCH /libros/{id}` con nuevo precio y comprobar que el detalle no cambia; G-04 tras recargar.
  - Sin migraciones ni cambios de backend.
- **Dependencias**: C-02, C-03, C-04, C-05, C-06 (borra scripts que esas pantallas dejan de usar)
- **Governance**: MEDIO
- **Leer antes**:
  - `knowledge-base/06_funcionalidades.md` §US-007
  - `knowledge-base/07_flujos_principales.md` §Flujo 6
  - `knowledge-base/05_reglas_de_negocio.md` §RN-VE-05, §RN-VE-07 y §RN-VE-08
  - `knowledge-base/04_modelo_de_datos.md` §venta y §renglon_venta
  - `knowledge-base/09_decisiones_y_supuestos.md` §DD-07

---

## FASE 4 — Imagen del frontend y migraciones (Ej. 4 y Ej. 5)

> `C-08` depende del frente frontend; `C-09` solo del backend y **puede adelantarse al GATE 1**.

### [C-08] `08-docker-frontend`
- **Estado**: `[ ]` pendiente
- **Scope**: Imagen Nginx del frontend y verificación local del proxy (US-008)
  - Nuevo `frontend/Dockerfile` textual de la consigna: `FROM nginx:1.30-alpine`, `ENV NGINX_ENVSUBST_FILTER=^API_UPSTREAM$`, `COPY default.conf.template /etc/nginx/templates/default.conf.template`, `COPY public/ /usr/share/nginx/html/`, `EXPOSE 80`.
  - Nuevo `frontend/.dockerignore` con las entradas de la consigna.
  - Mover `frontend/public/logo.png` → `frontend/public/img/logo.png` y actualizar el `src` en las cinco páginas.
  - README: `docker build -t libreria-frontend .` y `docker run --rm -p 127.0.0.1:8080:80 -e API_UPSTREAM=host.docker.internal:8000 libreria-frontend`; dejar el comando con volúmenes como opción de desarrollo.
  - Verificación manual: `/api/health/ready` = 200, catálogo y detalle dentro de la imagen, 502 con el backend detenido.
  - Sin migraciones ni cambios de backend.
- **Dependencias**: C-01 (duro); C-07 (blando: la imagen se puede construir antes, pero la verificación completa se hace con las 5 pantallas migradas)
- **Governance**: BAJO
- **Leer antes**:
  - `knowledge-base/02_descripcion_general.md` §Arquitectura general y §Stack
  - `knowledge-base/08_arquitectura_propuesta.md` §Estructura de directorios
  - `knowledge-base/07_flujos_principales.md` §Flujo 7
  - `knowledge-base/05_reglas_de_negocio.md` §RN-DE-02
  - `knowledge-base/09_decisiones_y_supuestos.md` §DD-02

---

### [C-09] `09-backend-alembic`
- **Estado**: `[ ]` pendiente
- **Scope**: Versionado del esquema con Alembic y arranque del contenedor migrado (US-009)
  - `backend/requirements.txt`: agregar `alembic`; `alembic init -t async migrations`.
  - `migrations/env.py` asincrónico: `get_settings().database_url`, `import_model_modules()` y `target_metadata = SQLModel.metadata`; `alembic.ini` sin URL; agregar `import sqlmodel` al template para los tipos `AutoString`.
  - Migración inicial autogenerada y revisada a mano sobre base vacía: 9 tablas (`editorial`, `genero`, `autor`, `libro`, `libro_autor`, `cliente`, `perfil_cliente`, `venta`, `renglon_venta`), FK, `UNIQUE` (`libro.isbn`, `cliente.email`, `perfil_cliente.cliente_id`), `CHECK` nombrados (`ck_libro_precio_positivo`, `ck_libro_stock_no_negativo`, etc.), índices de FK y `ON DELETE CASCADE` en `renglon_venta.venta_id`.
  - `app/main.py`: quitar `SQLModel.metadata.create_all` del `lifespan`; el arranque solo crea motor y fábrica de sesiones.
  - `backend/Dockerfile`: `CMD ["sh", "-c", "alembic upgrade head && exec uvicorn app.main:app --host 0.0.0.0 --port 8000"]`, conservando Alpine, usuario `app` y `HEALTHCHECK`.
  - `backend/.dockerignore`: sumar `.venv`, `__pycache__`, `.pytest_cache`, `.env`, `.env.*`, `.git`.
  - Documentación: `backend/README.md` y `tpi/README.md` con `alembic upgrade head` (base nueva) y `alembic stamp head` (base ya creada con `create_all`).
  - Tests esperados: `alembic current`, `alembic upgrade head`, `alembic check`, comparación `pg_dump --schema-only` contra una base creada con `create_all`, `/health/ready` = 200 sobre base migrada, `scripts/datos_iniciales.py` sobre base migrada y **corrida completa de `backend/test/*.py`** (17 archivos del Parcial 2) para detectar regresiones.
  - Sin cambios de frontend.
- **Dependencias**: ninguna funcional (backend y PostgreSQL ya existen); en el plan corre en GATE 1 y es obligatorio antes de C-10
- **Governance**: ALTO
- **Leer antes**:
  - `knowledge-base/02_descripcion_general.md` §Stack tecnológico (fila Migraciones)
  - `knowledge-base/04_modelo_de_datos.md` §Entidades
  - `knowledge-base/08_arquitectura_propuesta.md` §Patrones aplicados
  - `knowledge-base/09_decisiones_y_supuestos.md` §DD-08 y §DD-09
  - `knowledge-base/10_preguntas_abiertas.md` §IN-01

---

## FASE 5 — Despliegue en producción (Ej. 5)

### [C-10] `10-despliegue-easypanel`
- **Estado**: `[ ]` pendiente
- **Scope**: Publicación de ambos servicios, evidencia G-01..G-07 y entrega (US-010)
  - `.gitignore` raíz (`.env`, `.env.*`, `.venv`, `__pycache__`, `.pytest_cache`, `node_modules`) e inicialización/subida del repo con `frontend/`, `backend/`, `README.md`, `DEPLOY.md` y `evidencia/`; verificar con `git ls-files` que no hay `.env`.
  - Servicio Easypanel `backend`: Build Path `/backend`, Dockerfile, `DATABASE_URL=postgresql+asyncpg://…`; sin dominio público; logs con `alembic upgrade head`; salud 200 desde el Shell y carga con `python scripts/datos_iniciales.py`.
  - Servicio `frontend`: Build Path `/frontend`, `API_UPSTREAM=<proyecto>_backend:8000`, dominio HTTPS → HTTP 80; verificar `https://<dominio>/api/health/ready` = 200 y el catálogo.
  - Ejecutar G-01 a G-06 desde la URL pública y guardar capturas en `evidencia/G-0X-*.png` (pantalla + pestaña Red); G-05 con `Api.patch` desde la consola del navegador; G-07 con redespliegue de ambos servicios y venta ya registrada.
  - `README.md` (grupo, ejecución local, carga de datos) y `DEPLOY.md` (URL, revisión, rutas de build, puertos, proxy, variables, migraciones, carga inicial, actualización, tabla G-01..G-07 y diagnóstico de 502).
  - ZIP de entrega con `frontend/`, `backend/`, `README.md`, `DEPLOY.md` y `evidencia/`, sin `.env`, `.venv`, `node_modules` ni credenciales.
  - Tests esperados: checklist G-01..G-07, salud 200 por HTTPS y persistencia de datos tras redesplegar.
- **Dependencias**: C-08, C-09 (y funcionalmente C-01 a C-07)
- **Governance**: ALTO
- **Leer antes**:
  - `knowledge-base/01_vision_y_objetivos.md` §Alcance v1.0 y §Métricas de éxito
  - `knowledge-base/05_reglas_de_negocio.md` §RN-DE
  - `knowledge-base/07_flujos_principales.md` §Flujo 7
  - `knowledge-base/08_arquitectura_propuesta.md` §Seguridad y §Variables de entorno
  - `knowledge-base/09_decisiones_y_supuestos.md` §SU-01 a §SU-03

---

## Resumen

| ID | Change (carpeta real) | Fase | Depende de | Governance | Ejercicio / US |
|---|---|---|---|---|---|
| C-01 | `01-cliente-http` | 0 — Base frontend | — | MEDIO | Ej. 1 · US-001 |
| C-02 | `02-catalogo-listado` | 1 — Catálogo | C-01 | BAJO | Ej. 1 · US-002 |
| C-03 | `03-catalogo-detalle` | 1 — Catálogo | C-02 | BAJO | Ej. 1 · US-003 |
| C-04 | `04-alta-libros` | 2 — Altas | C-01, C-02 | MEDIO | Ej. 2 · US-004 |
| C-05 | `05-alta-clientes` | 2 — Altas | C-01, C-02 | BAJO | Ej. 2 · US-005 |
| C-06 | `06-ventas` | 3 — Ventas | C-01, C-02 | MEDIO | Ej. 3 · US-006 |
| C-07 | `07-historial-ventas` | 3 — Ventas | C-02, C-03, C-04, C-05, C-06 | MEDIO | Ej. 3 · US-007 |
| C-08 | `08-docker-frontend` | 4 — Imagen | C-01, C-07 (blando) | BAJO | Ej. 4 · US-008 |
| C-09 | `09-backend-alembic` | 4 — Migraciones | — | ALTO | Ej. 5 · US-009 |
| C-10 | `10-despliegue-easypanel` | 5 — Despliegue | C-08, C-09 | ALTO | Ej. 5 · US-010 |

**Primer change recomendado**: `C-02` (`02-catalogo-listado`). `C-01` ya está archivado y dejó `api.js` + el proxy de Nginx; el catálogo es la primera pantalla que lo consume.

Para arrancar: `/opsx:propose 02-catalogo-listado`

---

## Changes faltantes sugeridos

> Revisión de alcance contra `knowledge-base/` y el estado real del repo. **No faltan changes imprescindibles** para cumplir la consigna: los 10 existentes cubren las cinco épicas (US-001 a US-010). Se listan sugerencias opcionales y observaciones de estado, sin crear ni modificar nada en `openspec/`.

### Sugerencias opcionales (no bloquean la entrega)

1. **`11-verificacion-automatizada`** — suite de humo reproducible de G-01 a G-07 (por ejemplo `backend/test/` ampliado con casos de venta y un script que recorra las pantallas contra la imagen), reemplazando la verificación 100% manual. Hoy la evidencia es manual y depende de que el operador recuerde cada caso.
2. **`12-tests-backend-post-alembic`** — adaptar y dejar documentada la corrida de los 17 archivos de `backend/test/` después de quitar `create_all`. Puede resolverse como tarea extra dentro de C-09 en lugar de un change nuevo.
3. **`13-filtro-genero-catalogo`** — reactivar el filtro por `genero_id` que la API ya soporta y que quedó fuera en C-02 (pregunta abierta §IN-05). Es mejora funcional, no requisito del Global.

### Observaciones de estado actual (auditoría)

- **`backend/test/` ya tiene 17 archivos del Parcial 2** (`.py`, `.http`, `.sql`). Ninguno de los 10 `proposal.md`/`design.md` los menciona; `backend/test/rutas.py` afirma 26 rutas y habla de un «change 04» de un ciclo anterior, pero `openspec/changes/archive/` está vacío. C-09 debe correrlos antes de archivar para no romper el backend aprobado.
- **`C-05` declara depender solo de C-01**, pero su tarea 1.1 carga `formato.js`, creado en C-02: la dependencia real es C-01 + C-02 (ya reflejada en este índice).
- **`C-04` y `C-05` comparten `validaciones.js`**; el grafo y los GATES evitan ejecutarlos en paralelo.
- **`backend/` ya existe completo** (módulos autores/clientes/editoriales/generos/health/libros/ventas, Dockerfile, README y script de semilla): ningún change debe recrearlo. El único cambio de backend es C-09.
- **`frontend/` está en la versión del Parcial 1** (sin `api.js`, sin `formato.js`, sin `default.conf.template`, sin `Dockerfile`, logo en `public/logo.png`): consistente con C-01, C-02, C-08 pendientes.
- **No existen** `README.md` raíz, `DEPLOY.md`, `evidencia/` ni `.gitignore` raíz: los crean C-01 y C-10.
- **`openspec/changes/archive/` está vacío**: los 10 changes figuran como pendientes y ninguno puede asumirse archivado.
- **Dependencias externas bloqueantes de C-10**: acceso al panel de Easypanel, nombre real del proyecto/servicio backend, base PostgreSQL asignada y repositorio Git accesible (SU-01 a SU-03). No se resuelven con código; requieren confirmación de la cátedra/grupo.
- **Estado de fundación**: `.active-orchestrator-state.json` está en `version: 5` (no en v2), por lo que el contrato de estado de la skill no aplica literalmente; la sección `roadmap` se registra igual por pedido explícito del orquestador.
