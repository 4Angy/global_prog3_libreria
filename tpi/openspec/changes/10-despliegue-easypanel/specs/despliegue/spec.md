# Spec Delta

## Purpose

Define cómo se publica la librería en Easypanel, cómo se verifica desde la URL pública y qué se entrega.

## ADDED Requirements

### Requirement: Repositorio de entrega
El repositorio SHALL contener `frontend/`, `backend/`, `README.md`, `DEPLOY.md`, `evidencia/`, los dos `Dockerfile`, la plantilla de Nginx y `backend/env.example`. MUST NOT contener archivos `.env`, credenciales reales ni dependencias instaladas.

#### Scenario: Revisión antes de entregar
- **WHEN** se buscan archivos `.env`, `.venv` y `node_modules` en el repositorio y en el ZIP
- **THEN** no hay resultados

### Requirement: Servicio backend
El backend SHALL desplegarse como servicio App con Build Path `/backend`, `DATABASE_URL` con el driver `postgresql+asyncpg` en el entorno privado del servicio y sin dominio público.

#### Scenario: Salud del backend
- **WHEN** se ejecuta el comando de salud de la guía en el Shell del servicio
- **THEN** imprime 200

### Requirement: Servicio frontend
El frontend SHALL desplegarse como servicio App con Build Path `/frontend`, `API_UPSTREAM` con el nombre interno del backend y su puerto, y un dominio HTTPS que apunta al puerto 80.

#### Scenario: Salud desde la URL pública
- **WHEN** se abre `https://<dominio>/api/health/ready`
- **THEN** responde 200

### Requirement: Verificación pública
Los casos G-01 a G-07 SHALL ejecutarse desde la URL pública con datos ficticios, registrando para cada uno el resultado observado y su evidencia.

#### Scenario: Persistencia tras redesplegar
- **WHEN** se redespliegan los dos servicios
- **THEN** una venta registrada antes sigue mostrando el mismo detalle

### Requirement: Documentación
`README.md` SHALL identificar al grupo y explicar cómo ejecutar la app localmente y cargar los datos de prueba. `DEPLOY.md` SHALL registrar la URL pública, la revisión desplegada, las rutas de build, los puertos, el proxy, los nombres de las variables, las migraciones, la carga inicial y los pasos de actualización.

#### Scenario: Reproducir el despliegue
- **WHEN** otra persona sigue `DEPLOY.md`
- **THEN** puede recrear los dos servicios sin información adicional, salvo las credenciales
