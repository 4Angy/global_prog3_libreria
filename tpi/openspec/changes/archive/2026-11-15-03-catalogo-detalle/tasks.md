# Tasks

## 1. Marcado

- [x] 1.1 Agregar a `index.html` la columna «Detalle» y el panel `#catalogo-detalle` (oculto) con la lista de datos, la lista de autores, el mensaje de error y «Cerrar detalle».

## 2. Comportamiento

- [x] 2.1 Implementar en `vista-catalogo.js` el botón «Ver detalle» con `GET /libros/{id}`, mostrando los autores ordenados con su rol y «Sin autores» si no hay. Verificar con un libro de dos autores y con uno sin autores.
- [x] 2.2 Mostrar el error en el panel sin vaciar la tabla. Verificar borrando un libro de la base (o pidiendo un id inexistente desde la consola) y comprobando el 404.
- [x] 2.3 Cerrar el panel al buscar, al cambiar de página y con «Cerrar detalle». Verificar que el foco vuelve al botón que lo abrió.

## Workflow follow-up

- Archivar el change con `/openspec-archive-change` cuando estén todas las tareas.

## Verificación (2026-11-15)

Entorno: pg-libreria + tpi-backend + tpi-nginx en `tpi-net`, semilla cargada (9 libros). URLs por `http://localhost:8080/` (caché del navegador enmascaraba los archivos viejos con el origen `127.0.0.1`).

| Check | Resultado |
|---|---|
| Columna «Detalle» + 9 botones «Ver detalle» | 9 filas renderizadas, panel oculto por defecto, 0 errores en consola |
| Freakonomics (libro 9, 2 autorías) | Steven Levitt (autor, orden 1) y Stephen Dubner (coautor, orden 2), en orden por `orden` |
| Panel detalle | datos completos: precio `$ 25.900,00`, nombre, ISBN, stock, editorial, género |
| Foco al abrir | `document.activeElement === catalogo-detalle-titulo` (h2) |
| Tabla sigue visible | 9 filas intactas mientras el panel está abierto y después |
| «Sin autores» | stub con `autores: []` → lista «Sin autores»; género nulo → «Sin clasificar» |
| Error 404 (stub con `ErrorApi`) | mensaje «El libro no existe.» visible, tabla intacta — el borrado real no se aplica porque el estado queda corrupto en la semilla; el 404 real se verificó por la consola con `Api.get("/libros/999999")` → `ErrorApi` 404, `esConexion: false` |
| Cerrar con «Cerrar detalle» | foco vuelve al botón «Ver detalle» que lo abrió |
| Buscar cierra el panel | `submit` del formulario con texto → detalle oculto |
| Cambiar de página cierra el panel | con 20 libros stub, «Siguiente» (offset 0→20) → detalle oculto |
