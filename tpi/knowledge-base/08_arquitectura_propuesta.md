# Arquitectura Propuesta

## Patrones aplicados
| Patrón | Dónde se usa | Por qué |
|---|---|---|
| Reverse proxy de mismo origen | Nginx `/api/` → backend | Evita CORS y oculta la dirección interna del backend |
| Cliente HTTP único (fachada) | `frontend/public/js/api.js` (objeto global `Api`, `ErrorApi`) | Centraliza base, barras finales, parámetros y errores |
| Scripts clásicos con estado por vista | `vista-*.js` | Mantiene la restricción de JS nativo sin módulos ni build |
| Borrador en memoria | `ventas.js` | La consigna permite solo el borrador fuera de la API |
| Módulos por dominio (router / schemas / service / models) | `backend/app/modules/*` | Lógica en el service que recibe la sesión; DTO separados de las tablas |
| Garantías en la base | UNIQUE, FK, CHECK | Unicidad y referencias sin consultas previas; errores traducidos a 409 |
| Carga anticipada | `joinedload` / `selectinload` | Sin N+1 (`lazy="raise"` en todas las relaciones) |
| Migraciones versionadas | Alembic (`migrations/`) | Lo pide la guía del Global; reemplaza `create_all` |
| Plantilla con variables de entorno | `default.conf.template` + `NGINX_ENVSUBST_FILTER=^API_UPSTREAM$` | Misma imagen para local y Easypanel |

## Estructura de directorios
```
tpi/
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── default.conf.template
│   └── public/
│       ├── index.html  libros.html  clientes.html  ventas.html  historial.html
│       ├── css/estilos.css
│       ├── img/logo.png
│       └── js/  api.js  formato.js  vista-catalogo.js  altas.js  ventas.js  historial.js  ...
├── backend/
│   ├── Dockerfile  .dockerignore  requirements.txt  env.example
│   ├── alembic.ini  migrations/          (change 09)
│   ├── app/
│   │   ├── main.py
│   │   ├── core/  config.py  database.py  errors.py  pagination.py  registry.py
│   │   └── modules/  autores  clientes  editoriales  generos  health  libros  ventas
│   ├── scripts/datos_iniciales.py
│   └── test/  *.http  *.py
├── docs/               (consignas fuente)
├── knowledge-base/
├── openspec/
├── evidencia/          (G-01 a G-07)
├── README.md
└── DEPLOY.md
```

## Seguridad
- **Autenticación / autorización:** no aplica (fuera de alcance).
- **Validación de input:** en la UI antes de enviar y en la API con Pydantic (`extra="forbid"`) y restricciones de la base.
- **XSS:** los datos de la API se insertan con `textContent` / nodos creados, nunca con `innerHTML` interpolado.
- **SQL:** parámetros ligados; nunca concatenación.
- **Errores:** mensajes propios, sin texto de la base ni trazas.
- **Secrets management:** `.env` no versionado ni copiado a imágenes (`.dockerignore`); valores reales solo en Environment de Easypanel; `env.example` con valores de muestra.
- **Exposición:** backend sin dominio público; PostgreSQL privado; backend corre como usuario sin privilegios.

## Variables de entorno
| Variable | Servicio | Descripción | Ejemplo | Sensible |
|---|---|---|---|---|
| `DATABASE_URL` | backend | Conexión con driver asincrónico | `postgresql+asyncpg://usuario:contrasena@host:5432/base` | Y |
| `SQL_ECHO` | backend | Muestra las consultas emitidas | `false` | N |
| `API_UPSTREAM` | frontend | Host y puerto interno del backend, sin esquema ni barra | `grupo1_backend:8000` / `host.docker.internal:8000` | N |

## Ejecución local de referencia
- PostgreSQL 16 en contenedor `pg-libreria` publicado en `127.0.0.1:5433` (hay un PostgreSQL 18 nativo ocupando 5432 en la máquina del grupo).
- Backend: `uvicorn app.main:app --host 0.0.0.0 --port 8000`.
- Frontend: `docker run --rm -p 127.0.0.1:8080:80 -e API_UPSTREAM=host.docker.internal:8000 libreria-frontend` (en Docker Desktop no hace falta `--add-host`).
