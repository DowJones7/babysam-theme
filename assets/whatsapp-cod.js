/**
 * Botón "Compra por WhatsApp y paga contraentrega" (blocks/whatsapp-cod.liquid).
 *
 * El mensaje (producto, variante, precio, URL) lo arma Liquid con los datos reales de Shopify.
 * Acá solo se mantiene al día cuando el cliente cambia de variante: el tema dispara
 * `variant:update` (ThemeEvents.variantUpdate, assets/events.js) con `detail.data.html`, la
 * sección ya renderizada por el servidor para la variante nueva. De ese HTML se toma el href de
 * este mismo bloque, igual que product-price.js toma el precio. Nada de formatear precios en JS.
 */

import { ThemeEvents } from '@theme/events';

class WhatsappCod extends HTMLElement {
  #section = null;

  connectedCallback() {
    this.#section = this.closest('.shopify-section, dialog');
    this.#section?.addEventListener(ThemeEvents.variantUpdate, this.#alCambiarVariante);
  }

  disconnectedCallback() {
    this.#section?.removeEventListener(ThemeEvents.variantUpdate, this.#alCambiarVariante);
  }

  /** @param {Event & {detail: {data: {html?: Document, newProduct?: {id: string}}}}} event */
  #alCambiarVariante = (event) => {
    const { html, newProduct } = event.detail?.data ?? {};
    if (newProduct) {
      this.dataset.productId = newProduct.id;
    } else if (event.target instanceof HTMLElement && event.target.dataset.productId && event.target.dataset.productId !== this.dataset.productId) {
      return;
    }

    const enlace = this.querySelector('[data-wa-cod]');
    const id = enlace?.getAttribute('data-wa-cod');
    const nuevo = id && html?.querySelector(`[data-wa-cod="${CSS.escape(id)}"]`);
    const href = nuevo?.getAttribute('href');
    if (enlace && href && enlace.getAttribute('href') !== href) enlace.setAttribute('href', href);
  };
}

if (!customElements.get('whatsapp-cod')) {
  customElements.define('whatsapp-cod', WhatsappCod);
}
