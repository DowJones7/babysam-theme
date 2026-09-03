/* ============================================================================
   Babysam — disparadores por scroll para las animaciones de rebote
   ----------------------------------------------------------------------------
   Solo se encarga de las animaciones que entran "al hacer scroll hasta ahí,
   una sola vez". Los hovers y el scale-in de carga del Hero son 100% CSS
   (assets/babysam-animations.css).

   Patrón: se observa un CONTENEDOR disparador; cuando entra al viewport se
   revelan sus elementos objetivo con un stagger, y se deja de observar (una
   sola vez). Se usa el contenedor y no cada ítem porque en los carruseles
   horizontales (testimonios) los ítems de más a la derecha nunca llegan a
   intersectar el viewport y se quedarían invisibles.

   No arranca bajo prefers-reduced-motion: reduce (igual que AOS, que se
   deshabilita vía su callback `disable` en assets/aos-init.js). Si el JS no
   corre, los elementos quedan visibles: la clase .bs-reveal (opacity:0) solo
   se agrega desde acá.
   ========================================================================== */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var supportsIO = 'IntersectionObserver' in window;

  function toArray(nodeList) {
    return Array.prototype.slice.call(nodeList);
  }

  function reveal(elements, variant, stagger) {
    elements.forEach(function (el, i) {
      window.setTimeout(function () {
        el.classList.add('bs-in');
      }, (stagger || 0) * i);
    });
  }

  /**
   * Cuando `trigger` entra al viewport (una sola vez), revela `targets` con
   * un stagger. Marca los targets con .bs-reveal de una vez (estado oculto).
   * @param {Element} trigger
   * @param {Element[]} targets
   * @param {string} variant  'zoombounce' | 'bouncein'
   * @param {number} stagger  ms entre elementos consecutivos
   */
  function revealWhenVisible(trigger, targets, variant, stagger) {
    if (!trigger || !targets.length) return;

    targets.forEach(function (el) {
      el.classList.add('bs-reveal', 'bs-reveal--' + variant);
    });

    if (!supportsIO) {
      reveal(targets, variant, stagger);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          observer.disconnect();
          reveal(targets, variant, stagger);
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px' }
    );
    observer.observe(trigger);
  }

  function sectionBySuffix(suffix) {
    return document.querySelector('[id$="__' + suffix + '"]');
  }

  function init() {
    // --- 2. Fila de confianza: zoom-bounce por ícono, 180ms de stagger ------
    var trust = sectionBySuffix('trust_row');
    if (trust) {
      revealWhenVisible(
        trust,
        toArray(trust.querySelectorAll('.icon-block')),
        'zoombounce',
        180
      );
    }

    // --- 5. Banner "Regala Felicidad": precio + CTA entran juntos ----------
    var banner = sectionBySuffix('section_qNjNr8');
    if (banner) {
      var cta = banner.querySelector('.group-block--width-custom');
      if (cta) revealWhenVisible(banner, [cta], 'bouncein', 0);
    }

    // --- 6. Testimonios: cada tarjeta, stagger corto ----------------------
    var testimonials = sectionBySuffix('testimonials_row');
    if (testimonials) {
      revealWhenVisible(
        testimonials,
        toArray(testimonials.querySelectorAll('.testimonial-card-item')),
        'bouncein',
        90
      );
    }

    // --- 6. Instagram: cada foto de la grilla, stagger corto -------------
    var instagram = sectionBySuffix('instagram_feed');
    if (instagram) {
      revealWhenVisible(
        instagram,
        toArray(instagram.querySelectorAll('.instagram-feed-item')),
        'bouncein',
        70
      );
    }

    // --- 7. Quienes Somos: Visión/Misión, fade+slide sin rebote ----------
    var misionVision = document.querySelector('.mision-vision');
    if (misionVision) {
      revealWhenVisible(
        misionVision,
        toArray(misionVision.querySelectorAll('.mision-vision__item')),
        'fadeslide',
        150
      );
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // En el theme editor, al re-renderizar una sección sus nodos son nuevos y
  // pierden el estado .bs-reveal — se re-inicializa para que la animación se
  // vuelva a ver al inspeccionarla. (Sin efecto en la tienda pública.)
  document.addEventListener('shopify:section:load', init);
})();
