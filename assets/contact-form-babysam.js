/**
 * Formulario de contacto Babysam (snippets/contact-form.liquid).
 *
 * El formulario va con `novalidate`: así los mensajes de error salen en español y con el estilo
 * de la marca, y no en el globo nativo del navegador (que sale en el idioma del navegador).
 *
 *   1. Al enviar valida: correo obligatorio y con formato válido; teléfono opcional, pero si se
 *      escribe, solo dígitos, espacios, "+", "-" o paréntesis y al menos 7 dígitos.
 *   2. Los errores van junto a cada campo (aria-invalid + aria-describedby) y el foco salta al
 *      primero con problemas. Al corregir un campo, su error se borra solo.
 *   3. Si todo está bien, el botón queda deshabilitado con "Enviando…" hasta que la página
 *      recarga con la respuesta de Shopify. Si se vuelve con "atrás" (bfcache) se restablece.
 */

const MENSAJES = {
  emailVacio: 'Escribe tu correo electrónico para poder responderte.',
  emailInvalido: 'Revisa tu correo: debe verse como nombre@correo.com.',
  telefonoInvalido: 'Revisa el teléfono: mínimo 7 números; puede llevar +, espacios o guiones.',
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TELEFONO = /^[0-9+\-\s()]+$/;

/** @param {HTMLInputElement} campo @returns {string} mensaje de error, o '' si está bien */
function revisar(campo) {
  const valor = campo.value.trim();
  switch (campo.dataset.babysamRule) {
    case 'email':
      if (!valor) return MENSAJES.emailVacio;
      return EMAIL.test(valor) ? '' : MENSAJES.emailInvalido;
    case 'phone':
      if (!valor) return '';
      return TELEFONO.test(valor) && valor.replace(/\D/g, '').length >= 7 ? '' : MENSAJES.telefonoInvalido;
    default:
      return '';
  }
}

/** @param {HTMLInputElement} campo @param {string} mensaje */
function pintar(campo, mensaje) {
  const error = document.getElementById(`${campo.id}-error`);
  if (mensaje) {
    campo.setAttribute('aria-invalid', 'true');
  } else {
    campo.removeAttribute('aria-invalid');
  }
  if (error) {
    error.textContent = mensaje;
    error.hidden = !mensaje;
  }
}

/** @param {HTMLFormElement} form */
function iniciar(form) {
  if (form.dataset.babysamListo) return;
  form.dataset.babysamListo = 'true';

  const campos = /** @type {HTMLInputElement[]} */ ([...form.querySelectorAll('[data-babysam-rule]')]);
  const boton = /** @type {HTMLButtonElement | null} */ (form.querySelector('button[type="submit"]'));
  const textoBoton = boton?.textContent?.trim() ?? '';

  for (const campo of campos) {
    campo.addEventListener('input', () => {
      if (campo.getAttribute('aria-invalid') === 'true') pintar(campo, revisar(campo));
    });
    campo.addEventListener('blur', () => {
      if (campo.value.trim()) pintar(campo, revisar(campo));
    });
  }

  form.addEventListener('submit', (event) => {
    let primero = null;
    for (const campo of campos) {
      const mensaje = revisar(campo);
      pintar(campo, mensaje);
      if (mensaje && !primero) primero = campo;
    }

    if (primero) {
      event.preventDefault();
      primero.focus();
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
