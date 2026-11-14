# Design

## Context

- `GET /libros/{id}` devuelve `LibroRead`: los campos del resumen más `autores: [{autor: {id, nombre} | null, rol, orden}]`. Un id inexistente responde 404 con `{"detail": "El libro no existe."}`.
- `estilos.css` ya tiene `.tarjeta` y `.lista-detalle`, usados por el detalle del historial.

## Goals / Non-Goals

**Goals:**
- Ver los autores sin salir del catálogo ni perder la búsqueda y la página actuales.

**Non-Goals:**
- Editar el libro desde el detalle.

## Decisions

1. **Panel debajo de la tabla** (`<section id="catalogo-detalle">` con `aria-live="polite"`), reutilizando `.tarjeta` y `.lista-detalle`, con botón «Cerrar detalle». Al abrirlo se le pasa el foco al título del panel.
   *Alternativa:* página aparte `libro.html?id=`. Se descarta: obliga a volver a cargar el catálogo.
2. **Delegación de eventos:** un solo `click` sobre el `<tbody>` lee `data-id` del botón.
3. **Autores ordenados por `orden`** en el cliente, aunque el backend ya los devuelva así, con el rol en texto: «Ana Pérez (autor)».
4. **Descartar respuestas viejas:** si se pide otro detalle antes de que llegue el anterior, se muestra solo el último.
5. **Cambiar de página o buscar cierra el detalle**, para que no quede el detalle de un libro que ya no está en la tabla.

## Risks / Trade-offs

- [Una petición por detalle] → Es la ruta que indica la consigna; el costo es una consulta por clic.
