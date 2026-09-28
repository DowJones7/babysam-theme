/**
 * Monto personalizado del Bono de Regalo (blocks/gift-card-custom-amount.liquid).
 *
 * El monto NUNCA toca el carrito: el campo no tiene `name`, vive fuera del <form> del producto
 * y lo único que produce es el enlace a WhatsApp. Babysam cobra con un pedido preliminar y
 * emite el bono a mano desde el admin.
 *
 *   1. La píldora abre y cierra el panel. Cerrado queda `inert`: fuera del orden de tabulación
 *      y de los lectores de pantalla. La animación es solo CSS (grid-template-rows).
 *   2. El campo acepta solo dígitos y los agrupa con puntos de miles mientras se escribe,
 *      conservando la posición del cursor.
 *   3. "Enviar por WhatsApp" es un <a target="_blank" rel="noopener"> real: el href se
 *      reconstruye en cada tecla y el clic se cancela solo si el monto no llega al mínimo.
 */

const formatoCOP = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });

/** @param {string} texto */
function soloDigitos(texto) {
  return texto.replace(/\D/g, '').replace(/^0+/, '');
}

/** @param {string} digitos */
function conPuntos(digitos) {
  // Intl en es-CO agrupa con punto; se fuerza por si el navegador trae otros datos de locale.
  return digitos ? formatoCOP.format(Number(digitos)).replace(/[\s,  ]/g, '.') : '';
}

class GiftCardCustomAmount extends HTMLElement {
  connectedCallback() {
    this.toggle = this.querySelector('[data-gcca-toggle]');
    this.panel = this.querySelector('[data-gcca-panel]');
    this.input = this.querySelector('[data-gcca-input]');
    this.enviar = this.querySelector('[data-gcca-send]');
    this.error = this.querySelector('[data-gcca-error]');
    if (!this.toggle || !this.panel || !this.input || !this.enviar || !this.error) return;

    this.minimo = Number(this.dataset.minAmount) || 0;
    this.numero = this.dataset.whatsapp || '';
    this.plantilla = this.dataset.message || '';
    this.error.textContent = this.error.textContent.replace('[minimo]', `$${conPuntos(String(this.minimo))}`);

    this.toggle.addEventListener('click', () => this.#alternar());
    this.input.addEventListener('input', () => this.#alEscribir());
    this.input.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      if (this.#validar(true)) this.enviar.click();
    });
    this.enviar.addEventListener('click', (e) => {
      if (!this.#validar(true)) e.preventDefault();
    });

    this.#actualizarEnlace();
  }

  #alternar() {
    const abrir = this.toggle.getAttribute('aria-expanded') !== 'true';
    this.toggle.setAttribute('aria-expanded', String(abrir));
    this.toggleAttribute('data-open', abrir);
    this.panel.inert = !abrir;
    if (abrir) this.input.focus({ preventScroll: true });
  }

  #alEscribir() {
    const { input } = this;
    const cursor = input.selectionStart ?? input.value.length;
    const digitosAntes = soloDigitos(input.value.slice(0, cursor)).length;
    const digitos = soloDigitos(input.value).slice(0, 12);
    input.value = conPuntos(digitos);

    // Recoloca el cursor después del mismo número de dígitos que tenía a su izquierda.
    let pos = 0;
    for (let vistos = 0; pos < input.value.length && vistos < digitosAntes; pos++) {
      if (/\d/.test(input.value[pos])) vistos++;
    }
    input.setSelectionRange(pos, pos);

    // Mientras escribe no se le grita: el error solo se borra si ya quedó válido.
    if (this.input.getAttribute('aria-invalid') === 'true') this.#validar(false);
    this.#actualizarEnlace();
  }

  #monto() {
    return Number(soloDigitos(this.input.value)) || 0;
  }

  /** @param {boolean} mostrar Si se muestra el error cuando el monto no alcanza. */
  #validar(mostrar) {
    const ok = this.#monto() >= this.minimo && this.#monto() > 0;
    if (ok) {
      this.input.removeAttribute('aria-invalid');
      this.error.hidden = true;
    } else if (mostrar) {
      this.input.setAttribute('aria-invalid', 'true');
      this.error.hidden = false;
      this.input.focus();
    }
    return ok;
  }

  #actualizarEnlace() {
    // {monto} lleva solo el número con puntos: el "$" (si va) es parte del texto editable.
    const mensaje = this.plantilla.replaceAll('{monto}', conPuntos(String(this.#monto())));
    // api.whatsapp.com y no wa.me: la redirección de wa.me cambia los emojis por "�" en
    // WhatsApp Web y escritorio (en el celular abre la app directo y no se nota).
    this.enviar.href = `https://api.whatsapp.com/send?phone=${this.numero}&text=${encodeURIComponent(mensaje)}`;
  }
}

if (!customElements.get('gift-card-custom-amount')) {
  customElements.define('gift-card-custom-amount', GiftCardCustomAmount);
}
