# Tasks

## 1. Formato compartido

- [ ] 1.1 Crear `frontend/public/js/formato.js` con `formatearPrecio` (número o texto decimal) y `TEXTO_SIN_GENERO`. Quitarlos de `catalogo.js` y cargar `formato.js` primero en `libros.html`, `clientes.html`, `ventas.html` e `historial.html`. Verificar que esas cuatro páginas se ven igual que antes y que la consola no muestra errores.

## 2. Vista del catálogo

- [ ] 2.1 Ajustar `index.html`: quitar el selector de criterio, el rango de precio y la columna «Autores»; agregar el estado «Cargando…», el mensaje de error con «Reintentar» y los botones «Anterior» y «Siguiente»; cargar solo `formato.js`, `api.js` y `vista-catalogo.js`. Verificar que el HTML no referencia `datos.js`, `persistencia.js` ni `inicio.js`.
- [ ] 2.2 Implementar en `vista-catalogo.js` la carga inicial, la búsqueda por título (offset a 0), la paginación y los cuatro estados, descartando respuestas viejas. Verificar en la pestaña Red: carga inicial con `limit=20&offset=0`; búsqueda en minúsculas que encuentra un título con mayúsculas; «Siguiente» con `offset=20`; búsqueda desde la página 2 vuelve a `offset=0`; búsqueda sin coincidencias; catálogo vacío (base sin libros); error con el backend detenido y «Reintentar».
- [ ] 2.3 Comprobar que un título con `<b>` se muestra como texto, que un libro sin género muestra «Sin clasificar» y que la tabla sigue siendo legible a 320 px de ancho.

## 3. Documentación

- [ ] 3.1 Anotar en `tpi/README.md` que el catálogo busca solo por título y que se quitaron los filtros por autor, editorial, género y precio, con el motivo.

## Workflow follow-up

- Archivar el change con `/openspec-archive-change` cuando estén todas las tareas.
