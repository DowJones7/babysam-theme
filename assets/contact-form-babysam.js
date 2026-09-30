/**
 * Formulario de contacto Babysam (snippets/contact-form.liquid).
 *
 * La validación en español es la compartida (@theme/form-babysam, assets/form-babysam.js):
 * correo obligatorio y con formato válido; teléfono opcional, pero si se escribe, con formato
 * válido. Si todo está bien, el botón queda deshabilitado con "Enviando…" hasta que la página
 * recarga con la respuesta de Shopify. Si se vuelve con "atrás" (bfcache) se restablece.
 */

import { prepararValidacion } from '@theme/form-babysam';

/** @param {HTMLFormElement} form */
function iniciar(form) {
  if (form.dataset.babysamListo) return;
  form.dataset.babysamListo = 'true';

  const validar = prepararValidacion(form);
  const boton = /** @type {HTMLButtonElement | null} */ (form.querySelector('button[type="submit"]'));
  const textoBoton = boton?.textContent?.trim() ?? '';

  form.addEventListener('submit', (event) => {
    if (!validar()) {
      event.preventDefault();
      return;
    }

    if (boton) {
      boton.disabled = true;
      boton.setAttribute('aria-busy', 'true');
      boton.textContent = 'Enviando…';
    }
  });

  // Volver con "atrás" puede restaurar la página con el botón aún deshabilitado.
  window.addEventListener('pageshow', (event) => {
    if (event.persisted && boton) {
      boton.disabled = false;
      boton.removeAttribute('aria-busy');
      boton.textContent = textoBoton;
    }
  });
}

for (const form of document.querySelectorAll('form[data-babysam-contact]')) {
  iniciar(/** @type {HTMLFormElement} */ (form));
}
