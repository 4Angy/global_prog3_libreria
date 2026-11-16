# Tasks

## 1. Marcado

- [x] 1.1 Ajustar `libros.html`: agregar el campo «Stock»; reemplazar el selector múltiple de autores por «ID del autor», «Rol», «Buscar y agregar» y la lista de autorías; renombrar la tabla a «Libros registrados en esta sesión» y sumar la columna «Stock»; cargar `formato.js`, `api.js`, `validaciones.js` y `vista-libros.js`, sin `datos.js`, `persistencia.js`, `catalogo.js`, `altas.js` ni `inicio.js`.

## 2. Comportamiento

- [x] 2.1 Cargar editoriales y géneros con `limit=100` y manejar el error con «Reintentar». Verificar con el backend levantado y detenido.
- [x] 2.2 Implementar las autorías verificadas (agregar, rechazar inexistente y repetido, quitar y renumerar). Verificar con un ID válido, uno inexistente y uno repetido.
- [x] 2.3 Cambiar `validarLibro` para que no use el estado local y valide stock y autorías. Verificar cada mensaje de error sin enviar peticiones (pestaña Red vacía).
- [x] 2.4 Enviar `POST /libros/` con el cuerpo exacto, deshabilitando el botón; con 201 mostrar el mensaje, agregar la fila y limpiar. Verificar el alta y abrir el libro desde el catálogo.
- [x] 2.5 Mostrar el mensaje del servidor ante 409 y 422 conservando los datos. Verificar repitiendo un ISBN (G-02).

## 3. Documentación

- [x] 3.1 Documentar en `tpi/README.md` cómo se resolvieron los selectores: editoriales y géneros con su listado (`limit=100`) y autores por ID con `GET /autores/{id}`.

## Workflow follow-up

- Archivar el change con `/openspec-archive-change` cuando estén todas las tareas.
