# Despliegue en Easypanel — Librería ABC

> Documento de referencia para reproducir y actualizar el despliegue del TP.
> Completar los campos marcados con `<...>` con los valores reales del panel.

## 1. Datos del despliegue

| Campo | Valor |
|---|---|
| Proyecto Easypanel | `<PROYECTO>` (p. ej. `app_grupo3`) |
| Servicio backend | `<PROYECTO>_backend` (p. ej. `app_grupo3_libreria_backend`) |
| Servicio frontend | `<PROYECTO>_frontend` (p. ej. `app_grupo3_libreria_frontend`) |
| Base PostgreSQL | `<BASE>` (p. ej. `db_libreria`) |
| URL pública | `https://<DOMINIO>` |
| Repositorio Git | `https://github.com/4Angy/global_prog3_libreria.git` (rama `master`) |
| Revisión desplegada | `<COMMIT>` |
| Fecha de despliegue | `<FECHA>` |

## 2. Estructura del repositorio

Easypanel construye cada servicio desde una carpeta del repositorio (Build Path):

```
global_prog3_libreria/   <- raíz del repo (Easypanel clona esto)
  tpi/
    frontend/            <- Build Path del frontend
      Dockerfile
      .dockerignore
      default.conf.template
      public/
        index.html, css/, js/, img/
    backend/             <- Build Path del backend
      Dockerfile
      .dockerignore
      alembic.ini
      migrations/
      app/
      scripts/
      requirements.txt
```

- Frontend: Build Path `/tpi/frontend`.
- Backend: Build Path `/tpi/backend`.

## 3. Servicio backend

- **Tipo:** App (Dockerfile).
- **Build Path:** `/tpi/backend`.
- **Dominio público:** ninguno (si Easypanel asigna uno automático, quitarlo).
- **Variables de entorno:**
  - `DATABASE_URL=postgresql+asyncpg://<usuario>:<password>@<host>:<puerto>/<base>`
  - `SQL_ECHO=false`
- **Comportamiento al arrancar:** el `Dockerfile` ejecuta `alembic upgrade head` y, si la
  migración es correcta, inicia Uvicorn en `0.0.0.0:8000`. Si la migración falla, el
  contenedor termina sin iniciar la API.
- **Carga inicial de datos (una sola vez):** desde el Shell del servicio backend:
  `python scripts/datos_iniciales.py`. El script no escribe si la base ya tiene datos de
  dominio.
- **Base ya creada con `create_all`:** si la base existente no está marcada por Alembic,
  ejecutar una sola vez `alembic stamp head` desde el Shell antes de redesplegar; o bien
  recrear la base para que `alembic upgrade head` la cree desde cero.

## 4. Servicio frontend

- **Tipo:** App (Dockerfile).
- **Build Path:** `/tpi/frontend`.
- **Variable de entorno:** `API_UPSTREAM=<proyecto>_backend:8000` (nombre interno del
  backend en la red de Easypanel, sin esquema ni barra final).
- **Dominio:** HTTPS → puerto 80 (el que se usa para la entrega).
- **Proxy:** Nginx reenvía `/api/...` a `http://${API_UPSTREAM}/...`, quitando el
  prefijo `/api`.

## 5. Variables de entorno

| Servicio | Variable | Valor |
|---|---|---|
| backend | `DATABASE_URL` | `postgresql+asyncpg://...` |
| backend | `SQL_ECHO` | `false` |
| frontend | `API_UPSTREAM` | `<proyecto>_backend:8000` |

Nunca se versionan `.env` ni credenciales: se cargan en el entorno privado del servicio.

## 6. Migraciones

- Base nueva: `alembic upgrade head` (el contenedor lo ejecuta al arrancar).
- Base existente creada con `create_all`: `alembic stamp head`.
- Verificar: `alembic current` muestra la revisión activa y `alembic check` no detecta
  diferencias con los modelos.

## 7. Actualización

1. Hacer push del código al repositorio.
2. En Easypanel, redesplegar el servicio `backend` (y, si cambió el frontend, el
   `frontend`).
3. Revisar los logs: la migración debe aplicarse y Uvicorn debe iniciar.
4. Verificar `https://<DOMINIO>/api/health/ready` (200) y el catálogo.

## 8. Verificación (casos G-01 a G-07)

| Caso | Pasos | Resultado esperado | Resultado observado | Evidencia |
|---|---|---|---|---|
| G-01 | Abrir `https://<DOMINIO>/` y revisar el catálogo | Listado con libros, búsqueda y paginación, sin errores en consola | | `evidencia/G-01-catalogo.png` |
| G-02 | Alta de un libro con autorías | 201 y fila en la tabla de la sesión | | `evidencia/G-02-alta-libro.png` |
| G-03 | Alta de un cliente y búsqueda por ID | 201 con ID y resultado de la búsqueda | | `evidencia/G-03-alta-cliente.png` |
| G-04 | Registrar una venta de dos renglones y reabrir el detalle tras recargar | Comprobante con importes de la API y detalle idéntico tras recargar | | `evidencia/G-04-venta-historial.png` |
| G-05 | `PATCH /libros/{id}` con nuevo precio y reabrir el detalle | El detalle conserva el precio unitario y el total originales | | `evidencia/G-05-precio-historico.png` |
| G-06 | Venta con cliente o libro inexistente (409) y renglones repetidos (422) | Mensaje del servidor y borrador intacto | | `evidencia/G-06-rechazo.png` |
| G-07 | Redesplegar ambos servicios y reabrir una venta ya registrada | Datos presentes, HTTPS, salud 200 | | `evidencia/G-07-persistencia.png` |

## 9. Diagnóstico

| Síntoma | Causa probable | Acción |
|---|---|---|
| 502 en `/api/...` | El backend no está corriendo o `API_UPSTREAM` no coincide con el nombre interno | Revisar el nombre del servicio backend en Easypanel y los logs |
| `/health/ready` responde 503 | El backend no llega a la base | Revisar `DATABASE_URL` y que la base esté asignada |
| Tablas que no existen / error de migración | La base no se migró | Ejecutar `alembic upgrade head` o `alembic stamp head` desde el Shell |
| El catálogo no carga | Error de proxy o CORS | Verificar `default.conf.template` y `API_UPSTREAM` |
| Imagen que no se construye | Dependencia faltante o Build Path incorrecto | Revisar Build Path (`/tpi/frontend`, `/tpi/backend`) y el Dockerfile |

## 10. Entrega

- ZIP con `frontend/`, `backend/`, `README.md`, `DEPLOY.md` y `evidencia/`.
- El ZIP no debe contener `.env`, `.venv`, `node_modules` ni credenciales.