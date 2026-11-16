# Tasks

## 1. Historial

- [x] 1.1 Ajustar `historial.html`: quitar la columna «Cliente» del listado; agregar «Cargando…», error con «Reintentar», «Anterior» y «Siguiente»; agregar el email al detalle; cargar `formato.js`, `api.js` y `vista-historial.js`.
- [x] 1.2 Implementar el listado paginado y sus estados. Verificar en la pestaña Red `limit=20&offset=0` y `offset=20`, historial vacío y backend detenido.
- [x] 1.3 Implementar el detalle con `GET /ventas/{id}`, el parámetro `?venta={id}` y la sincronización de la URL con `history.replaceState` (abrir agrega el parámetro, cerrar lo quita). Verificar abriendo el enlace del comprobante, abriendo desde el listado y recargando en ambos casos (G-04).
- [x] 1.4 Verificar el precio histórico: registrar una venta, cambiar el precio de un libro con `PATCH /libros/{id}` y comprobar que el detalle no cambia (G-05).

## 2. Limpieza

- [x] 2.1 Buscar en `frontend/public` referencias a `datos-iniciales.js`, `persistencia.js`, `datos.js`, `inicio.js`, `catalogo.js`, `altas.js`, `ventas.js` e `historial.js`; con cero resultados, borrarlos. Quitar de `validaciones.js` las funciones `existe…En`. Verificar las cinco páginas sin errores en consola y que `localStorage` no aparece en el código.

## Workflow follow-up

- Archivar el change con `/openspec-archive-change` cuando estén todas las tareas.
