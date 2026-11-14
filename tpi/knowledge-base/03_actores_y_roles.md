# Actores y Roles

## Actores del sistema
| Actor | Descripción | Cómo interactúa |
|---|---|---|
| Personal de la librería | Único usuario de la interfaz; no se autentica | Navegador sobre el dominio HTTPS del frontend |
| Frontend (Nginx) | Sirve `public/` y hace de proxy `/api/` | Recibe HTTP :80 desde Easypanel; reenvía a `${API_UPSTREAM}` |
| Backend (FastAPI) | Expone el contrato REST y aplica reglas | Escucha en `0.0.0.0:8000` dentro de la red interna |
| PostgreSQL | Persistencia y garantías (UNIQUE, FK, CHECK) | Conexión `postgresql+asyncpg` desde el backend |
| Grupo / operador | Despliega y carga datos | Panel de Easypanel (Deploy, Environment, Shell, Logs) |
| Cátedra | Corrige | URL pública y entrega ZIP |

## RBAC — Matriz de permisos
No hay autenticación ni roles: todas las operaciones expuestas por la interfaz están disponibles para quien abra la URL (alcance definido por la consigna; el capítulo 5 no se evalúa).

| Rol | Recurso | Permisos |
|---|---|---|
| Usuario anónimo | Libros | Leer, crear (y `PATCH` solo para la verificación G-05, sin pantalla obligatoria) |
| Usuario anónimo | Clientes | Crear, leer por ID |
| Usuario anónimo | Ventas | Crear, leer (sin editar ni eliminar) |
| Usuario anónimo | Editoriales, géneros, autores | Leer |

## Rutas públicas
- Frontend: `/`, `/index.html`, `/libros.html`, `/clientes.html`, `/ventas.html`, `/historial.html` y los recursos `css/`, `js/`, `img/`.
- API vía proxy: todo `/api/*`. El backend no tiene dominio propio.
