/**
 * Formulario "Crea tu Lista de Baby Shower" (blocks/baby-shower-form.liquid).
 *
 * No guarda nada en Shopify: valida en español (@theme/form-babysam) y abre WhatsApp con los datos
 * ya escritos. El inicio y el cierre del mensaje salen de los ajustes del bloque; los datos, del
 * formulario. Las líneas opcionales (fecha, invitados, comentarios) se omiten si están vacías.
 *
 *   ¡Hola, Babysam! 👋🍼
 *   Quiero agendar una cita para crear mi *Lista de Baby Shower* 🎁
 *
 *   👶 *Futuros papás:* Ana y Carlos
 *   📧 *Correo:* ana@correo.com
 *   📱 *Teléfono:* 310 123 4567
 *   📅 *Fecha para la cita:* 15 de octubre de 2026
 *   🎉 *Invitados estimados:* 30
 *   💬 *Comentarios:* …
 *
 *   ¿Me confirman la disponibilidad? 💕
 *
 * Enlace a https://api.whatsapp.com/send (no wa.me: su redirección rompe los emojis en WhatsApp
 * Web y escritorio).
 */

import { prepararValidacion } from '@theme/form-babysam';

/** "3101234567" / "+57 310 123 4567" → "310 123 4567"; otros formatos quedan como se escribieron. */
export function telefonoLegible(valor) {
  let d = valor.replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('57')) d = d.slice(2);
  return d.length === 10 ? `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}` : valor.trim();
}

/** "2026-10-15" → "15 de octubre de 2026" (fecha local, sin corrimiento por zona horaria). */
export function fechaLegible(valor) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
  if (!m) return valor;
  const fecha = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * @param {{intro: string, cierre: string, padres: string, correo: string, telefono: string,
 *          fecha?: string, invitados?: string, comentarios?: string}} d
 */
export function armarMensaje(d) {
  const lineas = [
    `👶 *Futuros papás:* ${d.padres}`,
    `📧 *Correo:* ${d.correo}`,
    `📱 *Teléfono:* ${telefonoLegible(d.telefono)}`,
  ];
  if (d.fecha) lineas.push(`📅 *Fecha para la cita:* ${fechaLegible(d.fecha)}`);
  if (d.invitados) lineas.push(`🎉 *Invitados estimados:* ${d.invitados}`);
  if (d.comentarios) lineas.push(`💬 *Comentarios:* ${d.comentarios}`);
  return [d.intro.trim(), lineas.join('\n'), d.cierre.trim()].filter(Boolean).join('\n\n');
}

/** @param {HTMLFormElement} form */
function iniciar(form) {
  if (form.dataset.babysamListo) return;
  form.dataset.babysamListo = 'true';

  const validar = prepararValidacion(form);
  const estado = form.querySelector('.baby-shower-form__estado');
  const respaldo = form.querySelector('.baby-shower-form__respaldo');

  /** @param {string} campo */
  const valor = (campo) => form.querySelector(`[data-bs-campo="${campo}"]`)?.value.trim() ?? '';

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (estado) estado.hidden = true;
    if (!validar()) return;

    const numero = form.dataset.whatsapp || '';
    if (!numero) return;

    const mensaje = armarMensaje({
      intro: form.dataset.intro || '',
      cierre: form.dataset.cierre || '',
      padres: valor('padres'),
      correo: valor('correo'),
      telefono: valor('telefono'),
      fecha: valor('fecha'),
      invitados: valor('invitados'),
      comentarios: valor('comentarios'),
    });
    const url = `https://api.whatsapp.com/send?phone=${numero}&text=${encodeURIComponent(mensaje)}`;

    window.open(url, '_blank', 'noopener');
    // Con "noopener" window.open no dice si el navegador bloqueó la pestaña: se deja siempre un
    // enlace de respaldo con la misma URL.
    if (respaldo) respaldo.setAttribute('href', url);
    if (estado) estado.hidden = false;
  });
}

for (const form of document.querySelectorAll('form[data-babysam-bs]')) {
  iniciar(/** @type {HTMLFormElement} */ (form));
}
