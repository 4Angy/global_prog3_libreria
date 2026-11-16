# imagen-frontend Specification

## Purpose
Define cómo se empaqueta el frontend en una imagen de Nginx que sirve el sitio y reenvía `/api/` al backend indicado por `API_UPSTREAM`.

## Requirements

### Requirement: Estructura del frontend
La carpeta `frontend/` SHALL contener `Dockerfile`, `.dockerignore`, `default.conf.template` y `public/`. Todo lo que publica el sitio (páginas, `css/`, `js/`, `img/`) MUST estar dentro de `public/`, y la configuración fuera.

#### Scenario: Revisión de la carpeta
- **WHEN** se lista `frontend/`
- **THEN** están los cuatro elementos y `public/` contiene `index.html`, `css/`, `js/` e `img/`

### Requirement: Imagen del frontend
El `Dockerfile` SHALL partir de `nginx:1.30-alpine`, limitar la sustitución de variables a `API_UPSTREAM`, copiar `public/` a `/usr/share/nginx/html/` y la plantilla a `/etc/nginx/templates/`, y exponer el puerto 80. El `.dockerignore` MUST excluir `.git`, `.env`, `.env.*`, `node_modules` y `.DS_Store`.

#### Scenario: Build
- **WHEN** se ejecuta `docker build -t libreria-frontend .` en `frontend/`
- **THEN** la imagen se construye sin errores

### Requirement: Proxy hacia la API
El contenedor SHALL reenviar las rutas `/api/...` a `http://${API_UPSTREAM}/...`, quitando el prefijo `/api`.

#### Scenario: Salud a través del proxy
- **WHEN** el contenedor corre con `API_UPSTREAM=host.docker.internal:8000` y el backend está levantado
- **THEN** `http://127.0.0.1:8080/api/health/ready` responde 200

#### Scenario: Backend detenido
- **WHEN** el backend no está corriendo
- **THEN** `/api/health/ready` responde 502 y las páginas estáticas siguen cargando
