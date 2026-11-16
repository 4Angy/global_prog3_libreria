/* ============================================================================
   Librería ABC — vista de ventas integrada a la API
   Change 06 · Ejercicio 3: registrar y consultar ventas

   Responsabilidad: elegir un cliente por ID con `GET /clientes/{id}`, buscar
   libros por título con `GET /libros/`, armar el borrador en memoria y
   registrarlo con `POST /ventas/`. El comprobante muestra los importes que
   devolvió la API: el navegador no calcula el total confirmado.

   El borrador vive en memoria y no se pierde ante un 409 o un 422. El precio
   de catálogo es solo una referencia para el total estimado; el precio
   unitario definitivo lo copia el servidor al registrar la venta.

   Script clásico (no módulo ES): usa las globales `Api`, `formatearPrecio` y
   `leerCantidad`, definidas en api.js, formato.js y validaciones.js. Los
   ayudantes de mensajes son locales a esta vista.
   ========================================================================== */

"use strict";

/* --- Estado de la vista ----------------------------------------------------- */

/* Cliente elegido: { id, nombre, email } o null. Solo se asigna cuando
   `GET /clientes/{id}` respondió 200. */
let clienteElegido = null;

/* Renglones del borrador: { libroId, titulo, precioReferencia, cantidad }.
   `cantidad` guarda el texto del control para poder señalar un valor inválido
   antes de enviar. El orden del array es el orden de la tabla. */
let renglones = [];

/* Libros que devolvió la última búsqueda, indexados por id: se usan para
   copiar título y precio de catálogo al agregar un renglón. */
const librosEncontrados = new Map();

/* Número de la búsqueda de libros en curso: las respuestas viejas se
   descartan para que no pisen el resultado de la última búsqueda. */
let numeroDeBusqueda = 0;

/* Mientras el POST está en vuelo el botón queda deshabilitado. */
let enviando = false;

/* --- Mensajes --------------------------------------------------------------- */

/* Textos que el marcado ya escribió en los mensajes. Se recuerdan al cargar el
   script para poder agregar el detalle sin perder la frase original. */
const TEXTOS_BASE = {};

["ventas-mensaje-error", "mensaje-exito"].forEach((id) => {
  const elemento = document.getElementById(id);
  if (elemento) {
    TEXTOS_BASE[id] = elemento.textContent.trim();
  }
});

/** Devuelve el texto que el marcado ya escribía en un mensaje. */
function textoBase(elemento) {
  if (!(elemento.id in TEXTOS_BASE)) {
    TEXTOS_BASE[elemento.id] = elemento.textContent.trim();
  }
  return TEXTOS_BASE[elemento.id];
}

/** Muestra un mensaje de error junto al formulario, con los motivos. */
function mostrarError(elemento, motivos) {
  const base = textoBase(elemento);
  elemento.textContent = [base].concat(motivos).filter(Boolean).join(" ");
  elemento.hidden = false;
}

/** Muestra un mensaje de operación correcta junto al formulario. */
function mostrarExito(elemento, detalle) {
  const base = textoBase(elemento);
  elemento.textContent = detalle ? base + " " + detalle : base;
  elemento.hidden = false;
}

/** Vuelve a ocultar un mensaje. */
function ocultarMensaje(elemento) {
  elemento.hidden = true;
}

/** Muestra u oculta el aviso de la sección de libros. */
function mostrarMensajeLibro(texto) {
  const elemento = document.getElementById("venta-libro-error");
  if (!texto) {
    elemento.hidden = true;
    return;
  }
  elemento.textContent = texto;
  elemento.hidden = false;
}

/* --- Cliente ---------------------------------------------------------------- */

/** Quita la selección del cliente y oculta su nombre. */
function deseleccionarCliente() {
  clienteElegido = null;
  document.getElementById("venta-cliente-nombre").textContent = "";
  document.getElementById("venta-cliente-elegido").hidden = true;
}

