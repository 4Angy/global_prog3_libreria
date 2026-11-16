/* ============================================================================
   Librería ABC — vista del historial integrada a la API
   Change 07 · Ejercicio 3: historial, detalle y limpieza del estado local

   Responsabilidad: pedir a la API la página visible del historial y dibujar
   sus filas, abrir el detalle de una venta con `GET /ventas/{id}` y mantener
   la URL en sincronía con el detalle (`?venta={id}`).

   Los importes se muestran tal como los devuelve la API: el precio unitario y
   el subtotal salen del detalle y no se recalculan en el navegador.

   Estado en memoria: `{ offset }`. La API no informa el total de ventas, así
   que «Siguiente» se habilita únicamente cuando la página vino completa. Cada
   consulta lleva un número de petición y las respuestas viejas se descartan.

   Script clásico (no módulo ES): usa las globales `Api` y `formatearPrecio`,
   definidas en api.js y formato.js.
   ========================================================================== */

"use strict";

/* Cantidad de ventas por página: la API valida `limit` entre 1 y 100. */
const LIMITE_POR_PAGINA = 20;

/* Desplazamiento de la página visible del historial. */
const estadoHistorial = { offset: 0 };

/* Números de petición del listado y del detalle: las respuestas de consultas
   anteriores se descartan para que no pisen el último resultado. */
let numeroDePagina = 0;
let numeroDeDetalle = 0;

/* --- Formatos --------------------------------------------------------------- */

/** Presenta la fecha ISO de la API en la zona local del navegador. */
function formatearFecha(iso) {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) {
    return iso || "";
  }
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(fecha);
}

/* --- Estados ---------------------------------------------------------------- */

/** Oculta todos los mensajes de estado del listado: se muestra como máximo uno. */
function ocultarEstados() {
  [
    "historial-estado-cargando",
    "historial-estado-error",
    "historial-estado-vacio"
  ].forEach((id) => {
    document.getElementById(id).hidden = true;
  });
}

/** Muestra un único mensaje de estado del listado, identificado por su id. */
function mostrarEstado(id) {
  ocultarEstados();
  document.getElementById(id).hidden = false;
}

/** Habilita o deshabilita los botones de paginación. */
function habilitarPaginacion(anterior, siguiente) {
  document.getElementById("historial-boton-anterior").disabled = !anterior;
  document.getElementById("historial-boton-siguiente").disabled = !siguiente;
}

/** Muestra el error del listado con el texto que devolvió la API. */
function mostrarErrorListado(error) {
  const texto =
    error && error.mensaje ? error.mensaje : "No se pudo cargar el historial.";
  document.getElementById("historial-error-texto").textContent = texto;
  mostrarEstado("historial-estado-error");
  habilitarPaginacion(estadoHistorial.offset > 0, false);
}

/** Muestra u oculta el error del detalle. */
function mostrarErrorDetalle(texto) {
  const elemento = document.getElementById("historial-detalle-error");
  if (!texto) {
    elemento.hidden = true;
    return;
  }
  elemento.textContent = texto;
  elemento.hidden = false;
}

/* --- Listado ---------------------------------------------------------------- */

/** Construye la fila de una venta con su acción de abrir el detalle. */
function crearFilaVenta(venta) {
  const fila = document.createElement("tr");
  [
    { texto: String(venta.id), atomica: true },
    { texto: formatearFecha(venta.fecha), atomica: true },
    { texto: formatearPrecio(venta.total), atomica: true }
  ].forEach((valor) => {
    const celda = document.createElement("td");
    if (valor.atomica) {
      celda.classList.add("celda-atomica");
    }
    celda.textContent = valor.texto;
    fila.appendChild(celda);
  });

  const celdaAcciones = document.createElement("td");
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "boton boton--secundario";
  boton.textContent = "Ver detalle";
  boton.dataset.ventaId = String(venta.id);
  celdaAcciones.appendChild(boton);
  fila.appendChild(celdaAcciones);

  return fila;
}

/** Dibuja la página recibida y ajusta los estados y la paginación. */
function mostrarVentas(ventas) {
  const cuerpo = document.getElementById("historial-listado");
  cuerpo.replaceChildren();
  const lista = Array.isArray(ventas) ? ventas : [];
  lista.forEach((venta) => {
    cuerpo.appendChild(crearFilaVenta(venta));
  });

  const recibidos = lista.length;
  habilitarPaginacion(
    estadoHistorial.offset > 0,
    recibidos === LIMITE_POR_PAGINA
  );

  if (recibidos > 0) {
    ocultarEstados();
    return;
  }
  const vacio = document.getElementById("historial-estado-vacio");
  vacio.textContent =
    estadoHistorial.offset > 0
      ? "No hay ventas en esta página."
      : "No hay ventas registradas.";
  mostrarEstado("historial-estado-vacio");
}

/** Pide a la API la página actual y dibuja el resultado. */
async function cargarPagina() {
  const peticion = ++numeroDePagina;
  mostrarEstado("historial-estado-cargando");
  habilitarPaginacion(false, false);
  try {
    const ventas = await Api.get("/ventas/", {
      limit: LIMITE_POR_PAGINA,
      offset: estadoHistorial.offset
    });
    if (peticion !== numeroDePagina) {
      return;
    }
    mostrarVentas(ventas);
  } catch (error) {
    if (peticion !== numeroDePagina) {
      return;
    }
    mostrarErrorListado(error);
  }
}

/* --- Detalle ---------------------------------------------------------------- */

