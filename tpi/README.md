# Librería ABC — frontend integrado a la API (Global · Programación III)

Frontend del Parcial 1 (HTML, CSS y JavaScript nativos) conectado a la API REST
del Parcial 2 (FastAPI + PostgreSQL), servido por Nginx con el prefijo `/api`
publicado en el mismo origen.

> El frontend ya **no se abre con `file://`**: las páginas se sirven por Nginx y
> las peticiones a `/api` viajan por el proxy al backend.

## Estructura

```
frontend/
  default.conf.template   plantilla de Nginx: estáticos + proxy /api/
  public/                 páginas, CSS, JS y la imagen del logo
    js/api.js             cliente HTTP único (API_BASE = "/api")
backend/                  API FastAPI (no se modifica en este change)
  app/                    aplicación, módulos y configuración
  scripts/                carga de datos iniciales
  requirements.txt        dependencias de Python
```

## Requisitos

- Docker 20.10+ (para PostgreSQL y para servir el frontend con Nginx).
- Python 3.12.
- Navegador actual.
- Puertos libres: `5433` (PostgreSQL), `8000` (backend) y `8080` (Nginx).

## 1. Levantar PostgreSQL

El proyecto usa PostgreSQL 16 en el contenedor `pg-libreria`, publicado en
`127.0.0.1:5433` (el puerto 5432 suele estar ocupado por otra instalación):

```bash
docker run --name pg-libreria \
  -e POSTGRES_USER=libreria \
  -e POSTGRES_PASSWORD=libreria \
  -e POSTGRES_DB=libreria \
  -p 127.0.0.1:5433:5432 \
  -d postgres:16
```

La primera vez crea la base `libreria` con el usuario y la contraseña
indicados. Las siguientes veces alcanza con:

```bash
docker start pg-libreria
```

## 2. Preparar el entorno de Python

Desde `backend/`:

```bash
python -m venv .venv
.venv\Scripts\activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

`requirements.txt` instala FastAPI (con `uvicorn`), SQLModel, SQLAlchemy
asincrónico, `asyncpg` y `python-dotenv`.

Después, copiá el archivo de ejemplo y completá la conexión:

```bash
copy env.example .env
```

`backend/.env` no se versiona. La variable obligatoria es `DATABASE_URL`, y el
driver tiene que ser `postgresql+asyncpg`:

```dotenv
DATABASE_URL=postgresql+asyncpg://libreria:libreria@127.0.0.1:5433/libreria
SQL_ECHO=false
```

## 3. Levantar el backend

Desde `backend/`, con el entorno virtual activado y `.env` creado:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Al arrancar crea las tablas que falten. La documentación interactiva queda en
<http://127.0.0.1:8000/docs>.

## 4. Cargar los datos de prueba

Con PostgreSQL en marcha y desde `backend/`, con el entorno virtual activado:

```bash
python scripts\datos_iniciales.py
```

El script crea el esquema que falte y carga editoriales, géneros, autores,
libros, clientes y ventas de la semilla del Parcial 1, todo en una sola
transacción. Si la base ya tiene datos de dominio, no escribe nada y lo informa
con código de salida 0. Se puede volver a ejecutar sin duplicar registros.

## 5. Servir el frontend con Nginx

Desde `frontend/`, con el backend en el puerto `8000`:

```bash
docker run --rm -p 127.0.0.1:8080:80 ^
  -v "%CD%\public:/usr/share/nginx/html:ro" ^
  -v "%CD%\default.conf.template:/etc/nginx/templates/default.conf.template:ro" ^
  -e NGINX_ENVSUBST_FILTER=^API_UPSTREAM$ ^
  -e API_UPSTREAM=host.docker.internal:8000 ^
  nginx:1.30-alpine
```

Sin cortes de línea:

```bash
docker run --rm -p 127.0.0.1:8080:80 -v "%CD%\public:/usr/share/nginx/html:ro" -v "%CD%\default.conf.template:/etc/nginx/templates/default.conf.template:ro" -e NGINX_ENVSUBST_FILTER=^API_UPSTREAM$ -e API_UPSTREAM=host.docker.internal:8000 nginx:1.30-alpine
```

Notas del comando:

- `NGINX_ENVSUBST_FILTER=^API_UPSTREAM$` limita la sustitución de variables a
  `API_UPSTREAM`. Sin ese filtro, la imagen de Nginx intentaría reemplazar
  también `$uri`, que es una variable propia de Nginx.
- `API_UPSTREAM` es el host y puerto del backend, sin esquema ni barra final.
  Desde el contenedor, el host se alcanza como `host.docker.internal` (Docker
  Desktop); en Docker de Linux hay que agregar
  `--add-host=host.docker.internal:host-gateway`.
- El comando está escrito para `cmd.exe`: el `^` corta la línea y `%CD%` es la
  carpeta actual. En PowerShell, usá `` ` `` para cortar la línea y `${PWD}` en
  lugar de `%CD%`.
- La plantilla montada en `/etc/nginx/templates/` se procesa al arrancar el
  contenedor y genera `/etc/nginx/conf.d/default.conf`.

Después, abrí <http://127.0.0.1:8080/>.

## 6. Verificación

Con PostgreSQL, el backend y Nginx en marcha:

