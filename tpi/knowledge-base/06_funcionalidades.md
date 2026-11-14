# Funcionalidades

Organizadas por épica (una por ejercicio del Global) e historias US-NNN. Entre corchetes, el change OpenSpec que la implementa.

## Épica 1: Catálogo y cliente HTTP (Ej. 1 · 20 pts)
### US-001 — Cliente HTTP centralizado [01-cliente-http]
**Como** desarrollador **quiero** un único módulo `fetch` con base `/api` **para** no repetir URLs ni manejo de errores.
**Criterios de aceptación**:
- [ ] `Api.get/post/patch` conservan la barra final y codifican parámetros con `URLSearchParams`, omitiendo vacíos.
- [ ] Error uniforme con estado HTTP, mensaje del servidor y marca de error de conexión.
- [ ] `fetch("/api/health/ready")` responde 200 detrás de Nginx.
**Reglas relacionadas**: RN-HT-01..03

### US-002 — Listado, búsqueda y paginación [02-catalogo-listado]
**Como** personal **quiero** buscar libros por título y paginar **para** encontrar rápido un libro.
**Criterios de aceptación**:
- [ ] Carga inicial `GET /libros/?limit=20&offset=0`.
- [ ] Búsqueda parcial sin mayúsculas; cambiar o borrar el filtro reinicia `offset`.
- [ ] Columnas: título, ISBN, precio, editorial, género («Sin clasificar» si es nulo).
- [ ] Estados: cargando, vacío, sin coincidencias, error de conexión.
**Reglas relacionadas**: RN-CA-01..05

### US-003 — Detalle con autores [03-catalogo-detalle]
**Como** personal **quiero** ver el detalle de un libro **para** conocer sus autores, rol y orden.
**Criterios de aceptación**:
- [ ] «Ver detalle» consulta `GET /libros/{id}` y muestra stock y autorías ordenadas.
- [ ] Un error del detalle no borra la tabla.
**Reglas relacionadas**: RN-CA-04, RN-CA-05

## Épica 2: Altas (Ej. 2 · 20 pts)
### US-004 — Alta de libro [04-alta-libros]
**Como** personal **quiero** registrar un libro con sus autorías **para** sumarlo al catálogo.
**Criterios de aceptación**:
- [ ] Selectores de editorial y género desde la API; género opcional.
- [ ] Autorías por ID verificadas con `GET /autores/{id}`, con rol y orden; al menos una.
- [ ] 201 muestra el registro creado; 409 (ISBN repetido) y 422 muestran el mensaje del servidor sin perder datos.
**Reglas relacionadas**: RN-LI-01..06

### US-005 — Alta y búsqueda de cliente [05-alta-clientes]
**Como** personal **quiero** registrar clientes y recuperarlos por ID **para** usarlos en ventas.
**Criterios de aceptación**:
- [ ] `POST /clientes/` con nombre y email; 201 muestra el ID.
- [ ] Email repetido → 409 con el mensaje del servidor.
- [ ] Búsqueda por ID con `GET /clientes/{id}`.
**Reglas relacionadas**: RN-CL-01..03

## Épica 3: Ventas e historial (Ej. 3 · 25 pts)
### US-006 — Registrar venta [06-ventas]
**Como** personal **quiero** armar y confirmar una venta **para** registrarla en la base.
**Criterios de aceptación**:
- [ ] Cliente por ID; libros buscados por título; agregar, cambiar cantidad y quitar renglones.
- [ ] Un renglón por libro; cantidades enteras positivas.
- [ ] Cuerpo exacto `{cliente_id, renglones:[{libro_id, cantidad}]}`; botón deshabilitado durante el envío.
- [ ] 201 muestra precios unitarios, subtotales y total de la respuesta y limpia el borrador; 409/422 lo conservan.
**Reglas relacionadas**: RN-VE-01..11

### US-007 — Historial con importes históricos [07-historial-ventas]
**Como** personal **quiero** consultar ventas anteriores **para** verificar lo vendido.
**Criterios de aceptación**:
- [ ] `GET /ventas/` paginado (ID, fecha, total).
- [ ] `GET /ventas/{id}` con fecha, cliente, renglones e importes recibidos.
- [ ] Tras recargar y tras `PATCH` del precio de un libro, el detalle conserva sus importes.
**Reglas relacionadas**: RN-VE-05, RN-VE-07, RN-VE-08

## Épica 4: Imagen del frontend (Ej. 4 · 15 pts)
### US-008 — Dockerfile y proxy Nginx [08-docker-frontend]
**Como** grupo **quiero** construir la imagen del frontend **para** desplegarla.
**Criterios de aceptación**:
- [ ] `frontend/Dockerfile`, `.dockerignore`, `default.conf.template` y `public/` según la guía.
- [ ] `docker build` y `docker run -p 127.0.0.1:8080:80 -e API_UPSTREAM=host.docker.internal:8000`; `/api/health/ready` → 200.

## Épica 5: Despliegue (Ej. 5 · 20 pts)
### US-009 — Migraciones con Alembic [09-backend-alembic]
**Como** grupo **quiero** aplicar `alembic upgrade head` **para** seguir la guía del Global.
**Criterios de aceptación**:
- [ ] `alembic.ini` y `migrations/` con migración inicial de las nueve tablas.
- [ ] La imagen aplica migraciones antes de Uvicorn.

### US-010 — Despliegue en Easypanel y evidencia [10-despliegue-easypanel]
**Como** grupo **quiero** publicar ambos servicios **para** que la cátedra corrija desde la URL pública.
**Criterios de aceptación**:
- [ ] Servicios `backend` (`/backend`) y `frontend` (`/frontend`), `API_UPSTREAM=<proyecto>_backend:8000`, HTTPS.
- [ ] G-01 a G-07 con evidencia; `DEPLOY.md` y `README.md` completos; ZIP sin secretos.
**Reglas relacionadas**: RN-DE-01..05
