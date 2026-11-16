"""DTO de clientes y de sus perfiles."""

import re
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator

# Misma regla que `EXPRESION_EMAIL` del frontend (`js/validaciones.js`): una
# arroba, texto antes y después, y al menos un punto en el dominio.
_EXPRESION_EMAIL = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def _nombre_no_vacio(valor: Optional[str]) -> Optional[str]:
    """Rechaza un nombre en blanco y devuelve el texto recortado."""
    if valor is None:
        return valor
    limpio = valor.strip()
    if not limpio:
        raise ValueError("El nombre no puede estar vacío.")
    return limpio


def _email_bien_formado(valor: Optional[str]) -> Optional[str]:
    """Rechaza un email que no cumpla el formato del frontend."""
    if valor is None:
        return valor
    limpio = valor.strip()
    if not _EXPRESION_EMAIL.fullmatch(limpio):
        raise ValueError("El correo electrónico no tiene un formato válido.")
    return limpio


class ClienteCreate(BaseModel):
    """Cuerpo del alta de un cliente."""

    model_config = ConfigDict(extra="forbid")

    nombre: str
    email: str

    _nombre_valido = field_validator("nombre")(_nombre_no_vacio)
    _email_valido = field_validator("email")(_email_bien_formado)


class ClienteUpdate(BaseModel):
    """Cuerpo parcial del `PATCH` de un cliente."""

    model_config = ConfigDict(extra="forbid")

    nombre: Optional[str] = None
    email: Optional[str] = None

    _nombre_valido = field_validator("nombre")(_nombre_no_vacio)
    _email_valido = field_validator("email")(_email_bien_formado)


class PerfilCreate(BaseModel):
    """Cuerpo del alta de un perfil.

    No declara `cliente_id`: el vínculo se toma de la ruta y un cuerpo que
    intente enviarlo responde `422`.
    """

    model_config = ConfigDict(extra="forbid")

    telefono: Optional[str] = None
    direccion: Optional[str] = None


class PerfilRead(BaseModel):
    """Perfil de contacto de un cliente."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    telefono: Optional[str] = None
    direccion: Optional[str] = None


class ClienteRead(BaseModel):
    """Cliente con su perfil como objeto o `null`, nunca como lista."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    email: str
    perfil: Optional[PerfilRead] = None


class ClienteRef(BaseModel):
    """Referencia mínima de un cliente dentro de otro recurso."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    email: str
