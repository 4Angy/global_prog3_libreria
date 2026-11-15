/* ============================================================================
   Librería ABC — vista del catálogo integrada a la API
   Change 02 · Ejercicio 1: catálogo y cliente HTTP

   Responsabilidad: pedir a la API la página visible del catálogo, dibujar sus
   filas como texto y resolver los estados de la vista (cargando, vacío, sin
   coincidencias, sin más resultados y error). Reemplaza a `catalogo.js` y a
   `inicio.js` solo en `index.html`.

   Estado en memoria: `{ titulo, offset, limit }`. La API no informa el total,
   así que «Siguiente» se habilita únicamente cuando la página vino completa.
   Cada consulta lleva un número de petición y las respuestas viejas se
   descartan: una búsqueda rápida no puede pisar a la siguiente.

   Script clásico (no módulo ES): usa las globales `Api`, `formatearPrecio` y
   `TEXTO_SIN_GENERO`, definidas en api.js y formato.js.
   ========================================================================== */

"use strict";

/* Cantidad de libros por página: la API valida `limit` entre 1 y 100. */
const LIMITE_POR_PAGINA = 20;

/* Estado de la vista: texto buscado y desplazamiento de la página actual. */
const estadoCatalogo = { titulo: "", offset: 0 };

/* Número de la consulta en curso: las respuestas de consultas anteriores se
   descartan para que no pisen el resultado de la última búsqueda. */
let numeroDePeticion = 0;

/* --- Tabla ----------------------------------------------------------------- */

/** Construye una fila del catálogo con las cinco columnas del encabezado. */
function crearFilaCatalogo(libro) {
  const fila = document.createElement("tr");
  const valores = [
    { texto: libro.titulo, atomica: false },
    { texto: libro.isbn, atomica: true },
    { texto: libro.editorial ? libro.editorial.nombre : "", atomica: false },
    { texto: libro.genero ? libro.genero.nombre : TEXTO_SIN_GENERO, atomica: false },
    { texto: formatearPrecio(libro.precio), atomica: true }
  ];
  valores.forEach((valor) => {
    const celda = document.createElement("td");
    if (valor.atomica) {
      celda.classList.add("celda-atomica");
    }
    celda.textContent = valor.texto;
    fila.appendChild(celda);
  });
  return fila;
}

/** Vacía el cuerpo de la tabla. */
function vaciarTabla() {
  document.getElementById("catalogo-listado").replaceChildren();
}

/* --- Estados --------------------------------------------------------------- */

/** Oculta todos los mensajes de estado: se muestra como máximo uno. */
function ocultarEstados() {
  [
    "catalogo-estado-cargando",
    "catalogo-estado-error",
    "catalogo-estado-vacio",
    "catalogo-estado-sin-resultados",
    "catalogo-estado-sin-mas"
  ].forEach((id) => {
    document.getElementById(id).hidden = true;
  });
}

/** Muestra un único mensaje de estado, identificado por su id. */
function mostrarEstado(id) {
  ocultarEstados();
  document.getElementById(id).hidden = false;
}

/** Habilita o deshabilita el buscador mientras hay una consulta en curso. */
function habilitarBusqueda(habilitada) {
  document.getElementById("catalogo-busqueda").disabled = !habilitada;
  document.getElementById("catalogo-boton-buscar").disabled = !habilitada;
}

/** Habilita o deshabilita los botones de paginación. */
function habilitarPaginacion(anterior, siguiente) {
  document.getElementById("catalogo-boton-anterior").disabled = !anterior;
  document.getElementById("catalogo-boton-siguiente").disabled = !siguiente;
}

/* --- Consulta -------------------------------------------------------------- */

/** Arma los parámetros de la consulta con el estado actual de la vista. */
function parametrosDeConsulta() {
  const parametros = { limit: LIMITE_POR_PAGINA, offset: estadoCatalogo.offset };
  if (estadoCatalogo.titulo !== "") {
    parametros.titulo = estadoCatalogo.titulo;
  }
  return parametros;
}