/** Muestra el cliente que devolvió la API y lo deja elegido. */
function elegirCliente(cliente) {
  clienteElegido = cliente;
  document.getElementById("venta-cliente-nombre").textContent =
    cliente.nombre + " (" + cliente.email + ")";
  document.getElementById("venta-cliente-elegido").hidden = false;
}

/** Busca el cliente por ID y lo elige solo si la API lo encontró. */
async function alBuscarCliente(evento) {
  evento.preventDefault();
  const mensajeError = document.getElementById("venta-cliente-error");
  const boton = document.getElementById("venta-boton-buscar-cliente");
  ocultarMensaje(mensajeError);
  ocultarMensaje(document.getElementById("mensaje-exito"));
  deseleccionarCliente();

  const textoId = document.getElementById("venta-cliente-id").value.trim();
  if (!/^\d+$/.test(textoId) || Number(textoId) < 1) {
    mostrarError(mensajeError, ["Ingresá un ID de cliente válido."]);
    return;
  }
  const id = Number(textoId);

  boton.disabled = true;
  boton.textContent = "Buscando…";
  try {
    const cliente = await Api.get("/clientes/" + id);
    elegirCliente(cliente);
  } catch (error) {
    if (error && error.estado === 404) {
      mostrarError(mensajeError, ["El cliente no existe."]);
    } else {
      const texto =
        error && error.mensaje
          ? error.mensaje
          : "No se pudo buscar el cliente. Intentá de nuevo.";
      mostrarError(mensajeError, [texto]);
    }
  } finally {
    boton.disabled = false;
    boton.textContent = "Buscar";
  }
}

/** Si el ID cambia después de elegir, el cliente deja de estar elegido. */
function alCambiarIdCliente() {
  const textoId = document.getElementById("venta-cliente-id").value.trim();
  if (clienteElegido && textoId !== String(clienteElegido.id)) {
    deseleccionarCliente();
    ocultarMensaje(document.getElementById("venta-cliente-error"));
  }
}

/* --- Búsqueda de libros ------------------------------------------------------ */

/** Conserva solo la opción fija del selector de libros encontrados. */
function vaciarSelectorLibros() {
  const select = document.getElementById("venta-libro");
  const fija = select.querySelector('option[value=""]');
  select.replaceChildren();
  if (fija) {
    select.appendChild(fija);
  }
  librosEncontrados.clear();
}

/** Llena el selector con los libros que devolvió la búsqueda. */
function pintarSelectorLibros(libros) {
  vaciarSelectorLibros();
  const select = document.getElementById("venta-libro");
  libros.forEach((libro) => {
    librosEncontrados.set(String(libro.id), libro);
    const opcion = document.createElement("option");
    opcion.value = String(libro.id);
    opcion.textContent = libro.titulo + " — " + formatearPrecio(libro.precio);
    select.appendChild(opcion);
  });
}

/** Busca libros por título (parcial, sin distinguir mayúsculas). */
async function alBuscarLibro(evento) {
  evento.preventDefault();
  const peticion = ++numeroDeBusqueda;
  const boton = document.getElementById("venta-boton-buscar-libro");
  const titulo = document.getElementById("venta-busqueda-libro").value.trim();
  mostrarMensajeLibro("");
  ocultarMensaje(document.getElementById("mensaje-exito"));
  vaciarSelectorLibros();

  if (titulo === "") {
    mostrarMensajeLibro("Ingresá un título para buscar el libro.");
    return;
  }

  boton.disabled = true;
  boton.textContent = "Buscando…";
  try {
    const libros = await Api.get("/libros/", { titulo, limit: 10 });
    if (peticion !== numeroDeBusqueda) {
      return;
    }
    const lista = Array.isArray(libros) ? libros : [];
    if (lista.length === 0) {
      mostrarMensajeLibro("No se encontraron libros con ese título.");
      return;
    }
    pintarSelectorLibros(lista);
  } catch (error) {
    if (peticion !== numeroDeBusqueda) {
      return;
    }
    const texto =
      error && error.mensaje ? error.mensaje : "No se pudo buscar el libro.";
    mostrarMensajeLibro(texto);
  } finally {
    boton.disabled = false;
    boton.textContent = "Buscar";
  }
}

