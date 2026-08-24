(function () {
  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (typeof AOS === 'undefined') return;
    AOS.init({
      duration: 300,
      easing: 'ease-out',
      once: true,
      offset: 40,
      disable: prefersReducedMotion,
    });
  });
})();
