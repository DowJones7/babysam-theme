/**
 * Pegamento de accesibilidad para el drawer de catálogo.
 *
 * Todo el comportamiento pesado (abrir, cerrar con Escape, cerrar al hacer clic fuera, backdrop
 * y bloqueo del scroll del body) ya lo resuelve `dialog-component` en assets/dialog.js. Acá solo
 * queda lo que ese componente no cubre:
 *
 *   1. mantener `aria-expanded` del botón en sincronía con el estado del panel;
 *   2. devolver el foco al botón cuando el panel se cierra.
 *
 * `DialogComponent` emite `dialog:open` y `dialog:close` sobre sí mismo. Son CustomEvent sin
 * `bubbles`, así que hay que escucharlos en el propio <dialog-component>, no en document.
 */

const SELECTOR = 'dialog-component.catalog-drawer';

/** @param {Element} root */
function conectar(root) {
  const trigger = root.querySelector('.catalog-drawer__trigger');
  const dialog = root.querySelector('dialog');
  if (!trigger || !dialog) return;
  if (root.hasAttribute('data-catalog-drawer-ready')) return;
  root.setAttribute('data-catalog-drawer-ready', '');

  root.addEventListener('dialog:open', () => {
    trigger.setAttribute('aria-expanded', 'true');
  });

  root.addEventListener('dialog:close', () => {
    trigger.setAttribute('aria-expanded', 'false');

    // El navegador suele devolver el foco solo al cerrar un <dialog>, pero no siempre: si el
    // cierre vino de un clic en el backdrop el foco puede quedar en <body>. Solo lo forzamos
    // cuando quedó perdido, para no pisar un foco que el usuario haya movido a propósito.
    const activo = document.activeElement;
    const perdido = !activo || activo === document.body || dialog.contains(activo);
    if (perdido) trigger.focus();
  });
}

function iniciar() {
  for (const root of document.querySelectorAll(SELECTOR)) conectar(root);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciar, { once: true });
} else {
  iniciar();
}

// El header se re-renderiza en algunas navegaciones del tema (section rendering), así que
// reconectamos si aparece un drawer nuevo. El guard `data-catalog-drawer-ready` evita duplicar
// listeners sobre uno que ya estaba conectado.
document.addEventListener('shopify:section:load', iniciar);
