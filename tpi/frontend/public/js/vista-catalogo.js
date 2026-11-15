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

  const celdaDetalle = document.createElement("td");
  const botonDetalle = document.createElement("button");
  botonDetalle.type = "button";
  botonDetalle.className = "boton boton--secundario";
  botonDetalle.textContent = "Ver detalle";
  botonDetalle.dataset.id = libro.id;
  celdaDetalle.appendChild(botonDetalle);
  fila.appendChild(celdaDetalle);
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

/* --- Detalle ------------------------------------------------------------- */

/* N\u00famero de detalle en curso: si se pide otro detalle antes de que llegue el
   anterior, se muestra solo el \u00faltimo. Subir el n\u00famero tambi\u00e9n invalida una
   consulta en vuelo cuando el panel se cierra. */
let numeroDeDetalle = 0;

/* \u00daltimo bot\u00f3n \u00abVer detalle\u00bb pulsado: al cerrar el panel el foco vuelve ah\u00ed. */
let ultimoBotonDeDetalle = null;

/** Oculta el panel de detalle y descarta cualquier consulta en vuelo. */
function ocultarDetalle() {
  numeroDeDetalle += 1;
  document.getElementById("catalogo-detalle").hidden = true;
}

/** Muestra los datos y las autor\u00edas del libro recibido. */
function dibujarDetalle(libro) {
  document.getElementById("catalogo-detalle-error").hidden = true;
  document.getElementById("catalogo-detalle-titulo-valor").textContent = libro.titulo || "";
  document.getElementById("catalogo-detalle-isbn").textContent = libro.isbn || "";
  document.getElementById("catalogo-detalle-precio").textContent =
    formatearPrecio(libro.precio);
  document.getElementById("catalogo-detalle-stock").textContent =
    libro.stock === null || libro.stock === undefined ? "" : String(libro.stock);
  document.getElementById("catalogo-detalle-editorial").textContent =
    libro.editorial && libro.editorial.nombre ? libro.editorial.nombre : "";
  document.getElementById("catalogo-detalle-genero").textContent =
    libro.genero && libro.genero.nombre ? libro.genero.nombre : TEXTO_SIN_GENERO;

  const autores = (Array.isArray(libro.autores) ? libro.autores.slice() : []).sort(
    (a, b) => (a.orden || 0) - (b.orden || 0)
  );
  const lista = document.getElementById("catalogo-detalle-autores");
  lista.replaceChildren();
  if (autores.length === 0) {
    const item = document.createElement("li");
    item.textContent = "Sin autores";
    lista.appendChild(item);
    return;
  }
  autores.forEach((autor) => {
    const item = document.createElement("li");
    const nombre =
      autor.autor && autor.autor.nombre ? autor.autor.nombre : "Autor desconocido";
    item.textContent = nombre + " (" + (autor.rol || "autor") + ")";
    lista.appendChild(item);
  });
}

/** Deja el panel en estado de error: tabla y datos intactos; acceso al mensaje. */
function mostrarDetalleError(error) {
  [
    "catalogo-detalle-titulo-valor",
    "catalogo-detalle-isbn",
    "catalogo-detalle-precio",
    "catalogo-detalle-stock",
    "catalogo-detalle-editorial",
    "catalogo-detalle-genero"
  ].forEach((id) => {
    document.getElementById(id).textContent = "";
  });
  document.getElementById("catalogo-detalle-autores").replaceChildren();
  const texto =
    error && error.mensaje ? error.mensaje : "No se pudo cargar el detalle del libro.";
  document.getElementById("catalogo-detalle-error").textContent = texto;
  document.getElementById("catalogo-detalle-error").hidden = false;
}

/** Pide el detalle a la API y lo muestra en el panel. */
async function alVerDetalle(boton) {
  ultimoBotonDeDetalle = boton;
  const id = Number(boton.dataset.id);
  if (!Number.isFinite(id)) {
    return;
  }
  const numero = ++numeroDeDetalle;
  try {
    const libro = await Api.get("/libros/" + id);
    if (numero !== numeroDeDetalle) {
      return;
    }
    dibujarDetalle(libro);
  } catch (error) {
    if (numero !== numeroDeDetalle) {
      return;
    }
    mostrarDetalleError(error);
  }
  document.getElementById("catalogo-detalle").hidden = false;
  document.getElementById("catalogo-detalle-titulo").focus();
}



/* --- Eventos --------------------------------------------------------------- */

/** Busca el título ingresado desde la primera página. */
function alBuscar(evento) {
  evento.preventDefault();
  estadoCatalogo.titulo = document.getElementById("catalogo-busqueda").value;
  estadoCatalogo.offset = 0;
  ocultarDetalle();
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
  ocultarDetalle();
  cargarPagina();
}

/** Retrocede una página conservando el título buscado. */
function alIrAnterior() {
  if (estadoCatalogo.offset === 0) {
    return;
  }
  estadoCatalogo.offset = Math.max(0, estadoCatalogo.offset - LIMITE_POR_PAGINA);
  ocultarDetalle();
  cargarPagina();
}

/** Avanza una página conservando el título buscado. */
function alIrSiguiente() {
  estadoCatalogo.offset += LIMITE_POR_PAGINA;
  ocultarDetalle();
  cargarPagina();
}

/** Repite la última consulta después de un error. */
function alReintentar() {
  cargarPagina();
}

/** Detecta pulsaciones en «Ver detalle» navegando por delegación en el tbody. */
function alClickEnFila(evento) {
  const objetivo = evento.target;
  if (!objetivo || typeof objetivo.closest !== "function") {
    return;
  }
  const boton = objetivo.closest("button[data-id]");
  if (!boton || !evento.currentTarget.contains(boton)) {
    return;
  }
  alVerDetalle(boton);
}

/** Cierra el panel y devuelve el foco al botón que lo abrió. */
function alCerrarDetalle() {
  ocultarDetalle();
  if (ultimoBotonDeDetalle) {
    ultimoBotonDeDetalle.focus();
  }
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
  document
    .getElementById("catalogo-listado")
    .addEventListener("click", alClickEnFila);
  document
    .getElementById("catalogo-detalle-cerrar")
    .addEventListener("click", alCerrarDetalle);
  cargarPagina();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciarCatalogo);
} else {
  iniciarCatalogo();
}
