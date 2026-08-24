(function () {
  function initCarousel(root) {
    if (root.dataset.carouselInit) return;
    root.dataset.carouselInit = 'true';

    var slider = root.querySelector('[data-carousel-track]') || root;
    var isDown = false;
    var moved = false;
    var startX = 0;
    var startScrollLeft = 0;

    function snapToNearest() {
      var items = slider.children;
      if (!items.length) return;
      var closest = null;
      var closestDist = Infinity;
      for (var i = 0; i < items.length; i++) {
        var dist = Math.abs(items[i].offsetLeft - slider.scrollLeft);
        if (dist < closestDist) {
          closestDist = dist;
          closest = items[i];
        }
      }
      if (closest) {
        slider.scrollTo({ left: closest.offsetLeft, behavior: 'smooth' });
      }
    }

    function endDrag() {
      if (!isDown) return;
      isDown = false;
      slider.classList.remove('is-dragging');
      snapToNearest();
    }

    slider.addEventListener('mousedown', function (e) {
      isDown = true;
      moved = false;
      slider.classList.add('is-dragging');
      startX = e.pageX;
      startScrollLeft = slider.scrollLeft;
    });

    slider.addEventListener('mousemove', function (e) {
      if (!isDown) return;
      e.preventDefault();
      var walk = e.pageX - startX;
      if (Math.abs(walk) > 5) moved = true;
      slider.scrollLeft = startScrollLeft - walk;
    });

    slider.addEventListener('mouseup', endDrag);
    slider.addEventListener('mouseleave', endDrag);

    slider.addEventListener(
      'click',
      function (e) {
        if (moved) {
          e.preventDefault();
          e.stopPropagation();
        }
        moved = false;
      },
      true
    );

    var prevBtn = root.querySelector('[data-carousel-prev]');
    var nextBtn = root.querySelector('[data-carousel-next]');

    function updateArrows() {
      if (!prevBtn && !nextBtn) return;
      var maxScroll = slider.scrollWidth - slider.clientWidth;
      if (prevBtn) prevBtn.disabled = slider.scrollLeft <= 1;
      if (nextBtn) nextBtn.disabled = slider.scrollLeft >= maxScroll - 1;
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        slider.scrollBy({ left: -slider.clientWidth, behavior: 'smooth' });
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        slider.scrollBy({ left: slider.clientWidth, behavior: 'smooth' });
      });
    }

    slider.addEventListener('scroll', updateArrows);
    window.addEventListener('resize', updateArrows);
    updateArrows();
  }

  function init() {
    var roots = document.querySelectorAll('[data-carousel-drag]');
    for (var i = 0; i < roots.length; i++) initCarousel(roots[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
