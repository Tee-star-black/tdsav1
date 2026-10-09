(function () {
  'use strict';

  if (window.__TDS_UX_V4__) return;
  window.__TDS_UX_V4__ = true;

  function installAutoHideHeader() {
    var nav = document.querySelector('body > nav:not(.tds-mobile-nav), nav:not(.tds-mobile-nav)');
    if (!nav) return;

    nav.classList.add('tds-autohide-nav');

    var lastY = Math.max(window.scrollY || 0, 0);
    var ticking = false;
    var threshold = 8;
    var hideAfter = 88;

    function update() {
      var currentY = Math.max(window.scrollY || 0, 0);
      var delta = currentY - lastY;

      nav.classList.toggle('tds-nav-scrolled', currentY > 12);

      if (currentY <= hideAfter || nav.contains(document.activeElement) || nav.querySelector('[aria-expanded="true"]')) {
        nav.classList.remove('tds-nav-hidden');
      } else if (delta > threshold) {
        nav.classList.add('tds-nav-hidden');
      } else if (delta < -threshold) {
        nav.classList.remove('tds-nav-hidden');
      }

      lastY = currentY;
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    window.addEventListener('focus', function () {
      nav.classList.remove('tds-nav-hidden');
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Tab') nav.classList.remove('tds-nav-hidden');
    });

    update();
  }

  function init() {
    installAutoHideHeader();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
