# Flujos Principales

## Flujo 1: Consulta del catálogo
**Disparador**: apertura de `index.html` o envío del buscador. **Actor**: personal.
1. `vista-catalogo.js` muestra «Cargando…».
2. `Api.get("/libros/", {titulo, limit: 20, offset})` → Nginx `/api/libros/` → FastAPI `/libros/`.
3. FastAPI filtra con `ILIKE`, ordena por `id`, pagina y devuelve la lista.
4. La UI pinta filas con `textContent`; habilita «Siguiente» si llegaron `limit` filas.
```
Navegador → Nginx(/api/libros/) → FastAPI(/libros/) → PostgreSQL
          ←        200 [ ... ]  ←
```
**Casos de error**: lista vacía sin filtro → «catálogo vacío»; vacía con filtro → «sin coincidencias»; fallo de red o 502 → error de conexión; 422 → mensaje del servidor.

## Flujo 2: Detalle de libro
1. «Ver detalle» → `Api.get("/libros/{id}")`.
2. El panel muestra stock, editorial, género y autorías ordenadas por `orden`.
**Casos de error**: 404 o red → mensaje en el panel; la tabla queda intacta.

## Flujo 3: Alta de libro
1. Al abrir `libros.html`: `GET /editoriales/?limit=100` y `GET /generos/?limit=100` llenan los selectores.
2. Por cada autoría: `GET /autores/{id}` muestra el nombre; se elige rol y orden.
3. Validación local (título, ISBN, precio > 0, stock ≥ 0, editorial, ≥ 1 autoría).
4. `POST /libros/` con el botón deshabilitado.
**Casos de error**: 409 (ISBN repetido o referencia inexistente) y 422 → mensaje del servidor; el formulario conserva los datos.

## Flujo 4: Alta y búsqueda de cliente
1. `POST /clientes/` con nombre y email normalizado → 201 con `id`.
2. Búsqueda: `GET /clientes/{id}` → nombre y email.
**Casos de error**: 409 email repetido; 422 cuerpo inválido; 404 cliente inexistente.

## Flujo 5: Registro de venta
**Disparador**: «Confirmar venta». **Actor**: personal.
1. Cliente por ID (`GET /clientes/{id}`); libros por título (`GET /libros/?titulo=`).
2. El borrador en memoria agrega, cambia y quita renglones (un renglón por libro).
3. Validación local; botón deshabilitado.
4. `POST /ventas/ {cliente_id, renglones:[{libro_id, cantidad}]}`.
5. FastAPI verifica cliente y libros, copia `precio_unitario`, calcula subtotales y total, persiste venta y renglones en una transacción.
6. 201 → la UI muestra el comprobante con los importes recibidos, limpia el borrador y actualiza el historial.
```
UI → POST /api/ventas/ → FastAPI → SELECT libros IN (...) → INSERT venta + renglones → 201 venta
```
**Casos de error**: 409 cliente o libro inexistente; 422 renglones repetidos, cantidad inválida o campos extra → mensaje y borrador intacto.

## Flujo 6: Historial y precio histórico
1. `GET /ventas/?limit=20&offset=0` → ID, fecha, total.
2. «Ver» → `GET /ventas/{id}` → cliente, renglones, importes.
3. Verificación G-05: `PATCH /libros/{id} {"precio": ...}` y reabrir la venta: importes sin cambios.
4. Verificación de persistencia: recargar la página y reabrir la venta.

## Flujo 7: Despliegue en Easypanel
1. Push del repo con `frontend/` y `backend/`.
2. Servicio `backend`: Build Path `/backend`, Dockerfile, `DATABASE_URL`; la imagen aplica `alembic upgrade head` y levanta Uvicorn en `0.0.0.0:8000`.
3. Shell del backend: salud 200 y carga de datos ficticios (`python scripts/datos_iniciales.py`).
4. Servicio `frontend`: Build Path `/frontend`, `API_UPSTREAM=<proyecto>_backend:8000`, dominio HTTPS → puerto 80.
5. Verificar `https://<dominio>/api/health/ready` = 200 y ejecutar G-01 a G-07.
**Casos de error**: falla un COPY → Build Path o `public/`; 502 en `/api/` → `API_UPSTREAM` o backend caído; salud falla → `DATABASE_URL` o migraciones; 404 de API → prefijo o barra final.