/** Oculta el panel de detalle y deja sus campos vacíos, sin tocar la URL. */
function ocultarDetalle() {
  document.getElementById("historial-detalle").hidden = true;
  [
    "historial-detalle-identificador",
    "historial-detalle-fecha",
    "historial-detalle-cliente",
    "historial-detalle-email",
    "historial-detalle-total"
  ].forEach((id) => {
    document.getElementById(id).textContent = "";
  });
  document.getElementById("historial-detalle-renglones").replaceChildren();
}

/**
 * Escribe (o quita, con `null`) el parámetro `venta` de la URL sin recargar.
 * Si el navegador no permite cambiar la URL, la vista sigue funcionando: solo
 * se pierde la posibilidad de recargar el detalle.
 */
function sincronizarUrl(ventaId) {
  if (!window.history || typeof window.history.replaceState !== "function") {
    return;
  }
  try {
    const url = new URL(window.location.href);
    if (ventaId === null) {
      url.searchParams.delete("venta");
    } else {
      url.searchParams.set("venta", String(ventaId));
    }
    window.history.replaceState(null, "", url.toString());
  } catch (error) {
    /* Sin `replaceState` (por ejemplo, con `file://`) la vista sigue igual. */
  }
}

/** Devuelve el id de la venta pedida en la URL, o null si no es válido. */
function ventaDeUrl() {
  const texto = new URLSearchParams(window.location.search).get("venta");
  if (!texto || !/^\d+$/.test(texto)) {
    return null;
  }
  const id = Number(texto);
  return id > 0 ? id : null;
}

/** Construye la fila de un renglón con los importes que devolvió la API. */
function crearFilaRenglon(renglon) {
  const fila = document.createElement("tr");
  [
    { texto: renglon.titulo || "Libro " + renglon.libro_id, atomica: false },
    { texto: String(renglon.cantidad), atomica: true },
    { texto: formatearPrecio(renglon.precio_unitario), atomica: true },
    { texto: formatearPrecio(renglon.subtotal), atomica: true }
  ].forEach((valor) => {
    const celda = document.createElement("td");
    if (valor.atomica) {
      celda.classList.add("celda-atomica");
    }
    celda.textContent = valor.texto;
    fila.appendChild(celda);
  });
  return fila;
}

/** Muestra el panel de detalle con los datos de la venta y sus renglones. */
function dibujarDetalle(venta) {
  document.getElementById("historial-detalle-identificador").textContent = String(
    venta.id
  );
  document.getElementById("historial-detalle-fecha").textContent = formatearFecha(
    venta.fecha
  );
  document.getElementById("historial-detalle-cliente").textContent = venta.cliente
    ? venta.cliente.nombre
    : "";
  document.getElementById("historial-detalle-email").textContent = venta.cliente
    ? venta.cliente.email
    : "";
  document.getElementById(
    "historial-detalle-total"
  ).textContent = formatearPrecio(venta.total);

  const cuerpo = document.getElementById("historial-detalle-renglones");
  cuerpo.replaceChildren();
  (Array.isArray(venta.renglones) ? venta.renglones : []).forEach((renglon) => {
    cuerpo.appendChild(crearFilaRenglon(renglon));
  });

  mostrarErrorDetalle("");
  document.getElementById("historial-detalle").hidden = false;
  document.getElementById("historial-detalle-titulo").focus();
}

/** Cierra el detalle y quita el parámetro de la URL. */
function cerrarDetalle() {
  ocultarDetalle();
  mostrarErrorDetalle("");
  sincronizarUrl(null);
}

/** Pide el detalle de una venta y lo muestra, o informa el rechazo. */
async function abrirDetalle(ventaId) {
  const peticion = ++numeroDeDetalle;
  mostrarErrorDetalle("");
  try {
    const venta = await Api.get("/ventas/" + ventaId);
    if (peticion !== numeroDeDetalle) {
      return;
    }
    dibujarDetalle(venta);
    sincronizarUrl(venta.id);
  } catch (error) {
    if (peticion !== numeroDeDetalle) {
      return;
    }
    ocultarDetalle();
    if (error && error.estado === 404) {
      sincronizarUrl(null);
      mostrarErrorDetalle("La venta no existe.");
      return;
    }
    mostrarErrorDetalle(
      error && error.mensaje ? error.mensaje : "No se pudo cargar el detalle."
    );
  }
}

/* --- Eventos ---------------------------------------------------------------- */

/** Atiende el clic en «Ver detalle». */
function alVerDetalle(evento) {
  const boton = evento.target;
  if (!boton.dataset || !boton.dataset.ventaId) {
    return;
  }
  abrirDetalle(boton.dataset.ventaId);
}

/** Retrocede una página del historial. */
function alPaginaAnterior() {
  if (estadoHistorial.offset === 0) {
    return;
  }
  estadoHistorial.offset = Math.max(0, estadoHistorial.offset - LIMITE_POR_PAGINA);
  cargarPagina();
}

/** Avanza una página del historial. */
function alPaginaSiguiente() {
  estadoHistorial.offset = estadoHistorial.offset + LIMITE_POR_PAGINA;
  cargarPagina();
}

/** Registra los eventos de la página y hace la primera consulta. */
function iniciarVistaHistorial() {
  document
    .getElementById("historial-listado")
    .addEventListener("click", alVerDetalle);
  document
    .getElementById("historial-boton-anterior")
    .addEventListener("click", alPaginaAnterior);
  document
    .getElementById("historial-boton-siguiente")
    .addEventListener("click", alPaginaSiguiente);
  document
    .getElementById("historial-boton-reintentar")
    .addEventListener("click", cargarPagina);
  document
    .getElementById("historial-detalle-cerrar")
    .addEventListener("click", cerrarDetalle);

  cargarPagina();
  const ventaId = ventaDeUrl();
  if (ventaId !== null) {
    abrirDetalle(ventaId);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciarVistaHistorial);
} else {
  iniciarVistaHistorial();
}
