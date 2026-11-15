# Tasks

## 1. Formato compartido

- [x] 1.1 Crear `frontend/public/js/formato.js` con `formatearPrecio` (número o texto decimal) y `TEXTO_SIN_GENERO`. Quitarlos de `catalogo.js` y cargar `formato.js` primero en `libros.html`, `clientes.html`, `ventas.html` e `historial.html`. Verificar que esas cuatro páginas se ven igual que antes y que la consola no muestra errores.

## 2. Vista del catálogo

- [x] 2.1 Ajustar `index.html`: quitar el selector de criterio, el rango de precio y la columna «Autores»; agregar el estado «Cargando…», el mensaje de error con «Reintentar» y los botones «Anterior» y «Siguiente»; cargar solo `formato.js`, `api.js` y `vista-catalogo.js`. Verificar que el HTML no referencia `datos.js`, `persistencia.js` ni `inicio.js`.
- [x] 2.2 Implementar en `vista-catalogo.js` la carga inicial, la búsqueda por título (offset a 0), la paginación y los cuatro estados, descartando respuestas viejas. Verificar en la pestaña Red: carga inicial con `limit=20&offset=0`; búsqueda en minúsculas que encuentra un título con mayúsculas; «Siguiente» con `offset=20`; búsqueda desde la página 2 vuelve a `offset=0`; búsqueda sin coincidencias; catálogo vacío (base sin libros); error con el backend detenido y «Reintentar».
- [x] 2.3 Comprobar que un título con `<b>` se muestra como texto, que un libro sin género muestra «Sin clasificar» y que la tabla sigue siendo legible a 320 px de ancho.

## 3. Documentación

- [x] 3.1 Anotar en `tpi/README.md` que el catálogo busca solo por título y que se quitaron los filtros por autor, editorial, género y precio, con el motivo.

## Workflow follow-up

- Archivar el change con `/openspec-archive-change` cuando estén todas las tareas.

## Verificación (2026-11-15)

Entorno: `pg-libreria` (postgres:16) + `tpi-backend` + `tpi-nginx` en la red `tpi-net`, con la semilla cargada (9 libros). URLs probadas por `http://localhost:8080` (origen limpio): con `127.0.0.1` el navegador servía `catalogo.js` heurísticamente desde caché y enmascaraba la carga; en la máquina de quien pruebe primero puede pasar lo mismo — el servidor devuelve los archivos correctos.

| Check | Resultado |
|---|---|
| Carga inicial | 9 libros; URL `/api/libros/?limit=20&offset=0`; «Anterior» deshabilitado |
| Búsqueda `hobbit` (minúsculas, título con mayúscula) | 1 resultado; URL `...&titulo=hobbit` |
| Búsqueda desde la página 2 | offset vuelve a 0 con `titulo` en la query |
| Borrar el texto de búsqueda | catálogo completo, `offset=0` |
| `zzzqqq` (sin coincidencias) | «No se encontraron libros para la búsqueda.», tabla vacía |
| Precio | `$ 24.500,00` (es-AR/ARS, acepta `"24500.00"` y número) |
| 20 libros (stub) | «Siguiente» habilitado; «Anterior» habilitado desde la página 2; offset conservado |
| Página avanzada vacía (stub) | «No hay más resultados.», solo «Anterior» habilitado |
| `<b>Título con marcado</b>` | mostrado como texto, sin interpretar (`textContent`) |
| Género nulo | «Sin clasificar» |
| 320 px | contenedor `.tabla-desplazable` con `overflow-x: auto` y tabla `min-width: 760px` (verificado computado; sin herramienta de viewport 320 px en el entorno) |
| Cargando | búsqueda y paginación deshabilitadas mientras la consulta está en curso |
| Respuestas viejas descartadas | búsqueda lenta seguida de una rápida muestra solo la rápida |
| Error (backend detenido + recarga) | «El servidor no está disponible en este momento.», tabla vacía, botón «Reintentar»; al reintentar con el backend activo vuelven los 9 libros |
| Consola en `libros.html`, `clientes.html`, `ventas.html`, `historial.html` | sin errores; `crearFilaLibro` definido; clientes 4 filas, historial 2 ventas |
