# migraciones-backend Specification

## Purpose
Define cómo se crea y se versiona el esquema de PostgreSQL del backend con Alembic, y cómo se aplica al desplegar.

## Requirements

### Requirement: Configuración de Alembic
El backend SHALL incluir `alembic.ini` y `migrations/`, y Alembic MUST tomar la conexión de `DATABASE_URL` sin guardar credenciales en archivos versionados.

#### Scenario: Estado de las migraciones
- **WHEN** se ejecuta `alembic current` con `DATABASE_URL` configurada
- **THEN** el comando se conecta a la base y muestra la revisión actual

### Requirement: Migración inicial
Una migración inicial SHALL crear sobre una base vacía el mismo esquema que definen los modelos: tablas, claves foráneas, restricciones `UNIQUE`, `CHECK` nombrados e índices.

#### Scenario: Base vacía
- **WHEN** se ejecuta `alembic upgrade head` sobre una base vacía
- **THEN** se crean las nueve tablas del dominio y `alembic check` no detecta diferencias con los modelos

#### Scenario: Carga de datos
- **WHEN** después de migrar se ejecuta `scripts/datos_iniciales.py`
- **THEN** la carga termina sin errores

### Requirement: Arranque sin crear tablas
La API MUST NOT crear tablas al arrancar; el esquema lo administra Alembic.

#### Scenario: Base sin migrar
- **WHEN** la API arranca sobre una base vacía sin migrar
- **THEN** no se crea ninguna tabla

### Requirement: Migraciones en la imagen
La imagen del backend SHALL aplicar `alembic upgrade head` antes de iniciar Uvicorn en `0.0.0.0:8000`. Si la migración falla, el contenedor MUST terminar sin iniciar la API.

#### Scenario: Primer despliegue
- **WHEN** el contenedor arranca con una base vacía
- **THEN** los logs muestran la migración aplicada y `/health/ready` responde 200