| Qué se comprueba | Dirección | Resultado esperado |
|---|---|---|
| Proceso del backend vivo | <http://127.0.0.1:8000/health/live> | 200 `{"estado":"vivo"}` |
| Backend y base listos | <http://127.0.0.1:8000/health/ready> | 200 `{"estado":"listo","base":"disponible"}` |
| Proxy de Nginx hacia la API | <http://127.0.0.1:8080/api/health/ready> | 200 `{"estado":"listo","base":"disponible"}` |
| Listado de libros por el proxy | <http://127.0.0.1:8080/api/libros/> | 200 con la lista de libros |
| Página del catálogo | <http://127.0.0.1:8080/> | El catálogo con los libros de la API, sin errores en la consola |

Si `/health/ready` responde 503, el backend está vivo pero no llega a la base:
revisá `DATABASE_URL` y que el contenedor `pg-libreria` esté corriendo.

Si `/api/health/ready` responde 502, Nginx está sirviendo las páginas pero no
encuentra el backend: revisá que `uvicorn` escuche en `:8000` y que
`API_UPSTREAM` apunte a ese puerto.

## Catálogo: búsqueda y filtros

El catálogo (`frontend/public/index.html`) consulta `GET /libros/` con
`limit=20`, `offset` y, cuando hay texto, `titulo`. La búsqueda es por
coincidencia parcial del título y no distingue mayúsculas: el filtro lo
resuelve la API con `ilike`.

Se quitaron el selector de criterio (autor, género, editorial) y el rango de
precio del Parcial 1. La API solo filtra por `titulo` y `genero_id`, y filtrar
en el navegador sobre una página de 20 libros devolvería resultados
incompletos.

## Alta de libros: cómo se resolvieron los selectores

El formulario de alta (`frontend/public/libros.html`) carga las opciones al
abrir la página, en paralelo:

- **Editorial** y **género**: `GET /editoriales/` y `GET /generos/` con
  `limit=100` (el máximo que acepta la API). El género es opcional: la lista
  empieza por «Sin clasificar» y siguen los géneros de la API. Si alguna de
  las dos cargas falla, se muestra el error con un botón «Reintentar» y el
  botón «Registrar libro» queda deshabilitado hasta que las opciones lleguen.
  Con más de 100 editoriales o géneros la lista quedaría incompleta (no pasa
  con los datos de prueba).
- **Autores**: la API no expone un listado de autores, así que no hay un
  selector múltiple ni un buscador por nombre. Cada autoría se ingresa por
  **ID** y se verifica con `GET /autores/{id}` antes de agregarla: si existe,
  se muestra su nombre y se suma con el rol elegido (autor, coautor,
  traductor o ilustrador); si responde 404, se informa que el autor no existe
  y no se agrega nada; si ya está en la lista, se informa y no se repite. El
  orden de las autorías es su posición en la lista y se renumera al quitar
  una.

La validación del formulario (`validarLibro` en `js/validaciones.js`) exige
título, ISBN, precio mayor que cero (hasta dos decimales), stock entero
mayor o igual a cero, una editorial y al menos una autoría, y no consulta el
estado local: los ISBN repetidos y las referencias inexistentes los decide la
API (409/422) y el mensaje del servidor se muestra junto al formulario
conservando los datos cargados. La tabla «Libros registrados en esta sesión»
muestra los libros que devolvió el 201 del alta en esta página; el catálogo
completo está en `index.html`.

## Alta de clientes: búsqueda por ID

El formulario de alta (`frontend/public/clientes.html`) envía `POST /clientes/`
con nombre y email. La API no tiene un listado de clientes (`GET /clientes/`
no existe), así que **los clientes se buscan por ID**:

- **Alta**: con el 201 se muestra el ID asignado —hace falta para la venta—,
  el cliente se agrega a la tabla «Clientes registrados en esta sesión» y el
  formulario se limpia. El botón «Registrar cliente» queda deshabilitado
  mientras dura el envío.
- **Email repetido**: la API responde 409 «Ya existe un cliente con ese
  correo.»; el mensaje del servidor se muestra junto al formulario conservando
  los datos cargados (lo mismo ante un 422). El navegador solo exige nombre no
  vacío y formato de email (`validarCliente` en `js/validaciones.js`): la
  unicidad del correo la decide la API.
- **Búsqueda por ID**: la sección «Buscar cliente por ID» consulta
  `GET /clientes/{id}` y muestra nombre y email. El ID debe ser un entero
  positivo; si no existe, la API responde 404 «El cliente no existe.».
- La tabla de la sesión vive en memoria y se pierde al recargar la página; los
  clientes siguen en la API y se encuentran por ID.

## Uso del cliente HTTP en la consola

Con las páginas servidas en `:8080`, el cliente queda disponible como global
`Api` (definido en `frontend/public/js/api.js`):

```js
await Api.get("/libros/", { limit: 2 });       // 2 libros
await Api.get("/libros/999999");                // rechaza: ErrorApi 404
await Api.post("/clientes/", {});               // rechaza: ErrorApi 422
```

Los errores son siempre `ErrorApi` y traen `estado` (código HTTP), `mensaje`
(texto para mostrar) y `esConexion` (`true` cuando no hubo respuesta).

## Estado del change

Este README corresponde a los changes `01-cliente-http`, `02-catalogo-listado`,
`03-catalogo-detalle`, `04-alta-libros` y `05-alta-clientes`: el cliente HTTP,
el proxy, el catálogo (búsqueda, paginación y detalle) y las altas de libros y
de clientes integradas a la API. Las demás pantallas (Ventas e Historial)
siguen usando `localStorage` hasta que los changes `06` y `07` migren cada una
a la API.
