/**
 * Validación compartida de los formularios Babysam (contacto y Baby Shower).
 *
 * Los formularios van con `novalidate` para que los errores salgan en español y con el estilo de
 * la marca (.form--babysam en assets/base.css), no en el globo nativo del navegador.
 *
 * Cada campo a validar lleva `data-babysam-rule` y, si es obligatorio, `data-babysam-required`.
 * Su mensaje de error se pinta en el elemento `#<id del campo>-error`.
 *
 *   required  → obligatorio (mensaje propio en data-babysam-msg).
 *   email     → correo con formato válido (obligatorio si lleva data-babysam-required).
 *   phone     → solo dígitos, espacios, "+", "-" o paréntesis, y al menos 7 dígitos.
 *   positive  → número entero desde 1.
 */

export const MENSAJES = {
  requerido: 'Este campo es obligatorio.',
  emailVacio: 'Escribe tu correo electrónico para poder responderte.',
  emailInvalido: 'Revisa tu correo: debe verse como nombre@correo.com.',
  telefonoVacio: 'Escribe tu número de teléfono.',
  telefonoInvalido: 'Revisa el teléfono: mínimo 7 números; puede llevar +, espacios o guiones.',
  positivo: 'Escribe un número desde 1.',
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TELEFONO = /^[0-9+\-\s()]+$/;

/**
 * @param {HTMLInputElement | HTMLTextAreaElement} campo
 * @returns {string} el mensaje de error, o '' si el campo está bien.
 */
export function revisar(campo) {
  const valor = campo.value.trim();
  const obligatorio = campo.hasAttribute('data-babysam-required');
  switch (campo.dataset.babysamRule) {
    case 'required':
      return valor ? '' : campo.dataset.babysamMsg || MENSAJES.requerido;
    case 'email':
      if (!valor) return obligatorio ? MENSAJES.emailVacio : '';
      return EMAIL.test(valor) ? '' : MENSAJES.emailInvalido;
    case 'phone':
      if (!valor) return obligatorio ? MENSAJES.telefonoVacio : '';
      return TELEFONO.test(valor) && valor.replace(/\D/g, '').length >= 7 ? '' : MENSAJES.telefonoInvalido;
    case 'positive':
      if (!valor) return obligatorio ? MENSAJES.requerido : '';
      return /^\d+$/.test(valor) && Number(valor) >= 1 ? '' : MENSAJES.positivo;
    default:
      return '';
  }
}

/** @param {HTMLInputElement | HTMLTextAreaElement} campo @param {string} mensaje */
export function pintar(campo, mensaje) {
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

/**
 * Engancha la validación de un formulario: al escribir borra el error de un campo que ya quedó
 * bien; al salir del campo lo revisa si tiene algo escrito.
 * @param {HTMLFormElement} form
 * @returns {() => boolean} valida todo, pinta los errores, enfoca el primero y dice si pasó.
 */
export function prepararValidacion(form) {
  const campos = /** @type {(HTMLInputElement | HTMLTextAreaElement)[]} */ ([
    ...form.querySelectorAll('[data-babysam-rule]'),
  ]);

  for (const campo of campos) {
    campo.addEventListener('input', () => {
      if (campo.getAttribute('aria-invalid') === 'true') pintar(campo, revisar(campo));
    });
    campo.addEventListener('blur', () => {
      if (campo.value.trim()) pintar(campo, revisar(campo));
    });
  }

  return () => {
    let primero = null;
    for (const campo of campos) {
      const mensaje = revisar(campo);
      pintar(campo, mensaje);
      if (mensaje && !primero) primero = campo;
    }
    if (primero) primero.focus();
    return !primero;
  };
}
