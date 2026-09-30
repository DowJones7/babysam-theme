/**
 * Caja pública de reseñas del home (sections/testimonials-carousel.liquid), en un modal
 * (dialog-component del tema). Al cerrarlo, el foco vuelve al botón "Escribe tu reseña".
 *
 * Es el formulario nativo de comentarios de Shopify (`form 'new_comment'`) sobre la entrada
 * Reseñas › Opiniones de clientes. Validación en español compartida (@theme/form-babysam) para
 * mensaje, nombre y correo; la calificación (radios) se valida acá.
 *
 * Al enviar, la calificación se guarda al inicio del cuerpo con el formato fijo «[N/5] texto»,
 * que la sección lee para pintar las estrellas. Shopify vuelve al home con `?resena=enviada`
 * (return_to del form): ahí se muestra el mensaje de éxito y se limpia el parámetro de la URL.
 */

import { prepararValidacion } from '@theme/form-babysam';

const PREFIJO = /^\[[1-5]\/5\]\s*/;
const MAXIMO = 200;

/** @param {HTMLFormElement} form */
function iniciar(form) {
  if (form.dataset.babysamListo) return;
  form.dataset.babysamListo = 'true';

  const validar = prepararValidacion(form);
  const grupo = /** @type {HTMLFieldSetElement | null} */ (form.querySelector('fieldset'));
  const errorEstrellas = grupo ? document.getElementById(grupo.getAttribute('aria-describedby') ?? '') : null;
  const cuerpo = /** @type {HTMLTextAreaElement | null} */ (form.querySelector('textarea[name="comment[body]"]'));
  const contador = cuerpo ? document.getElementById(`${cuerpo.id}-count`) : null;
  const boton = /** @type {HTMLButtonElement | null} */ (form.querySelector('button[type="submit"]'));
  const textoBoton = boton?.textContent?.trim() ?? '';

  const calificacion = () =>
    /** @type {HTMLInputElement | null} */ (form.querySelector('input[name="rating"]:checked'))?.value ?? '';

  /** @param {string} mensaje */
  const pintarEstrellas = (mensaje) => {
    if (!grupo || !errorEstrellas) return;
    if (mensaje) grupo.setAttribute('aria-invalid', 'true');
    else grupo.removeAttribute('aria-invalid');
    errorEstrellas.textContent = mensaje;
    errorEstrellas.hidden = !mensaje;
  };

  const actualizarContador = () => {
    if (!cuerpo || !contador) return;
    const largo = cuerpo.value.length;
    contador.textContent = `${largo}/${MAXIMO}`;
    contador.classList.toggle('is-limite', largo >= MAXIMO);
  };

  form.addEventListener('change', (event) => {
    if (/** @type {HTMLInputElement} */ (event.target).name === 'rating') pintarEstrellas('');
  });
  cuerpo?.addEventListener('input', actualizarContador);

  form.addEventListener('submit', (event) => {
    const camposBien = validar();
    const estrellas = calificacion();
    if (!estrellas) {
      pintarEstrellas('Elige de 1 a 5 estrellas.');
      if (camposBien) /** @type {HTMLInputElement | null} */ (form.querySelector('input[name="rating"]'))?.focus();
    }
    if (!camposBien || !estrellas || !cuerpo) {
      event.preventDefault();
      return;
    }

    cuerpo.value = `[${estrellas}/5] ${cuerpo.value.trim().replace(PREFIJO, '')}`;
    if (boton) {
      boton.disabled = true;
      boton.setAttribute('aria-busy', 'true');
      boton.textContent = 'Enviando…';
    }
  });

  // Volver con "atrás" (bfcache) restaura el botón deshabilitado y el cuerpo con el prefijo.
  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    if (cuerpo) cuerpo.value = cuerpo.value.replace(PREFIJO, '');
    actualizarContador();
    if (boton) {
      boton.disabled = false;
      boton.removeAttribute('aria-busy');
      boton.textContent = textoBoton;
    }
  });
}

function mostrarExito() {
  const url = new URL(window.location.href);
  if (url.searchParams.get('resena') !== 'enviada') return;

  const exito = /** @type {HTMLElement | null} */ (document.querySelector('.resena-form__exito'));
  if (exito) {
    exito.hidden = false;
    exito.focus({ preventScroll: true });
    exito.closest('.resenas-cta')?.scrollIntoView({ block: 'center' });
  }

  // Que recargar la página no vuelva a mostrar el mensaje.
  url.searchParams.delete('resena');
  history.replaceState(history.state, '', url);
}

for (const form of document.querySelectorAll('form[data-babysam-resena]')) {
  iniciar(/** @type {HTMLFormElement} */ (form));
}

// El <dialog> nativo intenta devolver el foco al cerrar, pero el componente del tema restaura el
// scroll justo antes: se fija explícito, sin mover la página.
for (const componente of document.querySelectorAll('.resenas-cta')) {
  const abrir = /** @type {HTMLElement | null} */ (componente.querySelector('.resenas-cta__abrir'));
  componente.addEventListener('dialog:close', () => abrir?.focus({ preventScroll: true }));
}
mostrarExito();