/* --- Borrador --------------------------------------------------------------- */

/** Busca un renglón por libro. Devuelve null si el libro no está en el borrador. */
function renglonDeLibro(libroId) {
  return renglones.find((renglon) => renglon.libroId === libroId) || null;
}

/**
 * Agrega un libro al borrador con la cantidad indicada.
 * Si el libro ya está, NO se crea otro renglón: se suma la cantidad.
 */
function agregarRenglon(libro, cantidad) {
  const existente = renglonDeLibro(libro.id);
  if (existente) {
    const previa = leerCantidad(existente.cantidad) || 0;
    const nueva = previa + cantidad;
    existente.cantidad = String(nueva);
    return {
      repetido: true,
      mensaje:
        "Se agregaron " + cantidad + " unidades más de «" + libro.titulo +
        "»; el renglón queda con " + nueva + "."
    };
  }
  renglones.push({
    libroId: libro.id,
    titulo: libro.titulo,
    precioReferencia: libro.precio,
    cantidad: String(cantidad)
  });
  return {
    repetido: false,
    mensaje: "Se agregó «" + libro.titulo + "» a la venta."
  };
}

/** Atiende el envío del formulario que agrega un renglón. */
function alAgregarRenglon(evento) {
  evento.preventDefault();
  ocultarMensaje(document.getElementById("mensaje-exito"));

  const libroId = document.getElementById("venta-libro").value;
  if (!libroId) {
    mostrarMensajeLibro("Elegí un libro de los resultados de la búsqueda.");
    return;
  }
  const libro = librosEncontrados.get(libroId);
  if (!libro) {
    mostrarMensajeLibro("El libro elegido ya no está disponible: volvé a buscarlo.");
    return;
  }

  const cantidad = leerCantidad(document.getElementById("venta-cantidad").value);
  if (cantidad === null) {
    mostrarMensajeLibro("Ingresá una cantidad entera mayor que cero.");
    return;
  }

  const resultado = agregarRenglon(libro, cantidad);
  document.getElementById("venta-cantidad").value = "1";
  pintarResumen();
  mostrarMensajeLibro("");
  mostrarExito(document.getElementById("mensaje-exito"), resultado.mensaje);
}

/** Construye la fila de un renglón del borrador. */
function crearFilaRenglon(renglon) {
  const fila = document.createElement("tr");

  const celdaLibro = document.createElement("td");
  celdaLibro.textContent = renglon.titulo;
  fila.appendChild(celdaLibro);

  const celdaCantidad = document.createElement("td");
  const entrada = document.createElement("input");
  entrada.type = "number";
  entrada.min = "1";
  entrada.step = "1";
  entrada.value = renglon.cantidad;
  entrada.dataset.libroId = String(renglon.libroId);
  entrada.setAttribute("aria-label", "Cantidad de «" + renglon.titulo + "»");
  celdaCantidad.appendChild(entrada);
  fila.appendChild(celdaCantidad);

  const celdaPrecio = document.createElement("td");
  celdaPrecio.classList.add("celda-atomica");
  celdaPrecio.textContent = formatearPrecio(renglon.precioReferencia);
  fila.appendChild(celdaPrecio);

  const celdaSubtotal = document.createElement("td");
  celdaSubtotal.classList.add("celda-atomica");
  celdaSubtotal.dataset.subtotalId = String(renglon.libroId);
  fila.appendChild(celdaSubtotal);

  const celdaAcciones = document.createElement("td");
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "boton boton--secundario";
  boton.textContent = "Quitar";
  boton.dataset.libroId = String(renglon.libroId);
  celdaAcciones.appendChild(boton);
  fila.appendChild(celdaAcciones);

  return fila;
}

