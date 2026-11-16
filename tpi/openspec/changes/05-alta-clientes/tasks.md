# Tasks

## 1. Marcado

- [x] 1.1 Ajustar `clientes.html`: tabla «Clientes registrados en esta sesión» con columna «ID»; nueva sección «Buscar cliente por ID» con su resultado y su mensaje de error; cargar `formato.js`, `api.js`, `validaciones.js` y `vista-clientes.js`, sin los scripts locales.

## 2. Comportamiento

- [x] 2.1 Cambiar `validarCliente` para que no use el estado local. Verificar nombre vacío y email inválido sin peticiones.
- [x] 2.2 Enviar `POST /clientes/` deshabilitando el botón; con 201 mostrar el ID, agregar la fila y limpiar. Mostrar el mensaje del servidor ante 409 y 422 conservando los datos. Verificar el alta y repetir el email (G-03).
- [x] 2.3 Implementar la búsqueda por ID. Verificar con el ID recién creado (G-03), un ID inexistente y un texto no numérico.

## 3. Documentación

- [x] 3.1 Documentar en `tpi/README.md` que los clientes se buscan por ID porque la API no tiene listado.

## Workflow follow-up

- Archivar el change con `/openspec-archive-change` cuando estén todas las tareas.