/** Pide a la API la página actual y dibuja el resultado. */
async function cargarPagina() {
  const peticion = ++numeroDePeticion;
  mostrarEstado("catalogo-estado-cargando");
  habilitarBusqueda(false);
  habilitarPaginacion(false, false);
  try {
    const libros = await Api.get("/libros/", parametrosDeConsulta());
    if (peticion !== numeroDePeticion) {
      return;
    }
    mostrarLibros(libros);
  } catch (error) {
    if (peticion !== numeroDePeticion) {
      return;
    }
    mostrarError(error);
  }
}

/** Dibuja la página recibida y ajusta los estados y la paginación. */
function mostrarLibros(libros) {
  const cuerpo = document.getElementById("catalogo-listado");
  cuerpo.replaceChildren();
  libros.forEach((libro) => {
    cuerpo.appendChild(crearFilaCatalogo(libro));
  });

  const recibidos = libros.length;
  habilitarBusqueda(true);
  habilitarPaginacion(estadoCatalogo.offset > 0, recibidos === LIMITE_POR_PAGINA);

  if (recibidos > 0) {
    ocultarEstados();
    return;
  }
  if (estadoCatalogo.offset > 0) {
    mostrarEstado("catalogo-estado-sin-mas");
  } else if (estadoCatalogo.titulo !== "") {
    mostrarEstado("catalogo-estado-sin-resultados");
  } else {
    mostrarEstado("catalogo-estado-vacio");
  }
}

/** Muestra el error de la consulta, deja la tabla vacía y ofrece reintentar. */
function mostrarError(error) {
  vaciarTabla();
  habilitarBusqueda(true);
  habilitarPaginacion(false, false);
  const texto =
    error && error.mensaje ? error.mensaje : "No se pudo cargar el catálogo.";
  document.getElementById("catalogo-error-texto").textContent = texto;
  mostrarEstado("catalogo-estado-error");
}

/* --- Eventos --------------------------------------------------------------- */

/** Busca el título ingresado desde la primera página. */
function alBuscar(evento) {
  evento.preventDefault();
  estadoCatalogo.titulo = document.getElementById("catalogo-busqueda").value;
  estadoCatalogo.offset = 0;
  cargarPagina();
}

/** Al borrar el texto de búsqueda, vuelve a la primera página del catálogo. */
function alCambiarBusqueda() {
  const entrada = document.getElementById("catalogo-busqueda");
  if (entrada.value !== "" || estadoCatalogo.titulo === "") {
    return;
  }
  estadoCatalogo.titulo = "";
  estadoCatalogo.offset = 0;
  cargarPagina();
}

/** Retrocede una página conservando el título buscado. */
function alIrAnterior() {
  if (estadoCatalogo.offset === 0) {
    return;
  }
  estadoCatalogo.offset = Math.max(0, estadoCatalogo.offset - LIMITE_POR_PAGINA);
  cargarPagina();
}

/** Avanza una página conservando el título buscado. */
function alIrSiguiente() {
  estadoCatalogo.offset += LIMITE_POR_PAGINA;
  cargarPagina();
}

/** Repite la última consulta después de un error. */
function alReintentar() {
  cargarPagina();
}

/** Registra los eventos y pide la primera página. */
function iniciarCatalogo() {
  document
    .getElementById("catalogo-form-busqueda")
    .addEventListener("submit", alBuscar);
  document
    .getElementById("catalogo-busqueda")
    .addEventListener("input", alCambiarBusqueda);
  document
    .getElementById("catalogo-boton-anterior")
    .addEventListener("click", alIrAnterior);
  document
    .getElementById("catalogo-boton-siguiente")
    .addEventListener("click", alIrSiguiente);
  document
    .getElementById("catalogo-boton-reintentar")
    .addEventListener("click", alReintentar);
  cargarPagina();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciarCatalogo);
} else {
  iniciarCatalogo();
}