/** Recalcula los subtotales estimados y el total, sin reconstruir las filas. */
function actualizarImportes() {
  let total = 0;
  renglones.forEach((renglon) => {
    const celda = document.querySelector(
      '[data-subtotal-id="' + renglon.libroId + '"]'
    );
    const cantidad = leerCantidad(renglon.cantidad);
    if (cantidad === null) {
      if (celda) {
        celda.textContent = "—";
      }
      return;
    }
    const subtotal = Number(renglon.precioReferencia) * cantidad;
    if (celda) {
      celda.textContent = formatearPrecio(subtotal);
    }
    total = total + subtotal;
  });
  document.getElementById("venta-total").textContent = formatearPrecio(total);
}

/** Dibuja el borrador completo y alterna el estado vacío. */
function pintarResumen() {
  const cuerpo = document.getElementById("venta-renglones");
  cuerpo.replaceChildren();
  renglones.forEach((renglon) => {
    cuerpo.appendChild(crearFilaRenglon(renglon));
  });
  document.getElementById("venta-estado-vacio").hidden = renglones.length > 0;
  actualizarImportes();
}

/** Guarda la cantidad que se está escribiendo y actualiza los importes. */
function alCambiarCantidad(evento) {
  const entrada = evento.target;
  if (!entrada.dataset || !entrada.dataset.libroId) {
    return;
  }
  const renglon = renglonDeLibro(Number(entrada.dataset.libroId));
  if (!renglon) {
    return;
  }
  renglon.cantidad = entrada.value;
  actualizarImportes();
}

/** Quita un renglón del borrador. */
function alQuitarRenglon(evento) {
  const boton = evento.target;
  if (!boton.dataset || !boton.dataset.libroId) {
    return;
  }
  const libroId = Number(boton.dataset.libroId);
  renglones = renglones.filter((renglon) => renglon.libroId !== libroId);
  pintarResumen();
  ocultarMensaje(document.getElementById("mensaje-exito"));
}

/* --- Validación y envío ------------------------------------------------------ */

/** Revisa el borrador antes de enviarlo. Devuelve los motivos del rechazo. */
function validarVenta() {
  const motivos = [];
  if (!clienteElegido) {
    motivos.push("Buscá y elegí un cliente para la venta.");
  }
  if (renglones.length === 0) {
    motivos.push("Agregá al menos un renglón a la venta.");
  }
  renglones.forEach((renglon) => {
    if (leerCantidad(renglon.cantidad) === null) {
      motivos.push(
        "La cantidad de «" + renglon.titulo +
        "» debe ser un número entero mayor que cero."
      );
    }
  });
  return motivos;
}

/** Habilita el botón de confirmación solo si no hay un envío en vuelo. */
function actualizarBotonConfirmar() {
  const boton = document.getElementById("venta-boton-confirmar");
  boton.disabled = enviando;
  boton.textContent = enviando ? "Registrando…" : "Registrar venta";
}

/** Envía la venta a la API con el cuerpo exacto del contrato. */
async function alConfirmarVenta(evento) {
  evento.preventDefault();
  if (enviando) {
    return;
  }
  const mensajeError = document.getElementById("ventas-mensaje-error");
  const mensajeExito = document.getElementById("mensaje-exito");
  ocultarMensaje(mensajeError);
  ocultarMensaje(mensajeExito);

  const motivos = validarVenta();
  if (motivos.length > 0) {
    mostrarError(mensajeError, motivos);
    return;
  }

  const cuerpo = {
    cliente_id: clienteElegido.id,
    renglones: renglones.map((renglon) => ({
      libro_id: renglon.libroId,
      cantidad: leerCantidad(renglon.cantidad)
    }))
  };

  enviando = true;
  actualizarBotonConfirmar();
  try {
    const venta = await Api.post("/ventas/", cuerpo);
    dibujarComprobante(venta);
    limpiarVenta();
    mostrarExito(
      mensajeExito,
      "Se registró la venta " + venta.id + " por " + formatearPrecio(venta.total) + "."
    );
  } catch (error) {
    /* 409 (cliente o libro inexistente), 422 (cuerpo inválido) y cualquier otro
       error: se muestra el mensaje del servidor y el borrador sigue igual. */
    const texto =
      error && error.mensaje ? error.mensaje : "No se pudo registrar la venta.";
    mostrarError(mensajeError, [texto]);
  } finally {
    enviando = false;
    actualizarBotonConfirmar();
  }
}

