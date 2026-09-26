/**
 * Panel "Nuestras tiendas".
 *
 * Todo el comportamiento del dialog (Escape, clic fuera, backdrop, foco, bloqueo de scroll)
 * lo resuelve `dialog-component` en assets/dialog.js. Acá solo va lo que ese componente no
 * cubre:
 *
 *   1. Disparador universal: cualquier <a> cuyo hash sea exactamente #tiendas abre el panel
 *      sin navegar. Así el ítem del menú principal, el acceso del drawer de catálogo y un
 *      enlace compartido apuntan todos al mismo lugar, sin tocar el markup del menú.
 *   2. Apertura automática si se entra directo a /#tiendas.
 *   3. Carga diferida de los mapas: los <iframe> salen del Liquid con `data-src` y sin `src`.
 *      El header se renderiza en TODAS las páginas, así que sin esto cada visita pediría dos
 *      iframes a Google aunque nadie abra el panel. Se asignan una sola vez, en la primera
 *      apertura.
 *   4. Nunca dos dialogs encimados: si el drawer de catálogo está abierto se cierra y se
 *      ESPERA a que termine su animación antes de abrir este.
 */

const ID_PANEL = 'stores-panel';
const ID_DRAWER = 'catalog-drawer';
const HASH = '#tiendas';

let mapasCargados = false;

/** @param {string} id */
function componente(id) {
  return document.querySelector(`dialog-component#${id}`);
}

/** @param {Element | null} cmp */
function estaAbierto(cmp) {
  const d = cmp?.querySelector('dialog');
  return Boolean(d && d.open);
}

/**
 * Asigna el src de los mapas. Idempotente: corre una sola vez por carga de página.
 * @param {Element} root
 */
function cargarMapas(root) {
  if (mapasCargados) return;
  mapasCargados = true;
  for (const iframe of root.querySelectorAll('iframe[data-src]')) {
    const src = iframe.getAttribute('data-src');
    if (!src) continue;
    iframe.setAttribute('src', src);
    iframe.removeAttribute('data-src');
  }
}

async function abrirPanel() {
  await customElements.whenDefined('dialog-component');

  const panel = componente(ID_PANEL);
  if (!panel || typeof panel.showDialog !== 'function') return;

  // Si el drawer de catálogo está abierto, primero se cierra del todo. `closeDialog` es
  // async y resuelve recién cuando terminó la animación de salida, así que el await evita
  // que los dos paneles se pisen.
  const drawer = componente(ID_DRAWER);
  if (estaAbierto(drawer) && typeof drawer.closeDialog === 'function') {
    try {
      await drawer.closeDialog();
    } catch {
      /* si falla el cierre igual abrimos: es preferible a dejar al usuario sin panel */
    }
  }

  if (estaAbierto(panel)) return;

  cargarMapas(panel);
  panel.showDialog();
}

/** Devuelve el hash del <a>, resolviendo rutas relativas como "/#tiendas". */
function hashDelEnlace(a) {
  try {
    return new URL(a.getAttribute('href') || '', window.location.href).hash;
  } catch {
    return '';
  }
}

document.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const enlace = target.closest('a[href*="#tiendas"]');
  if (!enlace) return;
  // Comparación exacta y no `includes`: así un /#tiendas-otra-cosa no dispara el panel.
  if (hashDelEnlace(enlace) !== HASH) return;

  event.preventDefault();
  abrirPanel();
});

function alCargar() {
  if (window.location.hash === HASH) abrirPanel();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', alCargar, { once: true });
} else {
  alCargar();
}