/* --- Comprobante ------------------------------------------------------------- */

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

/** Dibuja el comprobante con los importes que devolvió la API. */
function dibujarComprobante(venta) {
  document.getElementById("venta-comprobante-id").textContent = String(venta.id);
  document.getElementById("venta-comprobante-fecha").textContent = formatearFecha(venta.fecha);
  document.getElementById("venta-comprobante-cliente").textContent = venta.cliente
    ? venta.cliente.nombre
    : "";
  document.getElementById("venta-comprobante-total").textContent = formatearPrecio(venta.total);

  const cuerpo = document.getElementById("venta-comprobante-renglones");
  cuerpo.replaceChildren();
  (Array.isArray(venta.renglones) ? venta.renglones : []).forEach((renglon) => {
    const fila = document.createElement("tr");

    const celdaLibro = document.createElement("td");
    celdaLibro.textContent = renglon.titulo || "Libro " + renglon.libro_id;
    fila.appendChild(celdaLibro);

    const celdaCantidad = document.createElement("td");
    celdaCantidad.classList.add("celda-atomica");
    celdaCantidad.textContent = String(renglon.cantidad);
    fila.appendChild(celdaCantidad);

    const celdaPrecio = document.createElement("td");
    celdaPrecio.classList.add("celda-atomica");
    celdaPrecio.textContent = formatearPrecio(renglon.precio_unitario);
    fila.appendChild(celdaPrecio);

    const celdaSubtotal = document.createElement("td");
    celdaSubtotal.classList.add("celda-atomica");
    celdaSubtotal.textContent = formatearPrecio(renglon.subtotal);
    fila.appendChild(celdaSubtotal);

    cuerpo.appendChild(fila);
  });

  const enlace = document.getElementById("venta-comprobante-enlace");
  enlace.href = "historial.html?venta=" + venta.id;

  document.getElementById("venta-comprobante").hidden = false;
  document.getElementById("venta-comprobante-titulo").focus();
}

/* --- Limpieza --------------------------------------------------------------- */

/** Vacía el borrador, el cliente y los buscadores después de registrar. */
function limpiarVenta() {
  renglones = [];
  clienteElegido = null;
  document.getElementById("venta-form-cliente").reset();
  document.getElementById("venta-form-buscar-libro").reset();
  document.getElementById("venta-form-renglon").reset();
  vaciarSelectorLibros();
  document.getElementById("venta-cliente-nombre").textContent = "";
  document.getElementById("venta-cliente-elegido").hidden = true;
  ocultarMensaje(document.getElementById("venta-cliente-error"));
  mostrarMensajeLibro("");
  pintarResumen();
}

/* --- Eventos ---------------------------------------------------------------- */

/** Registra los eventos de la página. */
function iniciarVistaVentas() {
  document
    .getElementById("venta-form-cliente")
    .addEventListener("submit", alBuscarCliente);
  document
    .getElementById("venta-cliente-id")
    .addEventListener("input", alCambiarIdCliente);
  document
    .getElementById("venta-form-buscar-libro")
    .addEventListener("submit", alBuscarLibro);
  document
    .getElementById("venta-form-renglon")
    .addEventListener("submit", alAgregarRenglon);
  document
    .getElementById("venta-renglones")
    .addEventListener("input", alCambiarCantidad);
  document
    .getElementById("venta-renglones")
    .addEventListener("click", alQuitarRenglon);
  document
    .getElementById("ventas-form-venta")
    .addEventListener("submit", alConfirmarVenta);
  actualizarBotonConfirmar();
  pintarResumen();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciarVistaVentas);
} else {
  iniciarVistaVentas();
}
